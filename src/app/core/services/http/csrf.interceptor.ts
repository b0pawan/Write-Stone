import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from "rxjs/Observable";
import {Logger} from "../../logger/logger";

@Injectable()
export class CSRFInterceptor implements HttpInterceptor {

    className: string;

    /**
     *
     * @param {Logger} logger
     */
    constructor(private logger: Logger,) {
        this.className = 'CSRFInterceptor';
    }

    /**
     *
     * @param {HttpRequest<any>} req
     * @param {HttpHandler} next
     * @returns {Observable<HttpEvent<any>>}
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req);
        /*
        if (req.method === 'GET' || req.urlWithParams.indexOf('/join') > -1) {
            return next.handle(req);
        } else {
            const CSRFHeaders = req.headers.set(environment.CSRFHeaderName, 'nocheck');
            const CSRFReq = req.clone({headers: CSRFHeaders});
            return next.handle(CSRFReq);
        }*/
    }
}