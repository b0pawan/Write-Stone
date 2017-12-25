import {NgModule} from '@angular/core';
import {ELECTRON_SERVICES} from "./services";
import {PickerComponent} from "./picker.component";
import {NgxElectronModule} from "ngx-electron";

@NgModule({
  imports: [NgxElectronModule],
  exports: [PickerComponent, NgxElectronModule],
  providers: [ELECTRON_SERVICES],
  declarations: [PickerComponent]
})
export class ElectronAppModule { }
