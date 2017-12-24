/**
 * Created by Fincash on 04-02-2017.
 */
import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'time'
})
export class TimePipe implements PipeTransform {

    /**
     *
     * @param value
     * @param args
     * @returns {string}
     */
    transform(value: any, args?: any): any {
        args = args ? args.toUpperCase() : null;
        let outputFormat = args || 'HH:mm:ss';// 'D MMM YYYY';
        let time = moment(value).format(outputFormat);
        return time;
    }

}