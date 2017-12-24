import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'round3'
})
export class Round3Pipe implements PipeTransform {

    /**
     *
     * @param input
     * @returns {string}
     */
    transform(input: number) {
        return input.toFixed(3);
    }

}
