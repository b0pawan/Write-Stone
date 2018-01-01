import {Injectable, NgZone} from "@angular/core";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/interval";
import {ElectronService} from 'ngx-electron';
import {Logger} from "../../core/logger/logger";
import {UtilityService} from "../../core/services/utility.service";
import {BrowserSupportService} from "../../core/services/browser-support.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class VideoSourceService {

    public className: string;
    public source: BehaviorSubject<string[]>;

    constructor(private logger: Logger, private utility: UtilityService, private _electronService: ElectronService, private bss: BrowserSupportService,
                private ngZone: NgZone) {
        this.className = 'VideoSourceService';
        this.source = new BehaviorSubject<any[]>([]);
    }

    init(){
        this._electronService.ipcRenderer.on('get-saved-video-file', (event, file) => {
            this.ngZone.run(()=> {
                if (file != null) {
                    this.logger.debug(this.className, ' get-saved-video-file path ', file);
                    let oldSources = this.source.getValue();
                    oldSources.push(file);
                    const sources = new Set(oldSources);
                    this.source.next(Array.from<string>(sources));
                }
            });
        });
    }

    getFileName(type: string, startTimeSeconds: number, endTimeSeconds : number) {
        return "WS-"+startTimeSeconds+"-"+endTimeSeconds+"_"+type+"_"+Date.now()+'.mp4';
    };

    saveToDisk(blob, type, startTimeSeconds, endTimeSeconds) {
        let reader = new FileReader();
        const fileName = this.getFileName(type, startTimeSeconds, endTimeSeconds);
        reader.onload = () => {
            this.ngZone.run(()=> {
                if (reader.readyState == 2) {
                    let buffer = new Buffer(reader.result);
                    this._electronService.ipcRenderer.send('send-file-buffer-to-electron', fileName, buffer, startTimeSeconds, endTimeSeconds);
                    this.logger.debug(this.className, ' Saving ', `${JSON.stringify({fileName, size: blob.size})} start sec ${startTimeSeconds} end sec ${endTimeSeconds}`);
                }
            });
        };
        reader.readAsArrayBuffer(blob);
    }
}