import {Logger} from "../core/logger/logger";
import {Subject} from "rxjs/Subject";
import {NgZone} from "@angular/core";

declare var MediaRecorder: any;
declare var navigator: any;

export class WSstreamRecorder {

    private recorder: any;
    private className: string;
    public dataSubject: Subject<any>;
    public stopSubject: Subject<boolean>;
    public pauseSubject: Subject<boolean>;
    public resumeSubject: Subject<boolean>;

    constructor(private ngZone: NgZone, private logger: Logger, public localStream: any) {
        this.className = 'WSstreamRecorder';

        this.dataSubject = new Subject<any>();
        this.stopSubject = new Subject<boolean>();
        this.pauseSubject = new Subject<boolean>();
        this.resumeSubject = new Subject<boolean>();

        this.localStream.onended = () => {
            this.logger.debug(this.className, '  ', 'Media stream ended.')
        };

        try {
            this.logger.debug(this.className, ' ', 'Start recording the stream.');
            this.recorder = new MediaRecorder(this.localStream, {
                mimeType: 'video/mp4'
            });

            this.recorder.ondataavailable = (event) => {
                this.ngZone.run(() => {
                    if (event.data && event.data.size > 0) {
                        /*this.recordedChunks.push(event.data);
                        this.numRecordedChunks += event.data.byteLength;*/
                        this.dataSubject.next(event.data);
                    }
                });
            };

            this.recorder.onstop = (event) => {
                this.ngZone.run(() => {
                    this.logger.debug(this.className, ' ', 'onstop fired');
                    this.stopSubject.next(true);
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
                    this.logger.error(this.className, ' ', event.error);
                });
            };

            this.recorder.onwarning = function (e) {
                this.logger.warn(this.className, "A warning has been raised: " + e.message);
            }
        } catch (e) {
            this.logger.error(this.className, ' ', 'Exception while creating MediaRecorder: ', e);
            return
        }
    }

    start() {
        if (this.recorder) {
            this.recorder.start();
            this.logger.debug(this.className, ' ', 'Recorder is started.');
        }
    }

    stop() {
        if (this.recorder) {
            this.recorder.stop();
            this.logger.debug(this.className, ' ', 'Recorder is stopped.');
        }
    }

    pause() {
        if (this.recorder) {
            this.recorder.pause();
            this.logger.debug(this.className, ' ', 'Recorder is paused.');
        }
    }

    resume() {
        if (this.recorder) {
            this.recorder.resume();
            this.logger.debug(this.className, ' ', 'Recorder is resumed.');
        }
    }

}
