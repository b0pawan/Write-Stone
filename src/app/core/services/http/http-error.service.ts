import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";


@Injectable()
export class HttpErrorService {

    className: string;
    public httpErrorSubject: Subject<any>;
    public httpErrorObservable: Observable<any>;

    constructor() {
        this.className = 'HttpErrorService';
        this.httpErrorSubject = new Subject();
        this.httpErrorObservable = this.httpErrorSubject.asObservable();
    }
}

export class HttpSuccessImpl {
    /**
     *
     * @param {number} statusCode
     */
    constructor(public statusCode: number) {
    }
}

export class HttpErrorImpl {
    /**
     *
     * @param {string} errorMessage
     * @param {number} errorCode
     * @param {boolean} connectivityError
     */
    constructor(public errorMessage: string, public errorCode: number, public connectivityError: boolean = false) {
    }
}



