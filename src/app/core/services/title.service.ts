import {Injectable} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {metadescription, title} from "../../../properties/title";
import {Logger} from "../logger/logger";
import {UtilityService} from "./utility.service";
import {BrowserSupportService} from "./browser-support.service";
import {ElectronService} from "ngx-electron";

@Injectable()
export class TitleService {


    constructor(private title: Title, private metaService: Meta, private logger: Logger, private utilityService: UtilityService,
                private browserSupport: BrowserSupportService, private _electronService: ElectronService) {
    }

    /**
     *
     * @param key
     * @param data
     */
    setTitle(key: string, data?: any) {
        let titleString = `${title[key]}`;
        if (!titleString || titleString.length == 0) {
            titleString = `${title["home"]}`
        }
        const parsedTitle = this.parseString(titleString, data);
        this.title.setTitle(parsedTitle);
    }

    /**
     *
     * @param string
     * @param data
     * @returns {string}
     */
    private parseString(string: string, data: any): string {
        return this.utilityService.parseString(string, data);
    }

    /**
     *
     * @param key
     * @param data
     */
    public setMetaTags(key: string, data?: any) {
        let metaURL = "";
        let url;
        if (this.browserSupport.isPlatformBrowser) {
            if (this._electronService.isElectronApp) {
                metaURL = '';
            }else {
                url = window.location;
                if (url) {
                    metaURL = url.href;
                }
            }
        }

        let metaTitle = `${title[key]}`;
        if (!metaTitle || metaTitle.length == 0) {
            metaTitle = `${title["home"]}`;
        }
        metaTitle = this.parseString(metaTitle, data);
        let metaDescription = `${metadescription[key]}`;
        if (!metaDescription || metaDescription.length == 0) {
            metaDescription = `${metadescription["home"]}`
        }
        metaDescription = this.parseString(metaDescription, data);

        this.metaService.updateTag({name: 'description', content: metaDescription});
        this.metaService.updateTag({property: 'og:url', content: metaURL});
        this.metaService.updateTag({property: 'og:title', content: metaTitle});
        this.metaService.updateTag({property: 'og:description', content: metaDescription});
        this.metaService.updateTag({name: 'twitter:url', content: metaURL});
        this.metaService.updateTag({name: 'twitter:title', content: metaTitle});
        this.metaService.updateTag({name: 'twitter:description', content: metaDescription});
    }
}
