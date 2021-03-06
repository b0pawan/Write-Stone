import {Injectable} from '@angular/core';
import {HttpEvent, HttpEventType, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from "rxjs/Observable";
import {Logger} from "../../logger/logger";
import {tap} from "rxjs/operators";


@Injectable()
export class CommonInterceptor implements HttpInterceptor {

    className: string;

    constructor(private logger: Logger) {
        this.className = "CommonInterceptor";
    }


    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const started = Date.now();
        return next.handle(req).pipe(tap(event => {
            if (event.type === HttpEventType.Response) {
                const elapsed = Date.now() - started;
                this.logger.debug(`${this.className}: Request for ${req.urlWithParams} took ${elapsed} ms.`);
            }
        }));

    }
}