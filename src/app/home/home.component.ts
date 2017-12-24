import {Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {Logger} from "../core/logger/logger";
import {Router} from "@angular/router";
import {TitleService} from "../core/services/title.service";
import {ObservableMedia} from "@angular/flex-layout";


@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {

    constructor(private logger: Logger, private router: Router, private media: ObservableMedia, private titleService: TitleService) {

    }


    ngOnInit() {
        if (!(this.media.isActive('xs') || this.media.isActive('sm'))) {
        }
        this.titleService.setTitle("home");
        this.titleService.setMetaTags("home");
    }


    ngOnDestroy() {
    }
}
