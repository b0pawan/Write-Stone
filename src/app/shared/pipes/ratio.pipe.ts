import {Inject, LOCALE_ID, Pipe, PipeTransform} from "@angular/core";
import {DecimalPipe} from "@angular/common";

@Pipe({
    name: 'ratio'
})


export class RatioPipe implements PipeTransform {

    constructor(@Inject(LOCALE_ID) private _locale: string) {
    }

    /**
     *
     * @param value
     * @returns {any}
     */
    transform(value: any): any {
        let digits: string = '1.1-1';
        let decimalPipe: DecimalPipe = new DecimalPipe(this._locale);

        if (value == 0 || value == "null" || !value) {
            return "-";
        } else {
            return decimalPipe.transform(value, digits);
        }
    }

}

