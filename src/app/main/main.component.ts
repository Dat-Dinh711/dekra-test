import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  public bookingForm: FormGroup = new FormGroup({});

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
    console.log(this.bookingInput?.value);
  }
}
