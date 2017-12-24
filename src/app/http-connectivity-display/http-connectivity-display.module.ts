import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpConnectivityDisplayComponent} from './http-connectivity-display/http-connectivity-display.component';
import {MatSnackBarModule} from "@angular/material";

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  exports: [HttpConnectivityDisplayComponent],
  declarations: [ HttpConnectivityDisplayComponent]
})
export class HttpConnectivityDisplayModule { }
