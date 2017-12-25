import {ErrorHandler, ModuleWithProviders, NgModule, Optional, SkipSelf} from "@angular/core";
import {WS_SERVICES} from "./services/index";
import {WS_GUARDS} from "./guards/index";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {CommonInterceptor} from "./services/http/common.interceptor";
import {AuthInterceptor} from "./services/http/auth.interceptor";
import {CSRFInterceptor} from "./services/http/csrf.interceptor";
import {ErrorInterceptor} from "./services/http/error.interceptor";
import {WSErrorHandler} from "./handler/wsErrorHandler";
import {ElectronAppModule} from "../electron/electron.module";
import {VideoPlayerModule} from "../player/player.module";
import {ELECTRON_SERVICES} from "../electron/services";
import {NgxElectronModule} from "ngx-electron";

export function interceptorProvider() {
    return [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: CommonInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: CSRFInterceptor,
            multi: true
        }];
}

export function provideErrorHandler() {
    return [{provide: ErrorHandler, useClass: WSErrorHandler}];
}


@NgModule({
    imports: [HttpClientModule, ElectronAppModule],
    exports: [HttpClientModule, ElectronAppModule],
    providers: [WS_SERVICES, WS_GUARDS, interceptorProvider(), provideErrorHandler()],
})
export class CoreModule {

    /**
     *
     * @param {CoreModule} parentModule
     */
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error('CoreModule is already loaded. Import it in the AppModule only');
        }
    }

    /**
     *
     * @returns {ModuleWithProviders}
     */
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule,
            providers: []
        };
    }
}
