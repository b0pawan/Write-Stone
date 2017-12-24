import {
    AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnDestroy, OnInit,
    Output
} from '@angular/core';
import 'rxjs/add/observable/timer';
import {Observable} from 'rxjs/Observable';
import {isNullOrUndefined} from 'util';
import {BrowserSupportService} from "../../core/services/browser-support.service";
import {take} from "rxjs/operators";

@Component({
    selector: 'fix-cta-btn',
    template: ''
})

export class CTAfixComponent implements OnInit, OnDestroy, AfterViewInit {

    otherFixedElHeight: number;
    elPosY: number;
    elHeight: number;
    el: HTMLElement;

    @Input('fixcta') elDet: string;
    @Output('fixctaevent') private fixctaevent: EventEmitter<boolean> = new EventEmitter();

    constructor(@Inject(ElementRef) elementRef: ElementRef, private browserSupport: BrowserSupportService) {
        this.el = elementRef.nativeElement;
        this.otherFixedElHeight = 58;
        /*considering nav-bar is outside parent ele(with class .fc-body, with pos relative)*/
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        if (this.browserSupport.isPlatformBrowser) {
            const timerSub = Observable.timer(500).pipe(take(1)).subscribe((t) => {
                this.elPosY = this.el.offsetTop;
                this.elHeight = this.el.parentElement.offsetHeight;
                const windowPosY = window.pageYOffset;
                const devH = window.innerHeight;
                this.fireEvent(windowPosY, devH);
                timerSub.unsubscribe();
            });
        }
    }

    @HostListener("window:scroll", ['$event'])
    onWindowScroll(evnt) {
        if (this.browserSupport.isPlatformBrowser) {
            const windowPosY = window.pageYOffset;
            const devH = window.innerHeight;
            this.fireEvent(windowPosY, devH);
        }
    }

    private fireEvent(windowPosY: number, devH: number) {
        if (!isNullOrUndefined(this.elPosY) && !isNullOrUndefined(this.elHeight)
            && !isNullOrUndefined(devH) && !isNullOrUndefined(windowPosY)) {
            if ((this.elPosY + this.elHeight + this.otherFixedElHeight) > (devH + windowPosY)) {
                this.fixctaevent.next(true);
            } else {
                this.fixctaevent.next(false);
            }
        }
    }

    ngOnDestroy() {
    }
}
