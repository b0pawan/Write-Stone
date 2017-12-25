import {Component, OnDestroy, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {Logger} from "../../core/logger/logger";
import {UtilityService} from "../../core/services/utility.service";
import {BrowserSupportService} from "../../core/services/browser-support.service";
import {TitleService} from "../../core/services/title.service";
import {RecorderService} from "../services/recorder.service";
import {PickerService} from "../services/picker.service";

@Component({
    selector: 'ws-picker',
    templateUrl: './picker.component.html',
    styleUrls: ['./picker.component.scss'],
})
export class PickerComponent implements OnInit, OnDestroy {

    // logInDialogRef: MatDialogRef<LoginComponent>;
    private className: string;
    private isPlatformBrowser: boolean;

    public constructor(public logger: Logger, private router: Router, private utilityService: UtilityService,
                       private browserSupport: BrowserSupportService, private titleService: TitleService,
                       public recorderService : RecorderService, public pickerService : PickerService) {
        // initialize userObject from token;
        this.className = 'PickerComponent';
        this.isPlatformBrowser = this.browserSupport.isPlatformBrowser;
    }

    /**
     *
     */
    ngOnInit() {
        this.titleService.setTitle("picker");
        this.titleService.setMetaTags("picker");

    }

    /**
     *
     */
    ngOnDestroy() {
    }
}
