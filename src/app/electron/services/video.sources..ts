import {Injectable, NgZone} from "@angular/core";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/interval";
import {ElectronService} from 'ngx-electron';
import {Logger} from "../../core/logger/logger";
import {UtilityService} from "../../core/services/utility.service";
import {Subject} from "rxjs/Subject";
import {BrowserSupportService} from "../../core/services/browser-support.service";

@Injectable()
export class VideoSourceService {

    public className: string;
    public source: Subject<any>;

    constructor(private logger: Logger, private utility: UtilityService, private _electronService: ElectronService, private bss: BrowserSupportService,
                private ngZone: NgZone) {
        this.className = 'VideoSourceService';
        this.source = new Subject<any>();
    }

    init(){
        this._electronService.ipcRenderer.on('get-saved-video-file', (event, file) => {
            this.ngZone.run(()=> {
                if (file != null) {
                    this.logger.debug(this.className, ' get-saved-video-file path ', file);
                    this.source.next(file);
                }
            });
        });
    }

    getFileName(type: string) {
        return "WS-stream-"+type+"_"+Date.now()+'.webm';
    };

    saveToDisk(blob, type) {
        let reader = new FileReader();
        const fileName = this.getFileName(type);
        reader.onload = () => {
            this.ngZone.run(()=> {
                if (reader.readyState == 2) {
                    let buffer = new Buffer(reader.result);
                    this._electronService.ipcRenderer.send('send-file-buffer-to-electron', fileName, buffer);
                    this.logger.debug(this.className, ' Saving ', `${JSON.stringify({fileName, size: blob.size})}`);
                    // console.log(' Saving ', `${JSON.stringify({fileName, size: blob.size})}`);
                }
            });
        };
        reader.readAsArrayBuffer(blob);
    }
}