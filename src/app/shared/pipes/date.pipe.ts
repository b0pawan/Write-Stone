/**
 * Created by Fincash on 04-02-2017.
 */
import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'date'
})
export class DatePipe implements PipeTransform {

    transform(value: any, args?: any): any {
        args = args ? args.toUpperCase() : null;
        let outputFormat = args || 'D MMM YYYY';
        let date = moment(value).format(outputFormat);
        return date;
    }

}