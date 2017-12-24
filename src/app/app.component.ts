import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from "@angular/core";
import {NavigationEnd, Router} from "@angular/router";
import {Logger} from "./core/logger/logger";
import {Subscription} from "rxjs/Subscription";
import {isPlatformBrowser, isPlatformWorkerApp, isPlatformWorkerUi} from "@angular/common";
import {UtilityService} from "./core/services/utility.service";
import {BrowserSupportService} from "./core/services/browser-support.service";
import {ChatService} from "./core/services/chat.service";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/take";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/retry";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/interval";
import 'rxjs/add/observable/of';
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/concat";
import "rxjs/add/operator/map";
import {AnalyticsService} from "./core/services/analytics.service";
import {MobileDeviceService} from "./core/services/mobile-device.service";

declare var olark: Function;

@Component({
    selector: 'fincash-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

    // logInDialogRef: MatDialogRef<LoginComponent>;
    routerChangeSubscription: Subscription;
    private className: string;
    private chatboxStateObservable: Observable<boolean>;
    private chatboxSubsription: Subscription;
    private isPlatformBrowser: boolean;

    public constructor(public logger: Logger, private router: Router, @Inject(PLATFORM_ID) private platformId: any, private utilityService: UtilityService,
                       private browserSupport: BrowserSupportService, private  chatService: ChatService,
                       private analyticsService: AnalyticsService, private deviceService: MobileDeviceService) {
        // initialize userObject from token;
        this.className = 'AppComponent';
        this.isPlatformBrowser = isPlatformBrowser(this.platformId) || isPlatformWorkerApp(this.platformId) || isPlatformWorkerUi(this.platformId);
        this.chatboxStateObservable = this.chatService.chatboxState.asObservable();
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
                this.analyticsService.pageViewNav(evt);
            }
        });

        if (this.isPlatformBrowser) {
            this.chatboxSubsription = this.chatboxStateObservable.subscribe((state) => {
                this.logger.debug(this.className, " chatboxStateObservable.subscribe state ", state);
                this.chatService.fetchAndUpdateDetails();
                if (state) {
                    if (this.chatService.isOlarkLoaded) {
                        olark('api.box.show', (error) => {
                            this.logger.debug(this.className, error);
                        });
                    }
                } else {
                    if (this.chatService.isOlarkLoaded) {
                        this.chatService.isChatBoxOpened = false;
                        olark('api.box.hide', (error) => {
                            this.logger.debug(this.className, error);
                        });
                    }
                }
            });
        }
    }

    /**
     *
     */
    ngOnDestroy() {
        this.routerChangeSubscription.unsubscribe();
        if (this.chatboxSubsription) {
            this.chatboxSubsription.unsubscribe();
        }
        // clearing device related subscriptions
        this.deviceService.cleanUp();
    }
}
