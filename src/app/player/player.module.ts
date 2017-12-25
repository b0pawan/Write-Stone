import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VgCoreModule } from "videogular2/core";
import { VgControlsModule } from "videogular2/controls";
import { VgOverlayPlayModule } from "videogular2/overlay-play";
import {VideoPlayerComponent} from "./player.component";

@NgModule({
    imports: [
        CommonModule,
        VgCoreModule,
        VgControlsModule,
        VgOverlayPlayModule
    ],
    exports: [VideoPlayerComponent],
    declarations: [ VideoPlayerComponent ]
})
export class VideoPlayerModule {
}
