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
                public recorderService : RecorderService, public pickerService : PickerService, private _electronService: ElectronService) {
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
        const defaultOutputFileName = "Write-Stone-Stream-" + Date.now() + '.webm';
        return defaultOutputFileName;
    };

    playVideo() {
        this._electronService.remote.dialog.showOpenDialog({properties: ['openFile']}, (filename) => {
            this.logger.debug(filename);
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
        this.recorderService.includeSysAudio = false;
        // document.querySelector('#system-audio').checked = false;
        // Mute video so we don't play loopback audio.
        /*const video = document.querySelector('video');
        video.muted = true;*/
        this.recorderService.includeMic = !this.recorderService.includeMic;
        if (this.recorderService.includeMic)
            document.querySelector('#micro-audio-btn').classList.add('active');
        else
            document.querySelector('#micro-audio-btn').classList.remove('active');
        this.logger.debug('Audio =', this.recorderService.includeMic);
        if (this.recorderService.includeMic) {
            navigator.webkitGetUserMedia({audio: true, video: false}, this.recorderService.getMicroAudio, this.recorderService.getUserMediaError)
        }
    };

    sysAudioCheck() {
        // Mute video so we don't play loopback audio
        // const video = document.querySelector('video');
        // video.muted = true;
        this.recorderService.includeSysAudio = !this.recorderService.includeSysAudio;
        this.recorderService.includeMic = false;
        // document.querySelector('#micro-audio').checked = false;
        this.logger.debug('System Audio =', this.recorderService.includeSysAudio);
    };

    cleanRecord() {
        let video = document.querySelector('video');
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
        navigator.webkitGetUserMedia({
            audio: false,
            video: {mandatory: {minWidth: 1280, minHeight: 720}}
        }, this.recorderService.getMediaStream, this.recorderService.getUserMediaError)
    };


    stopRecording() {
        this.logger.debug('Stopping record and starting download');
        this.enableButtons();
        /*document.querySelector('#play-button').hidden = false;
        document.querySelector('#download-button').hidden = false;*/
        this.recorderService.recorder.stop();
        this.recorderService.localStream.getVideoTracks()[0].stop();
    };

    play() {
        // Unmute video.
        let video = document.querySelector('video');
        video.controls = true;
        video.muted = false;
        let blob = new Blob(this.recorderService.recordedChunks, {type: 'video/webm'});
        video.src = window.URL.createObjectURL(blob);
    };

    download() {
        let blob = new Blob(this.recorderService.recordedChunks, {type: 'video/webm'});
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
}
