import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {appRoutingProviders, routes} from "./app.routes";
import {AppComponent} from "./app.component";
import {CoreModule} from "./core/core.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations"
import {RECORDER_COMPONENTS} from "./recorder/index";
import {SharedModule} from "./shared/shared.module";
import {ServiceWorkerModule} from "@angular/service-worker";
import {environment} from "../environments/environment";
import {BrowserSupportService} from "./core/services/browser-support.service";
import {HttpConnectivityDisplayModule} from "./http-connectivity-display/http-connectivity-display.module";
import {PickerService} from "./electron/services/picker.service";
import {Logger} from "./core/logger/logger";
import {ElectronService} from "ngx-electron";
import {VideoSourceService} from "./electron/services/video.sources";

@NgModule({
    imports: [
        BrowserModule.withServerTransition({appId: 'ws'}),
        BrowserAnimationsModule,
        ServiceWorkerModule.register('/worker-basic.min.js', {scope: '/', enabled : environment.serviceWorker}),
        CoreModule.forRoot(),
        HttpConnectivityDisplayModule,
        SharedModule,
        routes
    ],
    exports: [
        BrowserModule,
        CoreModule,
        HttpConnectivityDisplayModule,
        SharedModule,
        AppComponent,
        RECORDER_COMPONENTS
    ],
    declarations: [AppComponent, RECORDER_COMPONENTS],
    providers: [appRoutingProviders],
    entryComponents: [],
    bootstrap: [AppComponent]
})

export class AppModule {
    constructor(private bss : BrowserSupportService, private pickerService: PickerService, private logger: Logger, private _electronService: ElectronService, private videoSourceService: VideoSourceService) {
        this.logger.log("AppModule browser >>> ", this.bss.isPlatformBrowser, ' electron app ' , this._electronService.isElectronApp);
        if (this.bss.isPlatformBrowser && this._electronService.isElectronApp) {
            this.pickerService.init();
            this.videoSourceService.init();
        }
    }
}

