import {ModuleWithProviders} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "./home/home.component";

const appRoutes: Routes = [
    {path: '', component: HomeComponent}
];

export const routes: ModuleWithProviders = RouterModule.forRoot(appRoutes);

export const appRoutingProviders: any[] = [];

export const routedComponents = [];
