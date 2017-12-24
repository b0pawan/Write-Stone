import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'round'
})
export class RoundPipe implements PipeTransform {

    /**
     *
     * @param input
     * @returns {number}
     */
    transform(input: number) {
        return Math.floor(input);
    }

}
