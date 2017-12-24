import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'filterPipe',
})
export class ArrayFilterPipe implements PipeTransform {
    transform(items: any[], filter: string, propertyList?: string[]): any {
        const _filter = filter ? filter.trim() : '';
        if (!items || _filter.length === 0) {
            return items;
        }
        if (_filter.length > 0) {
            return items.filter(item => {
                try {
                    let searchIn = '';
                    if (propertyList && propertyList.length > 0) {
                        propertyList.forEach(p => {
                            searchIn += item[p] ? item[p] : '';
                        });
                    } else {
                        searchIn = item;
                    }
                    if (typeof searchIn === 'object') {
                        return Object.values(searchIn).join(" ").toLowerCase().indexOf(_filter.toLowerCase()) !== -1;
                    } else {
                        return searchIn.toLowerCase().indexOf(_filter.toLowerCase()) !== -1;
                    }
                } catch (err) {
                    return false;
                }
            });
        } else {
            return items;
        }
    }
}
