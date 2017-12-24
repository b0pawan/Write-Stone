import {Component, OnDestroy, OnInit} from "@angular/core";
import {MatDialogRef} from "@angular/material";
import {Subscription} from "rxjs/Subscription";
import {Logger} from "../../core/logger/logger";

@Component({
    selector: 'app-loading-dialog',
    templateUrl: './loading-dialog.component.html',
    styleUrls: ['../shared.styles.scss']
})


export class LoadingDialogComponent implements OnInit, OnDestroy {

    config: any;
    closingSubscription: Subscription;

    constructor(public dialogRef: MatDialogRef<LoadingDialogComponent>, private logger: Logger) {
    }

    ngOnInit() {

    }

    ngOnDestroy() {

    }


}
