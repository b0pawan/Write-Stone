import {Inject, LOCALE_ID, Pipe, PipeTransform} from "@angular/core";
import {CurrencyPipe} from "@angular/common";

@Pipe({
    name: 'sipAmount'
})


export class SipAmountPipe implements PipeTransform {

    constructor(@Inject(LOCALE_ID) private _locale: string) {
    }

    /**
     *
     * @param value
     * @returns {any}
     */
    transform(value: any): any {
        let digits: string = '1.0-0';
        let currencyPipe: CurrencyPipe = new CurrencyPipe(this._locale);

        if (value == 0 || value == "null" || value == "None" || !value) {
            return "Not Available";
        } else {
            return currencyPipe.transform(value, 'INR', true, digits);
        }
    }

}

