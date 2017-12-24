import {Injectable, ViewContainerRef} from "@angular/core";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Logger} from "../logger/logger";
import {MatSnackBar, MatSnackBarConfig} from "@angular/material";

@Injectable()
export class SnackBarService {

    guardMessageSubject: BehaviorSubject<string[]>;
    guardMessageObservable: Observable<string[]>;
    className: string;

    constructor(private matSnackBar: MatSnackBar,  public logger: Logger) {
        this.className = "SnackBarService";
        this.guardMessageSubject = new BehaviorSubject<string[]>([]);
        this.guardMessageObservable = this.guardMessageSubject.asObservable();
    }

    showSnackBar(message: string, action: any, viewContainerRef: ViewContainerRef, timeInMilli?: number) {
        let config = new MatSnackBarConfig();
        config.duration = timeInMilli || 5000;
        config.viewContainerRef = viewContainerRef;
        return this.matSnackBar.open(message, action, config);
    }

    showIndefiniteSnackBar(message: string, action: any, viewContainerRef: ViewContainerRef) {
        let config = new MatSnackBarConfig();
        config.duration = 86400000;
        config.viewContainerRef = viewContainerRef;
        return this.matSnackBar.open(message, action, config);
    }

    public IndefiniteSnackBar(message: string, viewContainerRef: ViewContainerRef , action?: any) {
        let config = new MatSnackBarConfig();
        config.duration = 86400000;
        config.viewContainerRef = viewContainerRef;
        return this.matSnackBar.open(message, action, config);
    }

    resetGuardMessages(){
        this.guardMessageSubject.next([]);
    }

    setGuardMessage(message: string) {
        let newValue = this.guardMessageSubject.getValue();
        newValue.pop();
        newValue.push(message);
        this.logger.debug(this.className, newValue);
        this.guardMessageSubject.next(newValue);
    }
}