import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  public bookingForm: FormGroup = new FormGroup({});
  public result: string = '';
  public dateFormat = 'YYYY-MM-DD LT';

  constructor() {}

  ngOnInit(): void {
    this.bookingForm = new FormGroup({
      bookingInput: new FormControl('', Validators.required),
    });
  }

  get bookingInput() {
    return this.bookingForm.get('bookingInput');
  }

  validateDateTime(item: any) {
    const bookingTime = item.bookingDay + ' ' + item.bookingHour;

    const isDateTimeRequestValid = moment(
      moment(item.requestTime).format(this.dateFormat),
      this.dateFormat,
      true
    ).isValid();

    const isDateTimeBookingValid = moment(
      moment(bookingTime).format(this.dateFormat),
      this.dateFormat,
      true
    ).isValid();

    if (!isDateTimeRequestValid || !isDateTimeBookingValid) {
      throw new Error('Date/Time in input maybe has wrong format.');
    }
  }

  groupBy(arr: any[], key: string) {
    return arr.reduce(
      (result, item) => ({
        ...result,
        [item[key]]: [...(result[item[key]] || []), item],
      }),
      {}
    );
  }

  sortArrayByRequestTime(arr: any[]) {
    arr.sort(
      (a: any, b: any) =>
        new Date(a.requestTime).getTime() - new Date(b.requestTime).getTime()
    );
  }

  calculateBookingTime(item: any) {
    const bookingTime = item?.bookingDay + ' ' + item?.bookingHour;
    const bookingEnd = new Date(
      new Date(bookingTime).getTime() + parseInt(item?.bookingLength) * 3600000
    );
    return (
      ('0' + bookingEnd.getHours()).slice(-2) +
      ':' +
      ('0' + bookingEnd.getMinutes()).slice(-2)
    );
  }

  removeRequestsInvalidBookingTime(arr: any[], workingHour: any) {
    arr.forEach((item: any, index: number) => {
      const bookingEndString = this.calculateBookingTime(item);

      if (
        item.bookingHour > workingHour.end ||
        item.bookingHour < workingHour.start ||
        bookingEndString > workingHour.end
      ) {
        arr.splice(index, 1);
      }
    });
  }

  checkValidBookingTime(
    item: any,
    bookingTimeList: Array<any>,
    bookingEndStringCurrentRequest: string
  ) {
    let isValid: boolean = true;

    bookingTimeList.forEach((bookingTime) => {
      if (
        (bookingTime.start <= item.bookingHour &&
          item.bookingHour < bookingTime.end) ||
        (bookingTime.start < bookingEndStringCurrentRequest &&
          bookingEndStringCurrentRequest <= bookingTime.end)
      ) {
        isValid = false;
      }
      return isValid;
    });

    return isValid;
  }

  removeRequestsDuplicationBookingTime(arr: any[]) {
    let bookingTimeList: Array<any> = [];
    arr.forEach((item: any, index: number) => {
      const bookingEndStringCurrentRequest = this.calculateBookingTime(item);
      const isValid: boolean = this.checkValidBookingTime(
        item,
        bookingTimeList,
        bookingEndStringCurrentRequest
      );

      if (!isValid) {
        arr.splice(index, 1, null);
      } else {
        bookingTimeList.push({
          start: item.bookingHour,
          end: bookingEndStringCurrentRequest,
        });
      }
    });
  }

  transformResult(arr: any[]) {
    let resultBooking: string = '';
    for (var key in arr) {
      let str = '';
      arr[key].forEach((item: any) => {
        if (item !== null) {
          const bookingEndString = this.calculateBookingTime(item);
          const bookingDayString = key;
          str += `${item.bookingHour} ${bookingEndString}<br>${item.employeeId}<br>`;
          resultBooking = `${bookingDayString}<br>${str}`;
        }
      });

      this.result = `${this.result}<br>${resultBooking}`;
    }
  }

  onSubmit() {
    this.result = '';
    if (this.bookingInput?.value === '') {
      throw new Error('Input must not be empty');
    }

    let bookingInput: string = this.bookingInput?.value
      .replace(/\s+/g, ' ')
      .trim();
    const arrAfterConvert: string[] = bookingInput.split(' ');
    const workingHour = {
      start: arrAfterConvert[0].slice(0, 2) + ':' + arrAfterConvert[0].slice(2),
      end: arrAfterConvert[1].slice(0, 2) + ':' + arrAfterConvert[1].slice(2),
    };
    arrAfterConvert.splice(0, 2);

    // Split items in a request into an array
    const bookingRequest: Array<string[]> = [];
    let temp: string[] = [];

    arrAfterConvert.forEach((item: string, index: number) => {
      temp.push(item);
      if ((index + 1) % 6 === 0) {
        bookingRequest.push(temp);
        temp = [];
      }
    });

    const newBookingRequest: Object[] = bookingRequest.map((item) => ({
      requestTime: item[0] + ' ' + item[1],
      employeeId: item[2],
      bookingDay: item[3],
      bookingHour: item[4],
      bookingLength: item[5],
    }));

    // Validate request and booking time
    newBookingRequest.forEach((item) => this.validateDateTime(item));

    // Group array by 'bookingDay'
    let arrAfterReduce = this.groupBy(newBookingRequest, 'bookingDay');

    for (var key in arrAfterReduce) {
      this.sortArrayByRequestTime(arrAfterReduce[key]);

      this.removeRequestsInvalidBookingTime(arrAfterReduce[key], workingHour);

      this.removeRequestsDuplicationBookingTime(arrAfterReduce[key]);
    }

    this.transformResult(arrAfterReduce);
  }
}
