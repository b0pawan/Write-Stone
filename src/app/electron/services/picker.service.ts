import {Injectable, NgZone} from "@angular/core";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/interval";
import {ElectronService} from 'ngx-electron';
import {Logger} from "../../core/logger/logger";
import {UtilityService} from "../../core/services/utility.service";
import {BrowserSupportService} from "../../core/services/browser-support.service";
import {Subject} from "rxjs/Subject";

@Injectable()
export class PickerService {

    public className: string;
    public sourcesList: Subject<any>;
    constructor(private logger: Logger, private utility : UtilityService, private _electronService: ElectronService, private bss: BrowserSupportService,
                private ngZone: NgZone) {
        this.className = 'PickerService';
        this.sourcesList = new Subject<any>();
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
                this._electronService.desktopCapturer.getSources(options, (error, sources) => {
                    this.ngZone.run(()=> {
                        if (error) {
                            this.logger.error(this.className, error);
                            throw error;
                        }
                        this.sourcesList.next(sources);
                    });

                })
            });
        }
    }
}