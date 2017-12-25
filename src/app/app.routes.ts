import {ModuleWithProviders} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {PickerComponent} from "./electron/component/picker.component";

const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'picker', component: PickerComponent}
];

export const routes: ModuleWithProviders = RouterModule.forRoot(appRoutes);

export const appRoutingProviders: any[] = [];

export const routedComponents = [];
