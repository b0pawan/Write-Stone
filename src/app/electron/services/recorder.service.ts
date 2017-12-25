import {Injectable} from "@angular/core";
import {Logger} from "../../core/logger/logger";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/interval";
import {ElectronService} from 'ngx-electron';
import {BrowserSupportService} from "../../core/services/browser-support.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

declare var MediaRecorder: any;
declare var navigator: any;

@Injectable()
export class RecorderService {
    public localStream: any;
    public microAudioStream: any;
    public recordedChunks: any[];
    public numRecordedChunks: number;
    public recorder: any;
    public includeMic: boolean;
    public includeSysAudio: boolean;
    public disableButtonSubject: BehaviorSubject<boolean>;

    constructor(private logger: Logger, private _electronService: ElectronService, private bss: BrowserSupportService) {
        this.recordedChunks = [];
        this.numRecordedChunks = 0;
        this.includeMic = false;
        this.includeSysAudio = false;
        this.disableButtonSubject = new BehaviorSubject<boolean>(false);
    }

    init() {
        if (this.bss.isPlatformBrowser && this._electronService.isElectronApp) {
            this._electronService.ipcRenderer.on('source-id-selected', (event, sourceId) => {
                // Users have cancel the picker dialog.
                if (!sourceId) return;
                this.logger.debug(sourceId);
                this.onAccessApproved(sourceId);
            });
        }
    }

    recorderOnDataAvailable(event) {
        if (event.data && event.data.size > 0) {
            this.recordedChunks.push(event.data);
            this.numRecordedChunks += event.data.byteLength;
        }
    };


    getMediaStream(stream) {
        let video = document.querySelector('video');
        video.src = URL.createObjectURL(stream);
        this.localStream = stream;
        stream.onended = () => {
            this.logger.debug('Media stream ended.')
        };

        let videoTracks = this.localStream.getVideoTracks();

        if (this.includeMic) {
            this.logger.debug('Adding audio track.');
            let audioTracks = this.microAudioStream.getAudioTracks();
            this.localStream.addTrack(audioTracks[0]);
        }
        if (this.includeSysAudio) {
            this.logger.debug('Adding system audio track.');
            let audioTracks = stream.getAudioTracks();
            if (audioTracks.length < 1) {
                this.logger.debug('No audio track in screen stream.')
            }
        } else {
            this.logger.debug('Not adding audio track.')
        }
        try {
            this.logger.debug('Start recording the stream.');
            this.recorder = new MediaRecorder(stream);
        } catch (e) {
            console.assert(false, 'Exception while creating MediaRecorder: ' + e);
            return
        }
        this.recorder.ondataavailable = this.recorderOnDataAvailable;
        this.recorder.onstop = () => {
            this.logger.debug('recorderOnStop fired')
        };
        this.recorder.start();
        this.logger.debug('Recorder is started.');
        this.disableButtonSubject.next(true);
        // this.disableButtons();
    };

    getMicroAudio(stream) {
        this.logger.debug('Received audio stream.');
        this.microAudioStream = stream;
        stream.onended = () => {
            this.logger.debug('Micro audio ended.')
        }
    };

    getUserMediaError() {
        this.logger.debug('getUserMedia() failed.');
    };

    onAccessApproved(id) {
        if (!id) {
            this.logger.debug('Access rejected.');
            return
        }
        this.logger.debug('Window ID: ', id);
        this.logger.debug('Audio: ', this.includeMic);
        this.logger.debug('System Audio: ', this.includeSysAudio);
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
            }, this.getMediaStream, this.getUserMediaError)
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
            }, this.getMediaStream, this.getUserMediaError)
        }
    };
}