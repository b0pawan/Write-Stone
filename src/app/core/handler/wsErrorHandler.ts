import {ErrorHandler, Inject, Injectable, PLATFORM_ID} from "@angular/core";
import {Logger} from "../logger/logger";
import {isPlatformBrowser, Location} from "@angular/common";
import * as StackTrace from 'stacktrace-js';
import {BrowserSupportService} from "../services/browser-support.service";

@Injectable()
export class WSErrorHandler implements ErrorHandler {
    className : string;
    isPlatformBrowser: boolean;
    constructor(private logger : Logger, private location : Location, private browserSupportService  : BrowserSupportService, @Inject(PLATFORM_ID) private platformId: any) {
        this.className = "WSErrorHandler";
        this.isPlatformBrowser = isPlatformBrowser(this.platformId);
    }

    handleError(error) {
        const message = error.message ? error.message : error.toString();
        const browser =  this.browserSupportService.browserName() + " " + this.browserSupportService.browserVersion();
        let url = "";
        if(this.isPlatformBrowser){
            url = this.location.path();
        }
        StackTrace.fromError(error).then(stackframes => {
            const stackString = stackframes.splice(0, 5).map(function (sf) {
                return sf.toString();
            }).join('\n');
            this.logger.error(this.className, "url >>> [", url, "] browser >>> [", browser, "] message [",message,"] stack  >>>" , stackString);
        });
    }
}