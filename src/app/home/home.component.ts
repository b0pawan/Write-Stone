import {Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {Logger} from "../core/logger/logger";
import {Router} from "@angular/router";
import {TitleService} from "../core/services/title.service";
import {ObservableMedia} from "@angular/flex-layout";
import {RecorderService} from "../electron/services/recorder.service";
import {PickerService} from "../electron/services/picker.service";
import {Observable} from "rxjs/Observable";
import {take} from "rxjs/operators";
import {Subscription} from "rxjs/Subscription";
import {ElectronService} from "ngx-electron";
import {UtilityService} from "../core/services/utility.service";

declare var MediaRecorder: any;
declare var navigator: any;

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {
    public disabled: Observable<boolean>;
    private className: string;
    constructor(private logger: Logger, private router: Router, private media: ObservableMedia, private titleService: TitleService,
                public recorderService : RecorderService, public pickerService : PickerService, private _electronService: ElectronService,
                private utilityService: UtilityService) {
        this.disabled = this.recorderService.disableButtonSubject.asObservable();
        this.className = 'HomeComponent';
    }


    ngOnInit() {
        this.titleService.setTitle("home");
        this.titleService.setMetaTags("home");
    }

    ngOnDestroy() {

    }

    getFileName() {
        return "Write-Stone-Stream-" + Date.now() + '.webm';
    };

    playVideo() {
        this._electronService.remote.dialog.showOpenDialog({properties: ['openFile']}, (filename) => {
            this.logger.debug(filename);
            let video = this.utilityService.document.querySelector('video');
            video.muted = false;
            video.src = filename;
        });
    };

    disableButtons() {
        this.recorderService.disableButtonSubject.next(true);
    };

    enableButtons() {
        this.recorderService.disableButtonSubject.next(false);
    };

    microAudioCheck() {
        this.recorderService.includeSysAudio = false;
        // this.utilityService.document.querySelector('#system-audio').checked = false;
        // Mute video so we don't play loopback audio.
        /*const video = this.utilityService.document.querySelector('video');
        video.muted = true;*/
        this.recorderService.includeMic = !this.recorderService.includeMic;
        this.logger.debug('Audio =', this.recorderService.includeMic);
        if (this.recorderService.includeMic) {
            navigator.webkitGetUserMedia({audio: true, video: false}, this.recorderService.getMicroAudio, ()=> {
                this.logger.debug('getUserMedia() with audio failed.');
            });
        }
    };

    sysAudioCheck() {
        // Mute video so we don't play loopback audio
        // const video = this.utilityService.document.querySelector('video');
        // video.muted = true;
        this.recorderService.includeSysAudio = !this.recorderService.includeSysAudio;
        this.recorderService.includeMic = false;
        this.logger.debug('System Audio =', this.recorderService.includeSysAudio);
    };

    cleanRecord() {
        let video = this.utilityService.document.querySelector('video');
        video.controls = false;
        this.recorderService.recordedChunks = [];
        this.recorderService.numRecordedChunks = 0;
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
        const callbackFunc = (stream)=> {
            let video = this.utilityService.document.querySelector('video');
            video.src = URL.createObjectURL(stream);
            this.recorderService.localStream = stream;
            stream.onended = () => {
                this.logger.debug('Media stream ended.')
            };

            let videoTracks = this.recorderService.localStream.getVideoTracks();

            if (this.recorderService.includeMic) {
                this.logger.debug('Adding audio track.');
                let audioTracks = this.recorderService.microAudioStream.getAudioTracks();
                this.recorderService.localStream.addTrack(audioTracks[0]);
            }
            if (this.recorderService.includeSysAudio) {
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
                this.recorderService.recorder = new MediaRecorder(stream);
            } catch (e) {
                console.assert(false, 'Exception while creating MediaRecorder: ' + e);
                return
            }
            this.recorderService.recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recorderService.recordedChunks.push(event.data);
                    this.recorderService.numRecordedChunks += event.data.byteLength;
                }
            };
            this.recorderService.recorder.onstop = () => {
                this.logger.debug('recorderOnStop fired')
            };
            this.recorderService.recorder.start();
            this.logger.debug('Recorder is started.');
            this.recorderService.disableButtonSubject.next(true);
        };

        navigator.webkitGetUserMedia({
            audio: false,
            video: {mandatory: {minWidth: 1280, minHeight: 720}}
        }, callbackFunc, ()=> {
            this.logger.debug('getUserMedia() without audio failed.');
        })
    };


    stopRecording() {
        this.logger.debug('Stopping record and starting download');
        this.enableButtons();
        this.recorderService.recorder.stop();
        this.recorderService.localStream.getVideoTracks()[0].stop();
    };

    play() {
        // Unmute video.
        let video = this.utilityService.document.querySelector('video');
        video.controls = true;
        video.muted = false;
        let blob = new Blob(this.recorderService.recordedChunks, {type: 'video/webm'});
        video.src = window.URL.createObjectURL(blob);
    };

    download() {
        let blob = new Blob(this.recorderService.recordedChunks, {type: 'video/webm'});
        let url = URL.createObjectURL(blob);
        let a = this.utilityService.document.createElement('a');
        this.utilityService.document.body.appendChild(a);
        // a.style = 'display: none';
        a.href = url;
        a.download = this.getFileName();
        a.click();
        Observable.timer(100).pipe(take(1)).subscribe(()=>{
            this.utilityService.document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        });
    };
}
