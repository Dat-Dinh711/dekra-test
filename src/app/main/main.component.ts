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
  public dateTimeFormat = 'YYYY-MM-DD hh:mm:ss';
  public workingTimeFormat = 'HH:mm';

  constructor() {}

  ngOnInit(): void {
    this.bookingForm = new FormGroup({
      bookingInput: new FormControl('', Validators.required),
    });
  }

  get bookingInput() {
    return this.bookingForm.get('bookingInput');
  }

  onSubmit() {
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

    const isStartWorkingHour = this.validateDateTime(
      workingHour.start,
      this.workingTimeFormat
    );
    const isEndWorkingHour = this.validateDateTime(
      workingHour.end,
      this.workingTimeFormat
    );

    if (!isStartWorkingHour || !isEndWorkingHour) {
      throw new Error('Start or End working hour is in valid ');
    }
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

    const newBookingRequest = bookingRequest.map((item) => ({
      requestTime: item[0] + ' ' + item[1],
      employeeId: item[2],
      bookingDay: item[3],
      bookingHour: item[4],
      bookingLength: item[5],
    }));

    // Validate request and booking time
    newBookingRequest.forEach((item) => {
      const isRequestTimeValid = this.validateDateTime(
        moment(item.requestTime).format(this.dateTimeFormat),
        this.dateTimeFormat
      );

      const bookingTime = item.bookingDay + ' ' + item.bookingHour;
      const isBookingTimeValid = this.validateDateTime(
        moment(bookingTime).format(this.dateTimeFormat),
        this.dateTimeFormat
      );

      if (!isRequestTimeValid || !isBookingTimeValid) {
        throw new Error('Date/Time of request or booking is invalid');
      }
    });

    // Group array by 'bookingDay'
    let arrAfterReduce = this.groupBy(newBookingRequest, 'bookingDay');

    for (var key in arrAfterReduce) {
      this.sortArrayByRequestTime(arrAfterReduce[key]);

      this.removeRequestsInvalidBookingTime(arrAfterReduce[key], workingHour);

      this.removeRequestsDuplicationBookingTime(arrAfterReduce[key]);
    }

    this.transformResult(arrAfterReduce);
  }

  validateDateTime(dateTime: any, dateTimeformat: string) {
    return moment(dateTime, dateTimeformat, true).isValid();
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

  sortArrayByRequestTime(arr: any[]) {
    arr.sort(
      (a: any, b: any) =>
        new Date(a.requestTime).getTime() - new Date(b.requestTime).getTime()
    );
  }

  /**
   * Return the end time of a booking
   * @param requestBooking  An object includes information about request booking
   * @returns The end time of a booking
   */
  calculateBookingTime(requestBooking: any) {
    const bookingTime =
      requestBooking?.bookingDay + ' ' + requestBooking?.bookingHour;
    const bookingEnd = new Date(
      new Date(bookingTime).getTime() +
        parseFloat(requestBooking?.bookingLength) * 3600000
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
        item.bookingLength === '0' ||
        item.bookingHour > workingHour.end ||
        item.bookingHour < workingHour.start ||
        bookingEndString > workingHour.end
      ) {
        arr.splice(index, 1, null);
      }
    });
  }

  /**
   * Return a boolean variable to check the booking time of the request is valid or not
   * @param requestBooking An object includes information about request booking
   * @param bookingTimeList An object includes start and end time of valid request booking
   * @param bookingEndOfCurrentRequest End time of the booking of current request
   * @returns A boolean variable to check the booking time of the request is valid or not
   */
  checkValidBookingTime(
    requestBooking: any,
    bookingTimeList: Array<any>,
    bookingEndOfCurrentRequest: string
  ) {
    let isValid: boolean = true;

    bookingTimeList.forEach((bookingTime) => {
      if (
        (bookingTime.start <= requestBooking.bookingHour &&
          requestBooking.bookingHour < bookingTime.end) ||
        (bookingTime.start < bookingEndOfCurrentRequest &&
          bookingEndOfCurrentRequest <= bookingTime.end)
      ) {
        isValid = false;
      }
      return isValid;
    });

    return isValid;
  }

  /**
   * Remove the request has booking time duplicate with booking time of the previous request
   * @param arr The array containing requests booking
   */
  removeRequestsDuplicationBookingTime(arr: any[]) {
    let bookingTimeList: Array<any> = [];
    arr.forEach((item: any, index: number) => {
      if (item !== null) {
        const bookingEndOfCurrentRequest = this.calculateBookingTime(item);
        const isValid: boolean = this.checkValidBookingTime(
          item,
          bookingTimeList,
          bookingEndOfCurrentRequest
        );

        if (!isValid) {
          arr.splice(index, 1, null);
        } else {
          bookingTimeList.push({
            start: item.bookingHour,
            end: bookingEndOfCurrentRequest,
          });
        }
      }
    });
  }

  /**
   * Transform result to render UI
   * @param arr The array of result
   */
  transformResult(arr: any[]) {
    this.result = '';
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
      resultBooking = '';
    }
  }
}
