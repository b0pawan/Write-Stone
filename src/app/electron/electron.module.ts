import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatSnackBarModule} from "@angular/material";
import {ELECTRON_SERVICES} from "./services";
import {PickerComponent} from "./picker.component";

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  exports: [],
  declarations: [ELECTRON_SERVICES, PickerComponent]
})
export class ElectronAppModule { }
