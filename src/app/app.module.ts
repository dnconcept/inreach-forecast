import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SafePipe } from './safe.pipe';
import { WindyMapPluginComponent } from './windy-map-plugin/windy-map-plugin.component';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { InputGeolocComponent } from './input-geoloc/input-geoloc.component';

@NgModule({
  declarations: [
    AppComponent,
    SafePipe,
    WindyMapPluginComponent,
    InputGeolocComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatButtonModule,
    MatInputModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
