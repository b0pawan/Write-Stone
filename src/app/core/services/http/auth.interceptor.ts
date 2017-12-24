import {Injectable} from '@angular/core';
import {HttpEvent, HttpEventType, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from "rxjs/Observable";
import {Logger} from "../../logger/logger";
import {tap} from "rxjs/operators";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    className: string;
    constructor(private logger: Logger) {
        this.className = 'AuthInterceptor';
    }

    public setToken(value: any) {
        // this.tokenStore.tokenSubject.next(value);
    }

    public getToken() {
        return '';
        // return this.tokenStore.tokenSubject.getValue();
    }

    /**
     *
     * @returns {HttpHeaders}
     */
    setHttpClientHeader(httpHeaders: HttpHeaders) {
        const getToken = this.getToken();
        const token = getToken ? getToken : '';
        // FIX FOR IOS9 (Iphone 6 support as empty authorization error is not allowed)
        if (token.length > 0) {
            return httpHeaders.set('Authorization', `Bearer ${token}`);
        } else {
            return httpHeaders;
        }
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url.indexOf('/secure') !== -1) {
            const authReq = req.clone({headers: this.setHttpClientHeader(req.headers)});
            return next.handle(authReq).pipe(tap(httpEvent => {
                this.extractSecureData(httpEvent);
            }));
        } else {
            return next.handle(req);
        }

    }

    private extractSecureData(httpEvent: HttpEvent<any>) {
        if (httpEvent.type === HttpEventType.Response) {
            const body = httpEvent.body;
            if (!body['success'] && (body['refreshtoken'] || body['unauthorizedAccess'])) {
                //  this.loginService.logOutUser(environment.dloginUrl, false);
                // this.tokenStore.logout.next({state: false, url: environment.dloginUrl});
            } else {
                // const headerToken = httpEvent.headers.get(environment.authToken);
                // this.tokenStore.processToken(body, headerToken, false);
            }
        }
    }
}