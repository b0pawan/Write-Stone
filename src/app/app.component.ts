import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from "@angular/core";
import {NavigationEnd, Router} from "@angular/router";
import {Logger} from "./core/logger/logger";
import {Subscription} from "rxjs/Subscription";
import {isPlatformBrowser, isPlatformWorkerApp, isPlatformWorkerUi} from "@angular/common";
import {UtilityService} from "./core/services/utility.service";
import {BrowserSupportService} from "./core/services/browser-support.service";

@Component({
    selector: 'fincash-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

    // logInDialogRef: MatDialogRef<LoginComponent>;
    routerChangeSubscription: Subscription;
    private className: string;
    private isPlatformBrowser: boolean;

    public constructor(public logger: Logger, private router: Router, @Inject(PLATFORM_ID) private platformId: any, private utilityService: UtilityService,
                       private browserSupport: BrowserSupportService) {
        // initialize userObject from token;
        this.className = 'AppComponent';
        this.isPlatformBrowser = isPlatformBrowser(this.platformId) || isPlatformWorkerApp(this.platformId) || isPlatformWorkerUi(this.platformId);
    }

    /**
     *
     */
    ngOnInit() {
        this.browserSupport.checkBasicBrowserSupport();
        this.routerChangeSubscription = this.router.events.subscribe((evt) => {
            this.logger.debug(this.className, "event", evt);
            if (!(evt instanceof NavigationEnd)) {
                return;
            }

            if (this.isPlatformBrowser) {
                this.utilityService.scrollToTop();
            }
        });
    }

    /**
     *
     */
    ngOnDestroy() {
    }
}
