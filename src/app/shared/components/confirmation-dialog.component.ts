import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';


@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['../shared.styles.scss']
})
export class ConfirmationDialogComponent implements OnInit {

    config: any;

    constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {
    }

    ngOnInit() {
    }

}
