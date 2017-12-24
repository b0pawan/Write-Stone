import {HttpService} from "./http/http-service.service";
import {SnackBarService} from "./snack-bar.service";
import {TitleService} from "./title.service";
import {UtilityService} from "./utility.service";
import {HttpErrorService} from "./http/http-error.service";
import {Logger} from "../logger/logger";
import {BrowserSupportService} from "./browser-support.service";

export const FC_SERVICES = [
    HttpService,
    SnackBarService,
    TitleService,
    UtilityService,
    HttpErrorService,
    BrowserSupportService,
    Logger
];
