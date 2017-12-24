import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'round2'
})
export class Round2Pipe implements PipeTransform {

    /**
     *
     * @param input
     * @returns {string}
     */
    transform(input: number) {
        return input.toFixed(2);
    }

}
