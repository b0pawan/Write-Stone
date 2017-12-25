import {Injectable} from "@angular/core";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/interval";
import {ElectronService} from 'ngx-electron';
import {Logger} from "../../core/logger/logger";
import {UtilityService} from "../../core/services/utility.service";
import {BrowserSupportService} from "../../core/services/browser-support.service";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class PickerService {

    public className: string;
    public sourcesList: Subject<any>;
    public pickerStatusSubject: BehaviorSubject<boolean>;
    constructor(private logger: Logger, private utility : UtilityService, private _electronService: ElectronService, private bss: BrowserSupportService) {
        this.className = 'PickerService';
        this.sourcesList = new Subject<any>();
        this.pickerStatusSubject = new BehaviorSubject<boolean>(false);
    }

    init() {
        if (this.bss.isPlatformBrowser && this._electronService.isElectronApp) {
            this.utility.document.onkeydown = (evt) => {
                this.logger.debug(this.className, "onkeydown called");
                evt = evt || window.event;
                // Press esc key.
                if (evt.keyCode === 27) {
                    this._electronService.ipcRenderer.send('source-id-selected', null);
                }
            };

            this._electronService.ipcRenderer.on('get-sources', (event, options) => {
                this.logger.debug(this.className, "ipcRenderer.on('get-sources')");
                this._electronService.desktopCapturer.getSources(options, (error, sources) => {
                    this.logger.debug(this.className, "desktopCapturer.getSources()");
                    if (error) {
                        this.logger.error(this.className, error);
                        throw error;
                    }
                    this.sourcesList.next(sources);
                })
            });
        }
    }
}