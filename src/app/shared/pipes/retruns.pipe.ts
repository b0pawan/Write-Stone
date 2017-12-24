import {Inject, LOCALE_ID, Pipe, PipeTransform} from "@angular/core";
import {DecimalPipe} from "@angular/common";

@Pipe({
    name: 'returns'
})


export class ReturnsPipe implements PipeTransform {

    constructor(@Inject(LOCALE_ID) private _locale: string) {
    }

    /**
     *
     * @param value
     * @param percentSignDisplay
     * @returns {any}
     */
    transform(value: any, percentSignDisplay?: boolean): any {
        let digits: string = '1.1-1';
        let decimalPipe: DecimalPipe = new DecimalPipe(this._locale);

        if (value == 0 || value == "null" || !value) {
            return "-";
        } else {
            if (percentSignDisplay) {
                return decimalPipe.transform(value, digits) + "%";
            } else {
                return decimalPipe.transform(value, digits);
            }
        }
    }

}

