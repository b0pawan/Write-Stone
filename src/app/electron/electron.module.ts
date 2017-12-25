import {NgModule} from '@angular/core';
import {ELECTRON_SERVICES} from "./services";
import {NgxElectronModule} from "ngx-electron";
import {PickerComponent} from "./component/picker.component";
import {CommonModule} from "@angular/common";

@NgModule({
  imports: [NgxElectronModule, CommonModule],
  exports: [PickerComponent, NgxElectronModule],
  providers: [ELECTRON_SERVICES],
  declarations: [PickerComponent]
})
export class ElectronAppModule { }
