// TODO(mmalerba): Remove when we no longer support safari 9.
/** Whether the browser supports the Intl API. */
import {NativeDateAdapter} from '@angular/material';
import * as moment from 'moment';


/** Adapts the native JS Date for use with cdk-based components that work with dates. */
export class FincashDateAdapter extends NativeDateAdapter {
    parse(value: any): Date | null {
        // We have no way using the native JS Date to set the parse format or locale, so we ignore these
        // parameters.
        if (typeof value === 'string') {
            let separator = '';
            if (value.indexOf('/') > -1) {
                separator = '/';
            }
            if (value.indexOf('-') > -1) {
                separator = '-';
            }
            if (separator && separator.length > 0) {
                const str = value.split(separator);
                value = str[1] + '-' + str[0] + '-' + str[2]; // standard ISO format mm dd yyyy
            }
        }
        //const timestamp = typeof value === 'number' ? value : Date.parse(value);
        const timestamp = typeof value === 'number' ? value : moment(value).valueOf();
        return isNaN(timestamp) ? null : new Date(timestamp);
    }
}
