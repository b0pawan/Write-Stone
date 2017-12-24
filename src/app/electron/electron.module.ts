import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatSnackBarModule} from "@angular/material";
import {ELECTRON_SERVICES} from "./services";

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  exports: [],
  declarations: [ELECTRON_SERVICES]
})
export class ElectronAppModule { }
