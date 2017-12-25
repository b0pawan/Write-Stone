import {Component, NgZone, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {Logger} from "../core/logger/logger";
import {Router} from "@angular/router";
import {TitleService} from "../core/services/title.service";
import {ObservableMedia} from "@angular/flex-layout";
import {Observable} from "rxjs/Observable";
import {take} from "rxjs/operators";
import {ElectronService} from "ngx-electron";
import {UtilityService} from "../core/services/utility.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import "rxjs/add/observable/interval";
import "rxjs/add/observable/timer";
import {PickerService} from "../electron/services/picker.service";
import {Subscription} from "rxjs/Subscription";
import {VideoSourceService} from "../electron/services/video.sources.";

declare var MediaRecorder: any;
declare var navigator: any;

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {
    public disabled: boolean;
    public stopped: boolean;
    disabledObs: Observable<boolean>;
    stoppedObs: Observable<boolean>;
    className: string;
    localStream: any;
    microAudioStream: any;
    recordedChunks: any[];
    numRecordedChunks: number;
    recorder: any;
    includeMic: boolean;
    includeSysAudio: boolean;
    public disableButtonSubject: BehaviorSubject<boolean>;
    public stopButtonSubject: BehaviorSubject<boolean>;
    disabledSubscription: Subscription;
    stoppedSubscription: Subscription;

    constructor(private logger: Logger, private router: Router, private media: ObservableMedia, private titleService: TitleService, private _electronService: ElectronService,
                private utilityService: UtilityService, private pickerService: PickerService, private ngZone: NgZone, private videoSourceService: VideoSourceService) {
        this.className = 'HomeComponent';
        this.recordedChunks = [];
        this.numRecordedChunks = 0;
        this.includeMic = false;
        this.includeSysAudio = false;
        this.disableButtonSubject = new BehaviorSubject<boolean>(false);
        this.stopButtonSubject = new BehaviorSubject<boolean>(false);
        this.disabledObs = this.disableButtonSubject.asObservable();
        this.stoppedObs = this.stopButtonSubject.asObservable();
    }


    ngOnInit() {
        this.titleService.setTitle("home");
        this.titleService.setMetaTags("home");
        this._electronService.ipcRenderer.on('source-id-selected', (event, sourceId) => {
            this.ngZone.run(() => {
                if (!sourceId) return;
                this.logger.debug(this.className, sourceId);
                this.onAccessApproved(sourceId);
            });
        });

        this._electronService.ipcRenderer.on('picker-closed-status', (event, state) => {
            // console.log(' picker-closed-status ', state);
            this.ngZone.run(() => {
                this.logger.debug(this.className, ' picker status ', state);
                this.disableButtonSubject.next(state);
            });
        });

        this.disabledSubscription = this.disabledObs.subscribe((state) => {
            this.logger.debug(this.className, ' play disabled ', state);
            this.disabled = state;
        });

        this.stoppedSubscription = this.stoppedObs.subscribe((state) => {
            this.logger.debug(this.className, ' Recording Stopped ', state);
            this.stopped = state;
        });

    }


    onAccessApproved(id) {
        if (!id) {
            this.logger.debug('Access rejected.');
            return
        }
        this.logger.debug(this.className,'Window ID: ', id);
        this.logger.debug(this.className,'Audio: ', this.includeMic);
        this.logger.debug(this.className,'System Audio: ', this.includeSysAudio);

        const callbackFunc = (stream) => {
            this.ngZone.run(() => {
                this.localStream = stream;
                this.localStream.onended = () => {
                    this.logger.debug(this.className, 'screen capture ', 'Media stream ended.')
                };
                let videoTracks = this.localStream.getVideoTracks();
                /*if (this.includeMic) {
                    this.logger.debug('Adding audio track.');
                    let audioTracks = this.microAudioStream.getAudioTracks();
                    this.localStream.addTrack(audioTracks[0]);
                }*/
                if (this.includeSysAudio) {
                    this.logger.debug(this.className, 'screen capture ','Adding system audio track.');
                    let audioTracks = this.localStream.getAudioTracks();
                    /*if (audioTracks.length < 1) {
                        this.logger.debug('screen capture ', 'No audio track in screen stream.');
                    }*/
                    this.localStream.addTrack(audioTracks[0]);
                } else {
                    this.logger.debug(this.className, 'screen capture ', 'Not adding audio track.')
                }
                try {
                    this.logger.debug(this.className, 'screen capture ', 'Start recording the stream.');
                    this.recorder = new MediaRecorder(this.localStream);
                    this.recorder.ondataavailable = (event) => {
                        if (event.data && event.data.size > 0) {
                            this.recordedChunks.push(event.data);
                            this.numRecordedChunks += event.data.byteLength;
                        }
                    };
                    this.recorder.onstop = () => {
                        this.logger.debug(this.className,'screen capture ', 'recorderOnStop fired')
                    };
                    this.recorder.start();
                    this.logger.debug(this.className, 'screen capture ', 'Recorder is started.');
                    // video['type'] = 'video/webm';
                    let video = this.utilityService.document.querySelector('video');
                    video.src = URL.createObjectURL(this.localStream);
                    video.controls = true;
                    // this.videoSourceService.source.next(video);
                    // this.disableButtonSubject.next(true);;
                } catch (e) {
                    this.logger.error(this.className,'screen capture ', 'Exception while creating MediaRecorder: ', e);
                    return
                }
            });
        };

        this.logger.debug(this.className, ' system mic = ', this.includeSysAudio);
        if (this.includeSysAudio) {
            navigator.webkitGetUserMedia({
                audio: true,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: id,
                        maxWidth: window.screen.width,
                        maxHeight: window.screen.height
                    }
                }
            }, callbackFunc, (err) => {
                this.logger.debug(this.className,'screen capture ', ' getUserMedia() with audio failed.');
                this.logger.error(this.className, err);
            })
        } else {
            navigator.webkitGetUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: id,
                        maxWidth: window.screen.width,
                        maxHeight: window.screen.height
                    }
                }
            }, callbackFunc, (err) => {
                this.logger.debug(this.className,'screen capture ', ' getUserMedia() without audio failed.');
                this.logger.error(this.className, err);;
            })
        }
    };

    getFileName() {
        return "Write-Stone-Stream-" + Date.now() + '.webm';
    };

    playVideo() {
        this._electronService.remote.dialog.showOpenDialog({properties: ['openFile']}, (filename) => {
            this.ngZone.run(() => {
                this.logger.debug(filename);
                // const video = {};
                let video = this.utilityService.document.querySelector('video');
                video.muted = false;
                video.src = filename;
                video.controls = true;
                // video['type'] = 'video/webm';
                // this.videoSourceService.source.next(video);
            });
        });
    };

    microAudioCheck() {
        this.ngZone.run(() => {
            // this.includeSysAudio = false;
            // Mute video so we don't play loopback audio.
            /*const video = this.utilityService.document.querySelector('video');
            video.muted = true;*/
            this.includeMic = !this.includeMic;
            this.logger.debug(this.className, 'Audio =', this.includeMic);
            if (this.includeMic) {
                navigator.webkitGetUserMedia({audio: true, video: false}, (stream) => {
                    this.ngZone.run(() => {
                        this.logger.debug(this.className, 'Received audio stream.');
                        stream.onended = () => {
                            this.logger.debug(this.className, 'Micro audio ended.')
                        };
                        this.microAudioStream = stream;
                    });
                }, (err) => {
                    this.logger.debug(this.className, 'microAudioCheck ', ' getUserMedia() with audio failed.');
                    this.logger.error(this.className, err);
                });
            }
        });
    };

    sysAudioCheck() {
        this.ngZone.run(() => {
            // Mute video so we don't play loopback audio
            // let video = this.utilityService.document.querySelector('video');
            // video.muted = true;
            this.includeSysAudio = !this.includeSysAudio;
            // this.includeMic = false;
            this.logger.debug(this.className, 'System Audio =', this.includeSysAudio);
        });
    };

    reset() {
        this.ngZone.run(() => {
            let video = this.utilityService.document.querySelector('video');
            video.controls = false;
            // this.videoSourceService.source.next(null);
            this.recordedChunks = [];
            this.numRecordedChunks = 0;
        });
    };

    recordDesktop() {
        this.reset();
        this._electronService.ipcRenderer.send('show-picker', {types: ['screen']});
    };

    recordWindow() {
        this.reset();
        this._electronService.ipcRenderer.send('show-picker', {types: ['window']});
    };

    recordCamera() {
        this.reset();
        const callbackFunc = (stream) => {
            this.ngZone.run(() => {
                this.localStream = stream;
                this.localStream.onended = () => {
                    this.logger.debug(this.className, 'camera ','Media stream ended.')
                };

                let videoTracks = this.localStream.getVideoTracks();
                if (this.includeMic) {
                    this.logger.debug(this.className, 'camera ','Adding audio track.');
                    let audioTracks = this.microAudioStream.getAudioTracks();
                    this.localStream.addTrack(audioTracks[0]);
                }

                /*if (this.includeSysAudio) {
                    this.logger.debug('Adding system audio track.');
                    let audioTracks = this.localStream.getAudioTracks();
                    if (audioTracks.length < 1) {
                        this.logger.debug('No audio track in screen stream.')
                    }
                } else {
                    this.logger.debug('Not adding audio track.')
                }*/

                try {
                    this.logger.debug(this.className, 'camera ','Start recording the stream.');
                    this.recorder = new MediaRecorder(this.localStream);
                    this.recorder.ondataavailable = (event) => {
                        if (event.data && event.data.size > 0) {
                            this.recordedChunks.push(event.data);
                            this.numRecordedChunks += event.data.byteLength;
                        }
                    };
                    this.recorder.onstop = () => {
                        this.logger.debug(this.className, 'camera ','recorderOnStop fired')
                    };
                    this.recorder.start();
                    this.logger.debug(this.className, 'camera ','Recorder is started.');
                    // const video = {};
                    let video = this.utilityService.document.querySelector('video');
                    video.src = URL.createObjectURL(this.localStream);
                    // video['type'] = 'video/webm';
                    video.controls = true;
                    // this.videoSourceService.source.next(video);
                    // this.disableButtonSubject.next(true);
                } catch (e) {
                    this.logger.error(this.className, 'camera ','Exception while creating MediaRecorder: ', e);
                    return
                }
            });
        };

        navigator.webkitGetUserMedia({
            audio: false,
            video: {mandatory: {minWidth: 800, minHeight: 600}}
        }, callbackFunc, (err) => {
            this.logger.debug(this.className, 'camera ', ' getUserMedia() without audio failed.');
            this.logger.error(this.className, err);
        })
    };


    stopRecording() {
        if (this.recorder && this.recorder.state === 'recording') {
            this.logger.debug(this.className, 'Stopping record');
            this.recorder.stop();
            if (this.localStream && this.localStream.getVideoTracks().length > 0) {
                this.localStream.getVideoTracks()[0].stop();
                // this.stopButtonSubject.next(true);
                // this.disableButtonSubject.next(false);
            }
        }
    };

    play() {
        if (this.recordedChunks && this.recordedChunks.length > 0) {
            // Unmute video.
            let video = this.utilityService.document.querySelector('video');
            video.controls = true;
            video.muted = false;
            let blob = new Blob(this.recordedChunks, {type: 'video/webm'});
            // const video = {};
            video.src = window.URL.createObjectURL(blob);
            // video['type'] = 'video/webm';
            // this.videoSourceService.source.next(video);
        }
    };

    download() {
        if (this.recordedChunks && this.recordedChunks.length > 0) {
            let blob = new Blob(this.recordedChunks, {type: 'video/webm'});
            let url = URL.createObjectURL(blob);
            let a = this.utilityService.document.createElement('a');
            this.utilityService.document.body.appendChild(a);
            a.style = 'display: none';
            a.href = url;
            a.download = this.getFileName();
            a.click(() => {
                this.logger.debug(this.className, ' clicked on download ');
            });
            const subs = Observable.interval(1000).pipe(take(1)).subscribe(() => {
                if (subs) {
                    subs.unsubscribe();
                }
                this.utilityService.document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            });
        }
    };

    ngOnDestroy() {

        if (this.disabledSubscription) {
            this.disabledSubscription.unsubscribe();
        }
        if (this.stoppedSubscription) {
            this.stoppedSubscription.unsubscribe();
        }
    }
}