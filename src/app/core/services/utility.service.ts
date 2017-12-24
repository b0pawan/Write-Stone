import {Inject, Injectable, PLATFORM_ID} from "@angular/core";
import {Logger} from "../logger/logger";
import {isPlatformBrowser, isPlatformWorkerApp, isPlatformWorkerUi, PlatformLocation} from "@angular/common";
import {DOCUMENT} from "@angular/platform-browser";
import {Observable} from "rxjs/Observable";
@Injectable()
export class UtilityService {
    isPlatformBrowser: boolean;
    document: any;
    baseUrl: string;

    /**
     *
     * @param logger
     * @param platformId
     * @param platformLocation
     * @param _document
     */
    constructor(private logger: Logger, @Inject(PLATFORM_ID) private platformId: any,
                private platformLocation: PlatformLocation,
                @Inject(DOCUMENT) private _document: any) {
        this.isPlatformBrowser = isPlatformBrowser(this.platformId) || isPlatformWorkerApp(this.platformId) || isPlatformWorkerUi(this.platformId)
        this.document = _document;
        this.baseUrl = this.platformLocation['location'].origin;
    }

    /**
     *
     * @param string
     * @param data
     * @returns {string}
     */
    public parseString(string: string, data: any): string {
        let regEx = /{([a-zA-Z0-9.]+)}/;
        let stringArray = string.match(regEx);
        this.logger.debug("UtilityService", data);

        while (stringArray) {
            let keyString = stringArray[1];
            let keyStringArray = keyString.split('.');
            let tempData = data;
            let replacementString = stringArray[0];
            keyStringArray.forEach(key => {
                if (tempData && tempData[key]) {
                    tempData = tempData[key];
                } else {
                    tempData = "";
                }
            });
            string = string.replace(replacementString, tempData);
            stringArray = string.match(regEx);
        }
        return string;
    }

    /**
     *
     * @param {string} elClassName
     */
    public scrollToFirstError(elClassName: string = 'form-error') {

        if (isPlatformBrowser(this.platformId) || isPlatformWorkerApp(this.platformId) || isPlatformWorkerUi(this.platformId)) {
            const interValSub = Observable.interval(500).take(1).subscribe(() => {
                const HTMLColl: HTMLCollection = this._document.getElementsByClassName(elClassName);
                if (HTMLColl && HTMLColl.item(0)) {
                    const clientRect = HTMLColl.item(0).getBoundingClientRect();
                    this.logger.debug('scrollToFirstError Client Rect -> ', clientRect);
                    if (clientRect) {
                        // add scrolledY to top(relative to viewport)
                        const docDestinationY = clientRect.top + window.pageYOffset;
                        this.smoothScrollTo( docDestinationY - 150);
                    }
                }
                if (interValSub) {
                    interValSub.unsubscribe();
                }
            });

        }
    }

    /**
     *
     */
    public scrollToTop() {

        if (isPlatformBrowser(this.platformId) || isPlatformWorkerApp(this.platformId) || isPlatformWorkerUi(this.platformId)) {
            let body = this._document.body; // For Chrome, Safari and Opera
            let bodyMoz = this._document.documentElement; // Firefox and IE places the overflow at the <html> level, unless else is specified. Therefore, we use the documentElement property for these two browsers
            if (body) {
                body.scrollTop = 0;
            }
            if (bodyMoz) {
                bodyMoz.scrollTop = 0;
            }
            //this._document.getElementsByClassName('fc-body')[0].scrollTop = 0;
        }
    }

    /**
     *
     * @param {number} to Y Position
     */
    smoothScrollTo(to?: number) {
        const _toPos = to ? to : 0;
        if (isPlatformBrowser(this.platformId) || isPlatformWorkerApp(this.platformId) || isPlatformWorkerUi(this.platformId)) {
            window.scrollTo({left: 0, top: _toPos, behavior: 'smooth'});
        }
    }

    /**
     *
     * @param redirectLink
     */
    public redirectionByWindow(redirectLink: string) {
        if (this.isPlatformBrowser) {
            window.location.href = redirectLink;
        }
    }

    /**
     *
     * @param url
     */
    public openByWindow(url: string) {
        if (this.isPlatformBrowser) {
            window.open(this.baseUrl + url, "_blank");
        }
    }

    /**
     *
     * @param date
     * @returns {string}
     */
    public getDateddMMyyyy(date?: Date): string {
        let currDate: Date;
        let month: string;
        let day: string;
        if (date) {
            currDate = date;
        } else {
            currDate = new Date();
        }

        if (currDate.getMonth() < 9) {
            month = "0" + (currDate.getMonth() + 1);
        } else {
            month = "" + (currDate.getMonth() + 1);
        }

        if (currDate.getDate() < 10) {
            day = "0" + currDate.getDate();
        } else {
            day = "" + currDate.getDate();
        }

        return day + "-" + month + "-" + currDate.getFullYear() + " 00:00:00"
    }

    public getDateddMMyyyyHHmmss(date?: Date): string {
        let currDate: Date;
        let month: string;
        let day: string;
        if (date) {
            currDate = date;
        } else {
            currDate = new Date();
        }

        if (currDate.getMonth() < 9) {
            month = "0" + (currDate.getMonth() + 1);
        } else {
            month = "" + (currDate.getMonth() + 1);
        }

        if (currDate.getDate() < 10) {
            day = "0" + currDate.getDate();
        } else {
            day = "" + currDate.getDate();
        }

        return day + "-" + month + "-" + currDate.getFullYear() + " " + this.addZero(currDate.getHours()) + ":"
            + this.addZero(currDate.getMinutes()) + ":" + this.addZero(currDate.getSeconds())
    }

    public stringToDate(dateString: string) {

        if (dateString && dateString.length > 0 ) {
            const dateObj = new Date(dateString);
            return dateObj;
        }
        return null;

    }

    private addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    public convertFromHex(hex) {
        var hex = hex.toString();//force conversion
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }

    public convertToHex(str) {
        var hex = '';
        for(var i=0;i<str.length;i++) {
            hex += ''+str.charCodeAt(i).toString(16);
        }
        return hex;
    }
}