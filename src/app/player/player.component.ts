import {Component, OnDestroy, OnInit} from "@angular/core";
import {VideoSourceService} from "../electron/services/video.sources.";
import {Subscription} from "rxjs/Subscription";
import {Logger} from "../core/logger/logger";

@Component({
    selector: 'app-video-player',
    templateUrl: './player.component.html',
    styleUrls: [ './player.component.css' ]
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
    source: any;
    sourceSubs: Subscription;
    className: string;
    constructor(private logger: Logger, private videoSourceService : VideoSourceService) {
        this.source = null;
        this.className = 'VideoPlayerComponent';
    }

    ngOnInit() {
        this.sourceSubs = this.videoSourceService.source.asObservable().subscribe( (src) => {
            this.logger.debug(this.className, ' source ' , this.source);
            if (src !=null ) {
                this.source = this.videoSourceService.saveData(this.source.src);
            }else {
                this.source = null;
            }
        });
    }
    ngOnDestroy() {
        if (this.sourceSubs){
            this.sourceSubs.unsubscribe();
        }
    }
}
