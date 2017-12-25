import {Component, OnDestroy, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {Logger} from "../../core/logger/logger";
import {UtilityService} from "../../core/services/utility.service";
import {BrowserSupportService} from "../../core/services/browser-support.service";

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
                       private browserSupport: BrowserSupportService) {
        // initialize userObject from token;
        this.className = 'PickerComponent';
        this.isPlatformBrowser = this.browserSupport.isPlatformBrowser;
    }

    /**
     *
     */
    ngOnInit() {

    }

    /**
     *
     */
    ngOnDestroy() {
    }
}
