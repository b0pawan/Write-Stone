import {Component, NgZone, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {Logger} from "../core/logger/logger";
import {Router} from "@angular/router";
import {TitleService} from "../core/services/title.service";
import {ObservableMedia} from "@angular/flex-layout";
import {Observable} from "rxjs/Observable";
import {ElectronService} from "ngx-electron";
import {UtilityService} from "../core/services/utility.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import "rxjs/add/observable/interval";
import "rxjs/add/observable/timer";
import {PickerService} from "../electron/services/picker.service";
import {Subscription} from "rxjs/Subscription";
import {VideoSourceService} from "../electron/services/video.sources";
import {WSstreamRecorder} from "./recorder";
import {isNullOrUndefined} from "util";
import {take} from "rxjs/operators";

declare var MediaRecorder: any;
declare var navigator: any;

@Component({
    selector: 'app-recorder',
    templateUrl: 'recorder.component.html',
    styleUrls: ['./recorder.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RecorderComponent implements OnInit, OnDestroy {
    screenRecObs: Observable<boolean>;
    cameraRecObs: Observable<boolean>;
    screenRecSubject: BehaviorSubject<boolean>;
    cameraRecSubject: BehaviorSubject<boolean>;

    screenObs: Observable<any>;
    screenSubscription: Subscription;
    className: string;
    cameraRecorder: any;
    screenRecorder: any;
    audioRecorder: any;
    // microAudioStream: any;
    // sysAudioStream: any;
    includeMic: boolean;
    includeSysAudio: boolean;
    saveFileObs: Observable<any>;
    fileSubscription: Subscription;
    screenRecorderSubs: Subscription;
    cameraRecorderSubs: Subscription;
    audioRecorderSubs: Subscription;
    startScreenSubs: Subscription;
    stopScreenSubs: Subscription;
    playTimeSubject: BehaviorSubject<number>;
    playTimeObservable: Observable<number>;
    playerSubs: Subscription;

    constructor(private logger: Logger, private router: Router, private media: ObservableMedia, private titleService: TitleService, private _electronService: ElectronService,
                private utilityService: UtilityService, private pickerService: PickerService, private ngZone: NgZone, private videoSourceService: VideoSourceService) {
        this.className = 'RecorderComponent';
        this.includeMic = true;
        this.includeSysAudio = true;
        this.screenRecSubject = new BehaviorSubject<boolean>(false);
        this.cameraRecSubject = new BehaviorSubject<boolean>(false);
        this.screenRecObs = this.screenRecSubject.asObservable();
        this.cameraRecObs = this.cameraRecSubject.asObservable();
        this.screenObs = this.pickerService.screen.asObservable();
        this.saveFileObs = this.videoSourceService.source.asObservable();
        this.playTimeSubject = new BehaviorSubject<number>(0);
        this.playTimeObservable = this.playTimeSubject.asObservable();
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
                this.logger.debug(this.className, ' on screen-selected ', sourceId);
                this.onAccessApproved(sourceId, true);
            });
        });

        this.screenSubscription = this.screenObs.subscribe((screen) => {
            this.logger.debug(this.className, ' send screen-selected ', screen);
            if (screen.length > 0) {
                this._electronService.ipcRenderer.send('screen-selected', screen[0].id);
            }
        });

        this.fileSubscription = this.saveFileObs.subscribe((file) => {
            this.logger.debug(this.className, file);
        });

        this._electronService.ipcRenderer.on('picker-closed-status', (event, state) => {
            // console.log(' picker-closed-status ', state);
            this.ngZone.run(() => {
                this.logger.debug(this.className, ' picker status ', state);
            });
        });


    }

    onAccessApproved(id, screen) {
        if (!id) {
            this.logger.debug('Access rejected.');
            return;
        }
        this.logger.debug(this.className, 'Window ID: ', id);
        // this.logger.debug(this.className, 'Audio: ', this.includeMic);
        this.logger.debug(this.className, 'System Audio: ', this.includeSysAudio);
        navigator.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: id,
                    maxWidth: window.screen.width,
                    maxHeight: window.screen.height
                }
            }
        }, (stream) => {
            this.ngZone.run(() => {
                // start recording system audio
                this.sysAudioCheck();
                let startTime = this.playTimeSubject.getValue();
                this.screenRecorder = new WSstreamRecorder(this.ngZone, this.logger, stream, 'screen');
                if (this.screenRecorder) {
                    this.screenRecorderSubs = this.screenRecorder.chunkedData.subscribe((eventData) => {
                        this.logger.debug(this.className, " screen recorder data ", eventData.length);
                        let endTime = this.playTimeSubject.getValue();
                        this.download('screen', eventData, startTime, endTime);
                        startTime = endTime;
                    });
                    this.startScreenSubs = this.screenRecorder.start.subscribe(() => {
                        this.screenRecSubject.next(true);
                        this.playTimeSubject.next(0);
                        this.playerSubs = Observable.interval(1000).subscribe((_sec) => {
                            this.ngZone.run(() => {
                                const timer = this.playTimeSubject.getValue() + 1;
                                this.playTimeSubject.next(timer);
                            });
                        });
                    });
                    this.screenRecorder.startRec();
                }
            });
        }, (err) => {
            this.logger.debug(this.className, 'screen capture ', ' getUserMedia() failed.');
            this.logger.error(this.className, err);
        });
    };


    /*microAudioCheck() {
        this.recorderStatusSubject.next(false);
        this.includeMic = !this.includeMic;
        this.logger.debug(this.className, 'Audio =', this.includeMic);
        if (this.includeMic) {
            navigator.getUserMedia({audio: true, video: false}, (stream) => {
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


    };

    sysAudioCheck() {
        this.recorderStatusSubject.next(false);
        this.includeSysAudio = !this.includeSysAudio;
        this.logger.debug(this.className, 'System Audio =', this.includeSysAudio);
        navigator.getUserMedia({audio: true, video: false}, (stream) => {
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
    };*/


    sysAudioCheck() {
        // this.recorderStatusSubject.next(false);
        // this.includeSysAudio = !this.includeSysAudio;
        this.logger.debug(this.className, 'System Audio =', this.includeSysAudio);
        navigator.getUserMedia({audio: true, video: false}, (stream) => {
            this.ngZone.run(() => {
                let audioTime = this.playTimeSubject.getValue();
                this.audioRecorder = new WSstreamRecorder(this.ngZone, this.logger, stream, 'audio', false);
                if (this.audioRecorder) {
                    this.audioRecorderSubs = this.audioRecorder.chunkedData.subscribe((eventData) => {
                        let endTime = this.playTimeSubject.getValue();
                        this.download('audio', eventData, audioTime, endTime, false);
                    });
                    const audStartSubs = this.audioRecorder.start.subscribe(() => {
                        if (audStartSubs) {
                            audStartSubs.unsubscribe();
                        }
                    });
                    this.audioRecorder.startRec();
                }
            });
        }, (err) => {
            this.logger.debug(this.className, 'sysAudioCheck ', ' getUserMedia() with audio failed.');
            this.logger.error(this.className, err);
        });
    };

    reset() {

        if (this.cameraRecorderSubs) {
            this.cameraRecorderSubs.unsubscribe();
        }

        if (this.screenRecorderSubs) {
            this.screenRecorderSubs.unsubscribe();
        }

        if (this.audioRecorderSubs) {
            this.audioRecorderSubs.unsubscribe();
        }

        if (this.playerSubs) {
            this.playerSubs.unsubscribe();
        }
        // reseting source as well.
        this.videoSourceService.source.next([]);
        this.cameraRecorder = null;
        this.screenRecorder = null;
        this.audioRecorder = null;
    };

    recordScreen() {
        // this.reset();
        this._electronService.ipcRenderer.send('show-picker', {types: ['window', 'screen']});
        // this._electronService.ipcRenderer.send('screen-capture', {types: ['screen']});
    };

    recordCamera() {
        // this.reset();
        navigator.getUserMedia({
            audio: false,
            video: {mandatory: {minWidth: 400, minHeight: 300}}
        }, (stream) => {
            this.ngZone.run(() => {
                let cameraTime = this.playTimeSubject.getValue();
                this.cameraRecorder = new WSstreamRecorder(this.ngZone, this.logger, stream, 'camera');
                if (this.cameraRecorder) {
                    this.cameraRecorderSubs = this.cameraRecorder.chunkedData.subscribe((eventData) => {
                        let endTime = this.playTimeSubject.getValue();
                        this.download('camera', eventData, cameraTime, endTime);
                    });
                    const camStartSubs = this.cameraRecorder.start.subscribe(() => {
                        this.cameraRecSubject.next(true);
                        if (this.screenRecSubject.getValue() === false) {
                            this.playTimeSubject.next(0);
                        }
                        if (camStartSubs) {
                            camStartSubs.unsubscribe();
                        }
                    });
                    this.cameraRecorder.startRec();
                }
            });
        }, (err) => {
            this.logger.debug(this.className, 'camera ', ' getUserMedia() without audio failed.');
            this.logger.error(this.className, err);
        });
    };


    stopCamera() {
        if (this.cameraRecorder) {
            this.cameraRecorder.stopRec();
            const camStopSubs = this.cameraRecorder.stop.subscribe(() => {
                this.cameraRecSubject.next(false);
                if (camStopSubs) {
                    camStopSubs.unsubscribe();
                }
            });
        }
    };

    stopScreen() {
        if (this.screenRecorder) {
            const noOfFiles = this.videoSourceService.source.getValue().filter(x => {
                return x.indexOf('screen') >= 0;
            }).length;
            // this.logger.debug(this.className, ' no of files ', noOfFiles);
            this.stopScreenSubs = this.saveFileObs.subscribe((files) => {
                let screenFiles = files.filter( x => {
                    return x.indexOf('screen') >= 0;
                }).length;
                this.logger.debug(this.className, ' screen files ', screenFiles, ' no of files ', noOfFiles);
                if (screenFiles > noOfFiles) {
                    if (this.startScreenSubs) {
                        this.startScreenSubs.unsubscribe();
                    }
                    if (this.stopScreenSubs) {
                        this.stopScreenSubs.unsubscribe();
                    }
                    this.screenRecSubject.next(false);
                    this.reset();
                }
            });

            Observable.interval(500).pipe(take(1)).subscribe(() => {
                this.screenRecorder.stopRec();
                this.audioRecorder.stopRec();
            })
        }
    };

    download(type: string, recordedChunks: any, startTimeSeconds: number, endTimeSeconds: number, isVideo: boolean =  true) {
        // this.logger.debug(this.className, ' download called ', type, startTimeSeconds, endTimeSeconds, ' recorded array ', recordedChunks.length);
        if (!isNullOrUndefined(recordedChunks) && recordedChunks.length > 0) {
            let blob;
            if (isVideo) {
                blob = new Blob(recordedChunks, {type: 'video/webm'});
            }else {
                blob = new Blob(recordedChunks, {type: 'audio/webm'});
            }
            this.videoSourceService.saveToDisk(blob, type, startTimeSeconds, endTimeSeconds);
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

        if (this.cameraRecorderSubs) {
            this.cameraRecorderSubs.unsubscribe();
        }

        if (this.screenRecorderSubs) {
            this.screenRecorderSubs.unsubscribe();
        }

        if (this.audioRecorderSubs) {
            this.audioRecorderSubs.unsubscribe();
        }

        if (this.playerSubs) {
            this.playerSubs.unsubscribe();
        }

        if (this.stopScreenSubs) {
            this.stopScreenSubs.unsubscribe();
        }

        if (this.startScreenSubs) {
            this.startScreenSubs.unsubscribe();
        }
    }
}