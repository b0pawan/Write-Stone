import {Injectable} from '@angular/core';
import {
    HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,
    HttpResponse
} from '@angular/common/http';
import {Observable} from "rxjs/Observable";
import {Logger} from "../../logger/logger";
import * as HttpStatusCodes from 'http-status-codes';
import {HttpErrorImpl, HttpErrorService, HttpSuccessImpl} from "./http-error.service";
import {catchError, tap} from "rxjs/operators";


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    className: string;

    constructor(private logger: Logger, private httpErrorService: HttpErrorService) {
        this.className = 'ErrorInterceptor';
    }

    /**
     *
     * @param {HttpRequest<any>} req
     * @param {HttpHandler} next
     * @returns {Observable<HttpEvent<any>>}
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.method.toLowerCase() === 'get' || req.method.toLowerCase() === 'post') {
            return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // do stuff with response if you want
                    this.connectivityResumes(event);
                }
            }), catchError((error: any) => {
                if (error instanceof HttpErrorResponse) {
                    return this.handleError(error);
                }
            }));
        } else {
            return next.handle(req);
        }
    }

    /**
     *
     * @param {HttpResponse} resp
     */
    private connectivityResumes(resp: HttpResponse<any>) {
        this.httpErrorService.httpErrorSubject.next(new HttpSuccessImpl(resp.status));
    }

    /**
     *
     * @param {HttpErrorResponse} error
     * @returns {ErrorObservable}
     */
    private handleError(error: HttpErrorResponse) {
        const errMsg = `${error.status} - ${error.statusText || ''} ${error.message}`;
        this.logger.error(this.className, errMsg);
        if (error.status === 0 || error.status === HttpStatusCodes.SERVICE_UNAVAILABLE
            || error.status === HttpStatusCodes.GATEWAY_TIMEOUT ||
            error.status === 508 || error.status === 511 || error.status === 599) {
            // connectivity errors
            this.httpErrorService.httpErrorSubject.next(new HttpErrorImpl(errMsg, error.status, true));
        } else {
            // other errors
            this.httpErrorService.httpErrorSubject.next(new HttpErrorImpl(errMsg, error.status));
        }
        return Observable.throw(errMsg);
    }
}

