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

declare var MediaRecorder: any;
declare var navigator: any;

@Component({
    selector: 'app-recorder',
    templateUrl: 'recorder.component.html',
    styleUrls: ['./recorder.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RecorderComponent implements OnInit, OnDestroy {
    recordingButtonsObs: Observable<boolean>;
    recorderStatusObs: Observable<boolean>;
    recordingButtonSubject: BehaviorSubject<boolean>;
    recorderStatusSubject: BehaviorSubject<boolean>;
    screenObs: Observable<any>;
    screenSubscription: Subscription;
    className: string;
    cameraStream: any;
    screenStream: any;
    cameraRecorder: any;
    screenRecorder: any;
    microAudioStream: any;
    sysAudioStream: any;

    /*recordedChunks: any[];
    numRecordedChunks: number;
    recorder: any;*/

    includeMic: boolean;
    includeSysAudio: boolean;
    saveFileObs: Observable<any>;
    fileSubscription: Subscription;

    constructor(private logger: Logger, private router: Router, private media: ObservableMedia, private titleService: TitleService, private _electronService: ElectronService,
                private utilityService: UtilityService, private pickerService: PickerService, private ngZone: NgZone, private videoSourceService: VideoSourceService) {
        this.className = 'HomeComponent';
        this.recordedChunks = [];
        this.numRecordedChunks = 0;
        this.includeMic = false;
        this.includeSysAudio = false;
        this.recordingButtonSubject = new BehaviorSubject<boolean>(true);
        this.recorderStatusSubject = new BehaviorSubject<boolean>(false);
        this.recordingButtonsObs = this.recordingButtonSubject.asObservable();
        this.recorderStatusObs = this.recorderStatusSubject.asObservable();
        this.screenObs = this.pickerService.screen.asObservable();
        this.saveFileObs = this.videoSourceService.source.asObservable();
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

        /*this._electronService.ipcRenderer.on('screen-selected', (event, sourceId) => {
            this.ngZone.run(() => {
                if (!sourceId) return;
                this.logger.debug(this.className, sourceId);
                this.onAccessApproved(sourceId, true);
            });
        });*/

        this.screenSubscription = this.screenObs.subscribe((screen) => {
            this.logger.debug(this.className, screen);
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
                this.recordingButtonSubject.next(!state);
            });
        });



    }

    onAccessApproved(id, screen) {
        if (!id) {
            this.logger.debug('Access rejected.');
            return
        }
        this.logger.debug(this.className, 'Window ID: ', id);
        this.logger.debug(this.className, 'Audio: ', this.includeMic);
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
                this.screenRecorder = new WSstreamRecorder(this.ngZone, this.logger, stream);
                this.screenStream = this.screenRecorder.localStream;
            });
        }, (err) => {
            this.logger.debug(this.className, 'screen capture ', ' getUserMedia() failed.');
            this.logger.error(this.className, err);
        });
    };

    playVideo() {
        this.recorderStatusSubject.next(false);
        this._electronService.remote.dialog.showOpenDialog({properties: ['openFile']}, (filename) => {
            if (filename) {
                this.ngZone.run(() => {
                    // this.logger.debug(filename);
                    // const video = {};
                    let video = this.utilityService.document.querySelector('video');
                    video.muted = false;
                    if (Array.isArray(filename)) {
                        video.src = filename[0];
                    }else {
                        video.src = filename;
                    }
                    video.controls = true;
                });
            }
        });
    };

    microAudioCheck() {
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
    };

    reset() {
        let video = this.utilityService.document.querySelector('video');
        // video.srcObject = '';
        video.controls = false;
        this.recordedChunks = [];
        this.numRecordedChunks = 0;
    };

    recordScreen() {
        this.recorderStatusSubject.next(false);
        this.reset();
        this._electronService.ipcRenderer.send('show-picker', {types: ['window','screen']});
    };

    recordCamera() {
        this.recorderStatusSubject.next(false);
        this.reset();
        navigator.getUserMedia({
            audio: false,
            video: {mandatory: {minWidth: 800, minHeight: 600}}
        }, (stream) => {
            this.ngZone.run(() => {
                this.cameraRecorder = new WSstreamRecorder(this.ngZone, this.logger, stream);
                this.cameraStream = this.cameraRecorder.localStream;
            });
        }, (err) => {
            this.logger.debug(this.className, 'camera ', ' getUserMedia() without audio failed.');
            this.logger.error(this.className, err);
        });
    };


    stopCamera() {
        if (this.cameraRecorder) {
            this.cameraRecorder.stop();
        }
    };

    stopScreen() {
        if (this.screenRecorder) {
            this.screenRecorder.stop();
        }
    };

    /*play() {
        if (this.recordedChunks && this.recordedChunks.length > 0) {
            // Unmute video.
            let video = this.utilityService.document.querySelector('video');
            video.controls = true;
            video.muted = false;
            let blob = new Blob(this.recordedChunks, {type: 'video/webm'});
            // const video = {};
            video.src = window.URL.createObjectURL(blob);
            // video['type'] = 'video/webm';
        }
    };*/

    download(type: string) {
        if (this.recordedChunks && this.recordedChunks.length > 0) {
            let blob = new Blob(this.recordedChunks, {type: 'video/mp4'});
            this.videoSourceService.saveToDisk(blob, type);
        }
    };

    handleStream(stream, mute) {
        this.recordingButtonSubject.next(false);
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
    }
}