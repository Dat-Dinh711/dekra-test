import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  constructor() {}

  validateDateTime(dateTime: any, dateTimeformat: string) {
    return moment(dateTime, dateTimeformat, true).isValid();
  }

  sortObjectByKey(objectSort: any) {
    return Object.keys(objectSort)
      .sort()
      .reduce((obj: any, key) => {
        obj[key] = objectSort[key];
        return obj;
      }, {});
  }

  /**
   * Return a new array was grouped by param key
   * @param arr The array want group
   * @param key The key to group
   * @returns A new array was grouped by param key
   */
  groupBy(arr: any[], key: string) {
    return arr.reduce(
      (result, item) => ({
        ...result,
        [item[key]]: [...(result[item[key]] || []), item],
      }),
      {}
    );
  }

  sortArrayByDateTime(arr: any[], key: string) {
    return arr.sort(
      (a: any, b: any) =>
        new Date(a[key]).getTime() - new Date(b[key]).getTime()
    );
  }
}
