import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'rating'
})
export class RatingPipe implements PipeTransform {

    /**
     *
     * @param value
     * @param args
     * @returns {string}
     */
    transform(value: any, args?: any): any {
        let stars: string = "";
        if (value === 0 || value == "0" || value == "0.0") {
            stars = "<span class='grey-star'>Not Rated</span>"
        } else {
            for (let i = 1; i < 6; i++) {
                if (i > value) {
                    stars = stars + "<i class='material-icons grey-star md-16 icon-align'>&#xE83A;</i>";
                } else {
                    stars = stars + "<i class='material-icons star md-16 icon-align'>&#xE838;</i>";
                }
            }
        }
        return stars;
    }

}
