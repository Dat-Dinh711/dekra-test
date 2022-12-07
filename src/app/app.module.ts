import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';

import { MainService } from './main/main.service';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [AppComponent, MainComponent],
  imports: [BrowserModule, ReactiveFormsModule, IonicModule.forRoot()],
  providers: [MainService],
  bootstrap: [AppComponent],
})
export class AppModule {}
