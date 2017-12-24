import {Pipe, PipeTransform} from '@angular/core';
import {Logger} from "../../core/logger/logger";

@Pipe({
    name: 'categoryRank'
})
export class CategoryRankPipe implements PipeTransform {

    constructor(private logger: Logger) {

    }

    /**
     *
     * @param value
     * @param args
     * @returns {string}
     */
    transform(value: any, args?: any): any {
        let iconHtml: string = "";
        this.logger.debug("categoryRankPipe:" + value);
        if (value == null || value == 0 || value == "0" || value == "0.0" || value > 10) {
            iconHtml = "<span></span>"
        } else {
            let categoryRankImagePath = "assets/img/category-rank/" + value + ".svg";
            let categoryRankImageAlt = value + " Rank"
            iconHtml = "<div class='category-rank'><img src='" + categoryRankImagePath + "' alt='" + categoryRankImageAlt + "' width='30'/><br/>Rank</div>";
        }
        return iconHtml;
    }


}
