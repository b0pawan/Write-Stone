import {Component, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
import {HttpErrorImpl, HttpErrorService, HttpSuccessImpl} from "../../core/services/http/http-error.service";
import {Logger} from "../../core/logger/logger";
import {SnackBarService} from "../../core/services/snack-bar.service";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";
import {MatSnackBarRef, SimpleSnackBar} from "@angular/material";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import * as HttpStatusCodes from 'http-status-codes';
import {debounceTime, map, timeout} from "rxjs/operators";
import "rxjs/add/observable/interval";

@Component({
    selector: 'app-http-connectivity-display',
    templateUrl: './http-connectivity-display.component.html',
    styles: []
})
export class HttpConnectivityDisplayComponent implements OnInit, OnDestroy {

    className: String;
    connectivityCheckingTimer: Subscription;
    healthCheck: Subscription;
    snackBarReference: MatSnackBarRef<SimpleSnackBar>;
    httpErrorObservable:Subscription;

    constructor(private viewContainerRef: ViewContainerRef, private httpErrorService: HttpErrorService,
                private snackBarService: SnackBarService, public logger: Logger, private httpClient: HttpClient) {
        this.className = 'HttpConnectivityDisplayComponent';
    }

    /**
     *
     * @returns {Observable<boolean>}
     */
    public checkConnectivity() {
        const checkUrl = environment.serverUrl + '?t=' + new Date().getTime();
        return this.httpClient.get<any>(checkUrl, {observe: 'response'}).pipe(timeout(5000), map((resp) => {
            return resp.status === HttpStatusCodes.OK;
        }));
    }

    ngOnInit() {

        this.httpErrorObservable = this.httpErrorService.httpErrorObservable.pipe(debounceTime(3000)).subscribe((httpError: any) => {
            if (httpError instanceof HttpErrorImpl) {
                if (httpError.connectivityError) {
                    this.snackBarReference = this.snackBarService.IndefiniteSnackBar("CONNECTIVITY ERROR", this.viewContainerRef);
                    // check for connectivity every 5 seconds;
                    this.connectivityCheckingTimer = Observable.interval(5000).subscribe(() => {
                        this.healthCheck = this.checkConnectivity().subscribe((status) => {
                            if (status) {
                                // connectivity resumes
                                if (this.connectivityCheckingTimer) {
                                    this.connectivityCheckingTimer.unsubscribe();
                                }
                                if (this.snackBarReference) {
                                    this.snackBarReference.dismiss();
                                }
                            } else {
                                this.logger.debug(this.className, "connectivity still not available");
                            }
                            // unsubscribe healthcheck as this needed to be called once.
                            if (this.healthCheck) {
                                this.healthCheck.unsubscribe();
                            }
                        }, (err) => {
                            // error checking connectivity
                            this.logger.error(this.className, err);
                        });
                    });
                } else {
                    this.snackBarReference = this.snackBarService.showSnackBar("PLEASE TRY AGAIN", "OKAY", this.viewContainerRef);
                }
            } else if (httpError instanceof HttpSuccessImpl) {
                // success case ...
                if (this.connectivityCheckingTimer) {
                    this.connectivityCheckingTimer.unsubscribe();
                }
                if (this.snackBarReference) {
                    this.snackBarReference.dismiss();
                }
            }
        });


    }

    ngOnDestroy() {
        if (this.connectivityCheckingTimer) {
            this.connectivityCheckingTimer.unsubscribe();
        }
        if (this.snackBarReference) {
            this.snackBarReference.dismiss();
        }
        if (this.healthCheck) {
            this.healthCheck.unsubscribe();
        }
        if(this.httpErrorObservable){
            this.httpErrorObservable.unsubscribe();
        }
    }

}
