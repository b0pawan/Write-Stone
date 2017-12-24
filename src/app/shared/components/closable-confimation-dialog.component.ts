import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-closable-confirmation-dialog',
    templateUrl: './closable-confirmation-dialog.component.html',
    styleUrls: ['../shared.styles.scss']
})
export class ClosableConfirmationDialogComponent implements OnInit {

    config: any;

    constructor(public dialogRef: MatDialogRef<ClosableConfirmationDialogComponent>) {
    }

    ngOnInit() {
    }

}
