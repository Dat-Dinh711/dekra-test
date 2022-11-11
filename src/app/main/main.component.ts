import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  public bookingForm: FormGroup = new FormGroup({});
  public result: string = '';

  constructor() {}

  ngOnInit(): void {
    this.bookingForm = new FormGroup({
      bookingInput: new FormControl('', Validators.required),
    });
  }

  get bookingInput() {
    return this.bookingForm.get('bookingInput');
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

  calculateBookingTime(item: any) {
    const bookingTime = item.bookingDay + ' ' + item.bookingHour;
    const bookingEnd = new Date(
      new Date(bookingTime).getTime() + parseInt(item.bookingLength) * 3600000
    );
    return (
      ('0' + bookingEnd.getHours()).slice(-2) +
      ':' +
      ('0' + bookingEnd.getMinutes()).slice(-2)
    );
  }

  sortArrayByRequestTime(arr: any[]) {
    arr.sort(
      (a: any, b: any) =>
        new Date(a.requestTime).getTime() - new Date(b.requestTime).getTime()
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

  removeRequestsDuplicationBookingTime(arr: any[]) {
    arr.forEach((item: any, index: number) => {
      const bookingEndString = this.calculateBookingTime(item);

      if (
        item.bookingHour === arr[index + 1]?.bookingHour ||
        bookingEndString > arr[index + 1]?.bookingHour
      ) {
        arr.splice(index + 1, 1);
      }
    });
  }

  transformResult(arr: any[]) {
    let resultStr: string = '';

    for (var key in arr) {
      let str = '';
      arr[key].forEach((item: any) => {
        const bookingEndString = this.calculateBookingTime(item);
        const bookingDayString = key;
        str += `${item.bookingHour} ${bookingEndString}<br>${item.employeeId}<br>`;
        resultStr = `${bookingDayString}<br>${str}`;
      });

      this.result = `${this.result}<br>${resultStr}`;
    }
  }

  onSubmit() {
    this.result = '';
    const bookingInput: string = this.bookingInput?.value;
    const arrAfterConvert: string[] = bookingInput.split('\n');
    const startWorkingHour = arrAfterConvert[0].slice(0, 4);
    const endWorkingHour = arrAfterConvert[0].slice(-4);
    const workingHour = {
      start: startWorkingHour.slice(0, 2) + ':' + startWorkingHour.slice(2),
      end: endWorkingHour.slice(0, 2) + ':' + endWorkingHour.slice(2),
    };
    arrAfterConvert.splice(0, 1);

    const bookingRequest: Array<string[]> = [];
    let temp: string[] = [];

    arrAfterConvert.forEach((item, index) => {
      temp.push(item);
      if ((index + 1) % 3 === 0) {
        bookingRequest.push(temp);
        temp = [];
      }
    });

    const newArr: Object[] = bookingRequest.map((item) => {
      return {
        requestTime: item[0],
        employeeId: item[1],
        bookingDay: item[2].slice(0, 10),
        bookingHour: item[2].slice(11, 16),
        bookingLength: item[2].slice(-1),
      };
    });

    let arrAfterReduce = this.groupBy(newArr, 'bookingDay');

    for (var key in arrAfterReduce) {
      this.sortArrayByRequestTime(arrAfterReduce[key]);

      this.removeRequestsInvalidBookingTime(arrAfterReduce[key], workingHour);

      this.removeRequestsDuplicationBookingTime(arrAfterReduce[key]);
    }

    this.transformResult(arrAfterReduce);
  }
}
