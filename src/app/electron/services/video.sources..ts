import {Injectable, NgZone} from "@angular/core";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/interval";
import {ElectronService} from 'ngx-electron';
import {Logger} from "../../core/logger/logger";
import {UtilityService} from "../../core/services/utility.service";
import {BrowserSupportService} from "../../core/services/browser-support.service";
import {Subject} from "rxjs/Subject";

@Injectable()
export class VideoSourceService {

    public className: string;
    public source: Subject<any>;
    constructor(private logger: Logger, private utility : UtilityService, private _electronService: ElectronService, private bss: BrowserSupportService,
                private ngZone: NgZone) {
        this.className = 'VideoSourceService';
        this.source = new Subject<any>();
    }
}