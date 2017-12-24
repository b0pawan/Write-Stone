import {Inject, LOCALE_ID, Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'structure'
})


export class StructurePipe implements PipeTransform {

    constructor(@Inject(LOCALE_ID) private _locale: string) {
    }

    /**
     *
     * @param value
     * @returns {any}
     */
    transform(value: any): any {

        if (value == "O") {
            return "Open Ended Fund";
        } else if (value == "C") {
            return "Close Ended Fund";
        }
    }

}

