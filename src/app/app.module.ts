import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {appRoutingProviders, routes} from "./app.routes";
import {AppComponent} from "./app.component";
import {CoreModule} from "./core/core.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations"
import {HOME_COMPONENTS} from "./home/index";
import {ProductModule} from "./product/product.module";
import {SharedModule} from "./shared/shared.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {FundSearchBarHeaderModule} from "./fund-search-bar/fund-search-header.module";
import {FincashNotificationService} from "./core/services/fincash.notification.service.";
import {HttpConnectivityDisplayModule} from "./http-connectivity-display/http-connectivity-display.module";
import {AnalyticsService} from "./core/services/analytics.service";
import {UtilityModule} from "./utility/utility.module";
import {FincashPWAService} from "./core/services/fincash.pwa.service.";
import {HeaderDataService} from "./home/header/header-data.service";
import {ServiceWorkerModule} from "@angular/service-worker";
import {environment} from "../environments/environment";
declare var cordova: any;
@NgModule({
    imports: [
        BrowserModule.withServerTransition({appId: 'fc'}),
        BrowserAnimationsModule,
        ServiceWorkerModule.register('/worker-basic.min.js', {scope: '/', enabled : environment.serviceWorker}),
        CoreModule.forRoot(),
        SharedModule,
        InfiniteScrollModule,
        ProductModule,
        UtilityModule,
        FundSearchBarHeaderModule,
        HttpConnectivityDisplayModule,
        routes
    ],
    exports: [
        BrowserModule,
        CoreModule,
        SharedModule,
        ProductModule,
        UtilityModule,
        FundSearchBarHeaderModule,
        HttpConnectivityDisplayModule,
        AppComponent,
        HOME_COMPONENTS
    ],
    declarations: [AppComponent, HOME_COMPONENTS],
    providers: [appRoutingProviders, HeaderDataService],
    entryComponents: [],
    bootstrap: [AppComponent]
})

export class AppModule {
    constructor(private notificationService: FincashNotificationService, private analyticsService: AnalyticsService, private fincashPWAService: FincashPWAService) {
        if (this.fincashPWAService.isPlatformBrowser) {
            this.analyticsService.loadGA();
            this.analyticsService.init();
            this.notificationService.init();
            this.fincashPWAService.registerPwaWatcher();
            if (this.fincashPWAService.isHybridApplication) {
                window.open = cordova.InAppBrowser.open;
            }
        }
    }
}

