import {Component, OnDestroy, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {Logger} from "../../core/logger/logger";
import {UtilityService} from "../../core/services/utility.service";
import {BrowserSupportService} from "../../core/services/browser-support.service";
import {TitleService} from "../../core/services/title.service";
import {RecorderService} from "../services/recorder.service";
import {PickerService} from "../services/picker.service";
import {Subscription} from "rxjs/Subscription";
import {ElectronService} from "ngx-electron";
import {Subject} from "rxjs/Subject";

@Component({
    selector: 'ws-picker',
    templateUrl: './picker.component.html',
    styleUrls: ['./picker.component.scss'],
})
export class PickerComponent implements OnInit, OnDestroy {

    // logInDialogRef: MatDialogRef<LoginComponent>;
    private className: string;
    private isPlatformBrowser: boolean;
    sourcesList: Subject<any[]>;
    sourcesSubs: Subscription;

    public constructor(public logger: Logger, private router: Router, private utilityService: UtilityService,
                       private browserSupport: BrowserSupportService, private titleService: TitleService,
                       public recorderService : RecorderService, public pickerService : PickerService, private _electronService: ElectronService) {
        // initialize userObject from token;
        this.className = 'PickerComponent';
        this.isPlatformBrowser = this.browserSupport.isPlatformBrowser;
        this.sourcesList = new Subject<any[]>();
    }

    ngOnInit() {
        this.titleService.setTitle("picker");
        this.titleService.setMetaTags("picker");
        this.sourcesSubs = this.pickerService.sourcesList.subscribe((sources) => {
            this.logger.log(this.className, 'sources count ', sources.length);
            const sourcesItems = [];
            for (let source of sources) {
                let thumb = source.thumbnail.toDataURL();
                if (!thumb) continue;
                const title = source.name.slice(0, 20);
                const domifiedItem = `<li><a href="#"><img src="${thumb}"><span>${title}</span></a></li>`;
                const item = { thumb_nail : thumb, title_text: title, source_id : source.id, domified : domifiedItem};
                sourcesItems.push(item);
            }
            this.sourcesList.next(sourcesItems);
            this.logger.debug(this.className, sourcesItems);
            /*let links = sourcesList.querySelectorAll('a');
            for (let i = 0; i < links.length; ++i) {
                let closure = (i) => {
                    return (e) => {
                        e.preventDefault();
                        this._electronService.ipcRenderer.send('source-id-selected', sources[i].id);
                        sourcesList.innerHTML = '';
                    }
                };
                links[i].onclick = closure(i);
            }*/
        });
    }

    sourceOnClick(source_id) {
        this.logger.log(this.className, " source id " , source_id);
        this._electronService.ipcRenderer.send('source-id-selected', source_id);
    }


    ngOnDestroy() {
        if (this.sourcesSubs) {
            this.sourcesSubs.unsubscribe();
        }
    }
}
