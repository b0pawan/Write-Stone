import {NgModule} from '@angular/core';
import {ELECTRON_SERVICES} from "./services";
import {PickerComponent} from "./picker.component";

@NgModule({
  imports: [],
  exports: [PickerComponent],
  providers: [ELECTRON_SERVICES],
  declarations: [PickerComponent]
})
export class ElectronAppModule { }
