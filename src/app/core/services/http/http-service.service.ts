import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Logger} from "../../logger/logger";
import {environment} from "../../../../environments/environment";
import {isNullOrUndefined} from "util";
import {HttpClient} from "@angular/common/http";
import {retry, timeout} from "rxjs/operators";

@Injectable()
export class HttpService {

    className: string;
    private requests: any;
    public httpErrorSubject: Subject<any>;
    public httpErrorObservable: Observable<any>;
    httpTimeout: number;
    retryCount: number;

    /**
     *
     * @param {HttpClient} httpClient
     * @param {Logger} logger
     */
    constructor(private httpClient: HttpClient, private logger: Logger) {
        this.className = 'HttpService';
        this.httpTimeout = 90000; // 180 second is load balance timeout & it throws gateway timeout exception
        this.retryCount = 1;
        this.requests = {};
        this.httpErrorSubject = new Subject<any>();
        this.httpErrorObservable = this.httpErrorSubject.asObservable();
    }


    /**
     *
     * @param {string} path
     * @param {number} _timeout
     * @param {number} _retry
     * @param {boolean} suppressErrors
     * @returns {Observable<any>}
     */
    get(path: string, _timeout?: number, _retry?: number, suppressErrors?: boolean): Observable<any> {
        path = environment.serverUrl + path + "?t=" + new Date().getTime();
        return this.httpClientGet(path, _timeout, _retry);
    }

    /**
     *
     * @param {string} path
     * @param {number} _timeout
     * @param {number} _retry
     * @param {boolean} suppressErrors
     * @returns {Observable<any>}
     */
    secureGet(path: string, _timeout?: number, _retry?: number, suppressErrors?: boolean): Observable<any> {
        path = environment.serverUrl + '/secure' + path + "?t=" + new Date().getTime();
        return this.httpClientGet(path, _timeout, _retry);
    }

    /**
     *
     * @param {string} path
     * @param data
     * @param {number} _timeout
     * @param {number} _retry
     * @param {boolean} suppressErrors
     * @returns {Observable<any>}
     */
    post(path: string, data: any, _timeout?: number, _retry?: number, suppressErrors?: boolean): Observable<any> {
        path = environment.serverUrl + path;
        return this.httpClientPost(path, data, _timeout, _retry);
    }

    /**
     *
     * @param {string} path
     * @param data
     * @param {number} _timeout
     * @param {number} _retry
     * @param {boolean} suppressErrors
     * @returns {Observable<any>}
     */
    securePost(path: string, data: any, _timeout?: number, _retry?: number, suppressErrors?: boolean): Observable<any> {
        path = environment.serverUrl + '/secure' + path;
        return this.httpClientPost(path, data, _timeout, _retry);
    }

    /**
     *
     * @param {string} path
     * @param {number} _timeout
     * @param {number} _retry
     * @returns {Observable<any>}
     */
    private httpClientGet(path: string, _timeout?: number, _retry?: number): Observable<any> {
        let timeout_ = this.httpTimeout;
        if (!isNullOrUndefined(_timeout)) {
            timeout_ = _timeout;
        }
        let retry_ = this.retryCount;
        if (!isNullOrUndefined(_retry)) {
            retry_ = _retry;
        }
        return this.httpClient.get<any>(path).pipe(retry(retry_), timeout(timeout_));
    }

    /**
     *
     * @param {string} path
     * @param data
     * @param {number} _timeout
     * @param {number} _retry
     * @returns {Observable<any>}
     */
    private httpClientPost(path: string, data: any, _timeout?: number, _retry?: number): Observable<any> {
        let timeout_ = this.httpTimeout;
        if (!isNullOrUndefined(_timeout)) {
            timeout_ = _timeout;
        }

        let retry_ = this.retryCount;
        if (!isNullOrUndefined(_retry)) {
            retry_ = _retry;
        }
        return this.httpClient.post<any>(path, data).pipe(retry(retry_), timeout(timeout_));
    }
}

