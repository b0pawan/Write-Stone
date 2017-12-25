import {Injectable} from "@angular/core";
import {Logger} from "../../core/logger/logger";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/interval";
import {take} from "rxjs/operators";
import {ElectronService} from 'ngx-electron';
import {BrowserSupportService} from "../../core/services/browser-support.service";

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

    constructor(private logger: Logger, private _electronService: ElectronService, private bss: BrowserSupportService) {
        this.recordedChunks = [];
        this.numRecordedChunks = 0;
        this.includeMic = false;
        this.includeSysAudio = false;

    }

    init() {
        if (this.bss.isPlatformBrowser) {
            this._electronService.ipcRenderer.on('source-id-selected', (event, sourceId) => {
                // Users have cancel the picker dialog.
                if (!sourceId) return;
                this.logger.log(sourceId);
                this.onAccessApproved(sourceId);
            });
        }
    }

    getFileName() {
        const defaultOutputFileName = "Write-Stone-Stream-" + Date.now() + '.webm';
        return defaultOutputFileName;
    };

    playVideo() {
        this._electronService.remote.dialog.showOpenDialog({properties: ['openFile']}, (filename) => {
            this.logger.log(filename);
            /*let video = document.querySelector('video');
            video.muted = false;
            video.src = filename;*/
        });
    };

    disableButtons() {
        /*document.querySelector('#record-desktop').disabled = true;
        document.querySelector('#record-camera').disabled = true;
        document.querySelector('#record-window').disabled = true;
        document.querySelector('#record-stop').hidden = false;
        document.querySelector('#play-button').hidden = true;
        document.querySelector('#download-button').hidden = true;*/
    };

    enableButtons() {
        /*document.querySelector('#record-desktop').disabled = false;
        document.querySelector('#record-camera').disabled = false;
        document.querySelector('#record-window').disabled = false;
        document.querySelector('#record-stop').hidden = true;
        document.querySelector('#play-button').hidden = true;
        document.querySelector('#download-button').hidden = true;*/
    };

    microAudioCheck() {
        this.includeSysAudio = false;
        // document.querySelector('#system-audio').checked = false;
        // Mute video so we don't play loopback audio.
        /*const video = document.querySelector('video');
        video.muted = true;*/
        this.includeMic = !this.includeMic;
        if (this.includeMic)
            document.querySelector('#micro-audio-btn').classList.add('active');
        else
            document.querySelector('#micro-audio-btn').classList.remove('active');
        this.logger.log('Audio =', this.includeMic);
        if (this.includeMic) {
            navigator.webkitGetUserMedia({audio: true, video: false}, this.getMicroAudio, this.getUserMediaError)
        }
    };

    sysAudioCheck() {
        // Mute video so we don't play loopback audio
        // const video = document.querySelector('video');
        // video.muted = true;
        this.includeSysAudio = !this.includeSysAudio;
        this.includeMic = false;
        // document.querySelector('#micro-audio').checked = false;
        this.logger.log('System Audio =', this.includeSysAudio);
    };

    cleanRecord() {
        let video = document.querySelector('video');
        video.controls = false;
        this.recordedChunks = [];
        this.numRecordedChunks = 0;
    };

    recordDesktop() {
        this.cleanRecord();
        this._electronService.ipcRenderer.send('show-picker', {types: ['screen']});
    };

    recordWindow() {
        this.cleanRecord();
        this._electronService.ipcRenderer.send('show-picker', {types: ['window']});
    };

    recordCamera() {
        this.cleanRecord();
        navigator.webkitGetUserMedia({
            audio: false,
            video: {mandatory: {minWidth: 1280, minHeight: 720}}
        }, this.getMediaStream, this.getUserMediaError)
    };

    recorderOnDataAvailable(event) {
        if (event.data && event.data.size > 0) {
            this.recordedChunks.push(event.data);
            this.numRecordedChunks += event.data.byteLength;
        }
    };

    stopRecording() {
        this.logger.log('Stopping record and starting download');
        this.enableButtons();
        /*document.querySelector('#play-button').hidden = false;
        document.querySelector('#download-button').hidden = false;*/
        this.recorder.stop();
        this.localStream.getVideoTracks()[0].stop();
    };

    play() {
        // Unmute video.
        let video = document.querySelector('video');
        video.controls = true;
        video.muted = false;
        let blob = new Blob(this.recordedChunks, {type: 'video/webm'});
        video.src = window.URL.createObjectURL(blob);
    };

    download() {
        let blob = new Blob(this.recordedChunks, {type: 'video/webm'});
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        document.body.appendChild(a);
        // a.style = 'display: none';
        a.href = url;
        a.download = this.getFileName();
        a.click();
        Observable.timer(100).pipe(take(1)).subscribe(()=>{
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        });
    };

    getMediaStream(stream) {
        let video = document.querySelector('video');
        video.src = URL.createObjectURL(stream);
        this.localStream = stream;
        stream.onended = () => {
            this.logger.log('Media stream ended.')
        };

        let videoTracks = this.localStream.getVideoTracks();

        if (this.includeMic) {
            this.logger.log('Adding audio track.');
            let audioTracks = this.microAudioStream.getAudioTracks();
            this.localStream.addTrack(audioTracks[0]);
        }
        if (this.includeSysAudio) {
            this.logger.log('Adding system audio track.');
            let audioTracks = stream.getAudioTracks();
            if (audioTracks.length < 1) {
                this.logger.log('No audio track in screen stream.')
            }
        } else {
            this.logger.log('Not adding audio track.')
        }
        try {
            this.logger.log('Start recording the stream.');
            this.recorder = new MediaRecorder(stream);
        } catch (e) {
            console.assert(false, 'Exception while creating MediaRecorder: ' + e);
            return
        }
        this.recorder.ondataavailable = this.recorderOnDataAvailable;
        this.recorder.onstop = () => {
            this.logger.log('recorderOnStop fired')
        };
        this.recorder.start();
        this.logger.log('Recorder is started.');
        this.disableButtons();
    };

    getMicroAudio(stream) {
        this.logger.log('Received audio stream.');
        this.microAudioStream = stream;
        stream.onended = () => {
            this.logger.log('Micro audio ended.')
        }
    };

    getUserMediaError() {
        this.logger.log('getUserMedia() failed.');
    };

    onAccessApproved(id) {
        if (!id) {
            this.logger.log('Access rejected.');
            return
        }
        this.logger.log('Window ID: ', id);
        this.logger.log('Audio: ', this.includeMic);
        this.logger.log('System Audio: ', this.includeSysAudio);
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