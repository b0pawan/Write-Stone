import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-info-dialog',
    templateUrl: './info-dialog.component.html',
    styleUrls: ['../shared.styles.scss']
})
export class InfoDialogComponent implements OnInit {

    config: any;

    constructor(public dialogRef: MatDialogRef<InfoDialogComponent>) {
    }

    ngOnInit() {
    }

}
