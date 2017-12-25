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
    sysAudioStream: any;
    recordedChunks: any[];
    numRecordedChunks: number;
    recorder: any;
    includeMic: boolean;
    includeSysAudio: boolean;
    public disableButtonSubject: BehaviorSubject<boolean>;
    public stopButtonSubject: BehaviorSubject<boolean>;
    disabledSubscription: Subscription;
    stoppedSubscription: Subscription;
    screenObs: Observable<any>;
    screenSubscription: Subscription;

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
        this.screenObs = this.pickerService.screen.asObservable();

    }


    ngOnInit() {
        this.titleService.setTitle("home");
        this.titleService.setMetaTags("home");
        this._electronService.ipcRenderer.on('source-id-selected', (event, sourceId) => {
            this.ngZone.run(() => {
                if (!sourceId) return;
                this.logger.debug(this.className, sourceId);
                this.onAccessApproved(sourceId, false);
            });
        });

        this._electronService.ipcRenderer.on('screen-selected', (event, sourceId) => {
            this.ngZone.run(() => {
                if (!sourceId) return;
                this.logger.debug(this.className, sourceId);
                this.onAccessApproved(sourceId, true);
            });
        });

        this.screenSubscription = this.screenObs.subscribe((screen) => {
            this.logger.debug(this.className, screen);
            if (screen.length > 0) {
                this._electronService.ipcRenderer.send('screen-selected', screen[0].id);
            }
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

    onAccessApproved(id, screen) {
        this.ngZone.run(() => {
            if (!id) {
                this.logger.debug('Access rejected.');
                return
            }
            const screenRecorder = (stream) => {
                this.localStream = stream;
                this.localStream.onended = () => {
                    this.logger.debug(this.className, 'screen capture ', 'Media stream ended.')
                };
                let videoTracks = this.localStream.getVideoTracks();
                if (this.includeSysAudio) {
                    this.logger.debug(this.className, 'screen capture ', 'Adding system audio track.');
                    let audioTracks = this.localStream.getAudioTracks();
                    if (audioTracks.length === 0) {
                        this.logger.debug('screen capture ', 'No audio track in screen stream.');
                    } else {
                        this.localStream.addTrack(audioTracks[0]);
                    }
                    /*this.logger.debug(this.className, 'screen capture ', 'Adding audio track.');
                    let audioTracks = this.sysAudioStream.getAudioTracks();
                    this.localStream.addTrack(audioTracks[0]);*/
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
                        this.logger.debug(this.className, 'screen capture ', 'recorderOnStop fired')
                    };
                    this.recorder.start();
                    this.logger.debug(this.className, 'screen capture ', 'Recorder is started.');
                    this.handleStream(this.localStream, true);
                    // this.videoSourceService.source.next(video);
                    // this.disableButtonSubject.next(true);;
                } catch (e) {
                    this.logger.error(this.className, 'screen capture ', 'Exception while creating MediaRecorder: ', e);
                    return
                }
            };

            this.logger.debug(this.className, 'Window ID: ', id);
            this.logger.debug(this.className, 'Audio: ', this.includeMic);
            this.logger.debug(this.className, 'System Audio: ', this.includeSysAudio);
            if (this.includeSysAudio && screen) {
                navigator.webkitGetUserMedia({
                    audio: {
                        mandatory: {
                            chromeMediaSource: 'desktop'
                        }
                    },
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop'
                        }
                    }
                }, screenRecorder, (err) => {
                    this.logger.debug(this.className, 'screen capture ', ' getUserMedia() with audio failed.');
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
                }, screenRecorder, (err) => {
                    this.logger.debug(this.className, 'screen capture ', ' getUserMedia() without audio failed.');
                    this.logger.error(this.className, err);
                })
            }
        });
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
            navigator.webkitGetUserMedia({audio: true, video: false}, (stream) => {
                this.ngZone.run(() => {
                    this.logger.debug(this.className, 'Received audio stream.');
                    stream.onended = () => {
                        this.logger.debug(this.className, 'Micro audio ended.')
                    };
                    this.sysAudioStream = stream;
                });
            }, (err) => {
                this.logger.debug(this.className, 'microAudioCheck ', ' getUserMedia() with audio failed.');
                this.logger.error(this.className, err);
            });
        });
    };

    reset() {
        let video = this.utilityService.document.querySelector('video');
        video.controls = false;
        // this.videoSourceService.source.next(null);
        this.recordedChunks = [];
        this.numRecordedChunks = 0;
    };

    recordDesktop() {
        this.reset();
        this._electronService.ipcRenderer.send('screen-capture', {types: ['screen']});
    };

    recordWindow() {
        this.reset();
        this._electronService.ipcRenderer.send('show-picker', {types: ['window']});
    };

    recordCamera() {
        this.reset();
        this.ngZone.run(() => {
            navigator.webkitGetUserMedia({
                audio: false,
                video: {mandatory: {minWidth: 800, minHeight: 600}}
            }, (stream) => {
                this.localStream = stream;
                this.localStream.onended = () => {
                    this.logger.debug(this.className, 'camera ', 'Media stream ended.')
                };

                // let videoTracks = this.localStream.getVideoTracks();
                if (this.includeMic) {
                    this.logger.debug(this.className, 'camera ', 'Adding audio track.');
                    let audioTracks = this.microAudioStream.getAudioTracks();
                    this.localStream.addTrack(audioTracks[0]);
                }

                try {
                    this.logger.debug(this.className, 'camera ', 'Start recording the stream.');
                    this.recorder = new MediaRecorder(this.localStream);
                    this.recorder.ondataavailable = (event) => {
                        if (event.data && event.data.size > 0) {
                            this.recordedChunks.push(event.data);
                            this.numRecordedChunks += event.data.byteLength;
                        }
                    };
                    this.recorder.onstop = () => {
                        this.logger.debug(this.className, 'camera ', 'recorderOnStop fired')
                    };
                    this.recorder.start();
                    this.logger.debug(this.className, 'camera ', 'Recorder is started.');
                    this.handleStream(this.localStream, true);
                    // this.videoSourceService.source.next(video);
                    // this.disableButtonSubject.next(true);
                } catch (e) {
                    this.logger.error(this.className, 'camera ', 'Exception while creating MediaRecorder: ', e);
                    return
                }
            }, (err) => {
                this.logger.debug(this.className, 'camera ', ' getUserMedia() without audio failed.');
                this.logger.error(this.className, err);
            })
        });
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

    handleStream(stream, mute) {
        this.logger.debug(this.className, ' handleStream ');
        const video = this.utilityService.document.querySelector('video');
        video.srcObject = stream;
        video.controls = true;
        video.muted = mute;
        video.onloadedmetadata = (e) => {
            video.play();
        }
    }

    ngOnDestroy() {

        if (this.screenSubscription) {
            this.screenSubscription.unsubscribe();
        }

        if (this.disabledSubscription) {
            this.disabledSubscription.unsubscribe();
        }
        if (this.stoppedSubscription) {
            this.stoppedSubscription.unsubscribe();
        }
    }
}