import {Logger} from "../core/logger/logger";
import {Subject} from "rxjs/Subject";
import {NgZone} from "@angular/core";
import {Observable} from "rxjs/Observable";

declare var MediaRecorder: any;
declare var navigator: any;

export class WSstreamRecorder {

    private recorder: any;
    private className: string;
    private dataSubject: Subject<any>;
    private startSubject: Subject<boolean>;
    private stopSubject: Subject<boolean>;
    private pauseSubject: Subject<boolean>;
    private resumeSubject: Subject<boolean>;

    public chunkedData: Observable<any>;
    public start: Observable<boolean>;
    public stop: Observable<boolean>;
    public pause: Observable<boolean>;
    public resume: Observable<boolean>;
    public audioStream: any;

    constructor(private ngZone: NgZone, private logger: Logger, public localStream: any, public recorderName: string, public isVideo: boolean = true) {
        this.className = 'WSstreamRecorder' + "-" + this.recorderName;
        this.dataSubject = new Subject<any[]>();
        this.startSubject = new Subject<boolean>();
        this.stopSubject = new Subject<boolean>();
        this.pauseSubject = new Subject<boolean>();
        this.resumeSubject = new Subject<boolean>();
        this.chunkedData = this.dataSubject.asObservable();
        this.start = this.startSubject.asObservable();
        this.stop = this.stopSubject.asObservable();
        this.pause = this.pauseSubject.asObservable();
        this.resume = this.resumeSubject.asObservable();
        this.init();
    }

    init() {
        this.localStream.onended = () => {
            this.logger.debug(this.className, '  ', 'Media stream ended.')
        };

        try {
            this.logger.debug(this.className, ' ', 'Start recording the stream.');
            MediaRecorder.ignoreMutedMedia = true;
            if (this.isVideo) {
                this.recorder = new MediaRecorder(this.localStream, {
                    mimeType: 'video/webm'
                });
            } else {
                this.recorder = new MediaRecorder(this.localStream, {
                    mimeType: 'audio/webm'
                });
            }

            this.recorder.ondataavailable = (event) => {
                this.ngZone.run(() => {
                    this.logger.debug(this.className, ' data size ', event.data.size);
                    if (event.data && event.data.size > 0) {
                        const recordedChunks = [];
                        recordedChunks.push(event.data);
                        this.logger.debug(this.className, ' chunk length ', recordedChunks.length);
                        this.dataSubject.next(recordedChunks);
                    }
                });
            };


            this.recorder.onstop = (event) => {
                this.ngZone.run(() => {
                    this.logger.debug(this.className, ' ', 'onstop fired');
                    this.stopSubject.next(true);
                });
            };

            this.recorder.onstart = (event) => {
                this.ngZone.run(() => {
                    this.logger.debug(this.className, ' ', 'start fired');
                    this.startSubject.next(true);
                });
            };

            this.recorder.onpause = (event) => {
                this.ngZone.run(() => {
                    this.logger.debug(this.className, ' ', 'onpause fired');
                    this.pauseSubject.next(true);
                });
            };

            this.recorder.onresume = (event) => {
                this.ngZone.run(() => {
                    this.logger.debug(this.className, ' ', 'onresume fired');
                    this.resumeSubject.next(true);
                });
            };

            this.recorder.onerror = (event) => {
                this.ngZone.run(() => {
                    this.logger.error(this.className, ' ', event);
                });
            };

            this.recorder.onwarning = function (e) {
                this.ngZone.run(() => {
                    this.logger.warn(this.className, "A warning has been raised: " + e.message);
                });
            }
        } catch (e) {
            this.logger.error(this.className, ' ', 'Exception while creating MediaRecorder: ', e);
            return
        }
    }

    startRec() {
        if (this.recorder && this.state() === 'inactive') {
            this.recorder.start(15000);
            this.logger.debug(this.className, ' ', 'Recorder is started.');
        } else {
            this.logger.debug(this.className, ' recorder inactive');
        }
        /*if (this.recorder) {
            this.recorder.start();
            this.logger.debug(this.className, ' ', 'Recorder is started.');
        }*/
    }

    stopRec() {
        if (this.recorder && this.state() === 'recording') {
            this.recorder.stop();
            this.logger.debug(this.className, ' ', 'Recorder is stopped.');
        } else {
            this.logger.debug(this.className, ' ', 'Recorder is not recording');
        }
    }

    pauseRec() {
        if (this.recorder && this.state() !== 'inactive') {
            this.recorder.pause();
            this.logger.debug(this.className, ' ', 'Recorder is paused.');
        } else {
            this.logger.debug(this.className, ' recorder inactive');
        }
    }

    resumeRec() {
        if (this.recorder && this.state() !== 'inactive') {
            this.recorder.resume();
            this.logger.debug(this.className, ' ', 'Recorder is resumed.');
        } else {
            this.logger.debug(this.className, ' recorder inactive');
        }
    }

    state() {
        if (this.recorder) {
            this.logger.debug(this.className, ' state ', this.recorder.state);
            return this.recorder.state;
        }
    }

}