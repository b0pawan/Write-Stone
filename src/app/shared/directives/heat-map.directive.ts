import {Directive, ElementRef, Input, OnInit, Renderer} from "@angular/core";


@Directive({
    selector: '[HeatMap]',
})


export class HeatMapDirective implements OnInit {

    @Input('startVal') public startVal: any;
    @Input('endVal') public endVal: string;
    @Input('pivot') public pivot: number;

    private colors: { [key: string]: string } = {
        "better": "#00C43B",
        "good": "#4AE756",
        "bad": "#FFE829",
        "worse": "#FE751E"
    };


    constructor(private el: ElementRef, private renderer: Renderer) {

    }

    ngOnInit() {
        this.processHeatMap();
    }

    processHeatMap() {
        let diff = +this.startVal - +this.endVal;
        /*console.log(diff);
        console.log(this.pivot)*/
        if (diff >= this.pivot)
            this.highlight(this.colors["better"])
        else if (diff < this.pivot && diff >= 0)
            this.highlight(this.colors["good"])
        else if (diff < 0 && diff >= (0 - this.pivot))
            this.highlight(this.colors["bad"])
        else if (diff < (0 - this.pivot))
            this.highlight(this.colors["worse"])
    }

    private highlight(color: string) {
        this.renderer.setElementStyle(this.el.nativeElement, 'backgroundColor', color);
        this.renderer.setElementStyle(this.el.nativeElement, 'color', '#FFFFFF');
    }
}
