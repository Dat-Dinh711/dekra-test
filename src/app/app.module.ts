import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';

import { MainService } from './main/main.service';

@NgModule({
  declarations: [AppComponent, MainComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  providers: [MainService],
  bootstrap: [AppComponent],
})
export class AppModule {}
