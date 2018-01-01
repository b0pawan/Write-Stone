import {ModuleWithProviders} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {RecorderComponent} from "./recorder/recorder.component";
import {PickerComponent} from "./electron/component/picker.component";

const appRoutes: Routes = [
    {path: '', component: RecorderComponent},
    {path: 'picker', component: PickerComponent}
];

export const routes: ModuleWithProviders = RouterModule.forRoot(appRoutes, {
    initialNavigation : 'enabled'
});

export const appRoutingProviders: any[] = [];

export const routedComponents = [];
