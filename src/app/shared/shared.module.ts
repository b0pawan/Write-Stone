import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {FlexLayoutModule} from "@angular/flex-layout";
import {FincashMaterialModule} from "./FincashMaterialModule";
import {FC_PIPES} from "./pipes/index";
import {SHARED_COMPONENTS, SHARED_DIALOGS} from "./components/index";
import {SHARED_DIRECTIVES} from "./directives/index";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";


@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        FincashMaterialModule,
        RouterModule,
    ],
    exports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        FincashMaterialModule,
        FC_PIPES,
        SHARED_COMPONENTS,
        SHARED_DIRECTIVES
    ],
    entryComponents: [SHARED_DIALOGS],
    declarations: [FC_PIPES, SHARED_COMPONENTS]
})

export class SharedModule {
}