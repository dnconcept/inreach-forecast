import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { JsonPipe, NgForOf, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { calculateNewPosition, IPosition, round } from '../utils';
import { InputGeolocComponent } from '../input-geoloc/input-geoloc.component';
import { DialogService } from '@app.services';
import { IFormValue, IResult } from '@app.interfaces';

@Component({
  selector: 'app-windy-page',
  imports: [ NgIf, FormsModule, InputGeolocComponent, JsonPipe, MatButton, MatTooltip, NgForOf ],
  templateUrl: './windy-page.component.html',
  styleUrl: './windy-page.component.scss',
  standalone: true,
})
export class WindyPageComponent implements AfterViewInit {

  url1: string;
  position: IPosition;
  newPosition: IPosition;
  message: string = '';
  customMsg = '';
  maxChar = 160;
  errorList: { error: boolean, msg: string }[];
  resultList: IResult[] = [];
  formValue: IFormValue;
  @ViewChild(NgForm) ngForm: NgForm;

  shortCuts = [
    { id: 'F', label: 'Forcissant' },
    { id: 'M', label: 'Molissant' },
    { id: 'D', label: 'Dépression' },
    { id: 'A', label: 'Anticyclone' },
    { id: 'N', label: 'Nord' },
    { id: 'S', label: 'Sud' },
    { id: 'E', label: 'Est' },
    { id: 'W', label: 'Ouest' },
    { id: 'MerF', label: 'Mer forte' },
    { id: 'MerTF', label: 'Mer très forte' },
    { id: 'MerG', label: 'Mer grosse' },
  ];

  constructor( private http: HttpClient,
               private dialogService: DialogService,
               private clipboard: Clipboard ) {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.ngForm.control.patchValue({
        speed: 5,
        hoursNumber: 24,
        offsetMiles: 30,
      })
      this.ngForm.valueChanges?.subscribe(x => this.calculate(x));
    });
  }

  calculate( formValue: IFormValue ): void {
    const lat = formValue.lat!;
    const lng = formValue.lng!;
    const n = ( x: any ) => x === undefined || x === null;
    const rules = [
      { error: n(lat), msg: `Vous devez définir la latitude en degrés` },
      { error: n(lng), msg: `Vous devez définir la longitude en degrés` },
      { error: !formValue.cap, msg: `Vous devez définir le cap` },
    ];
    const errs = rules.filter(x => x.error);
    this.errorList = errs;
    if (errs.length) {
      return;
    }
    this.position = { lat, lng };
    this.url1 = `https://www.windy.com/${lat}/${lng}`;
    const { speed, hoursNumber, offsetMiles } = formValue;
    const pos = this.newPosition = calculateNewPosition(lat!, lng!,
      speed, formValue.cap!, hoursNumber * 60 * 60);
    const offset = offsetMiles / 60;
    this.resultList = [
      ...this.getFourPoints('T0', lat, lng, offset),
      { label: `Point estimé T+${hoursNumber}H`, dir: 'X', lat: pos.lat, lng: pos.lng },
      ...this.getFourPoints(`T+${hoursNumber}H`, pos.lat, pos.lng, offset),
    ];
    this.formValue = formValue;
    this.updateMessage();
  }

  updateMessage(): void {
    this.setMessage(this.resultList, this.formValue);
  }

  setMessage( resultList: IResult[], { speed, cap, hoursNumber }: IFormValue ): void {
    const msg = resultList.map(( {
                                   dir,
                                   wind_dir,
                                   wind, wave
                                 } ) => `${dir}${wind || ''}k${wind_dir || ''}d${wave || ''}`).join('');
    const a = resultList
      .filter(( { wind, max_wind } ) => wind && max_wind)
      .map(( { wind, max_wind } ) => Number(max_wind) / Number(wind));
    const max = a.length ? round((Math.max.apply(null, a) - 1) * 100, 0) : 0;
    const raf = max > 0 ? `r${max}` : 'r0';
    this.message = msg + `Fs${speed}c${cap}h${hoursNumber}${raf}F`;
  }

  copyMessage( msg1: string, msg2: string ): void {
    const finalMsg = msg1 + msg2;
    this.clipboard.copy(finalMsg);
    this.dialogService.flashInfo(`Le message a été copié !`);
    if (finalMsg.length > 160) {
      this.dialogService.flashWarn(`Attention le message fait plus de 160 caractères !`);
    }
  }

  getFourPoints( name: string, lat: number, lng: number, offset: number ): {
    label: string, dir: string, lat: number, lng: number
  }[] {
    // Conversion de miles nautiques en degrés de longitude à la latitude donnée
    const coeff = Math.cos((lat * Math.PI) / 180);
    return [
      { label: `Point Nord ${name}`, dir: 'N', lat: lat + offset, lng },
      { label: `Point Sud ${name}`, dir: 'S', lat: lat - offset, lng },
      { label: `Point Est ${name}`, dir: 'E', lat, lng: lng + offset / coeff },
      { label: `Point Ouest ${name}`, dir: 'W', lat, lng: lng - offset / coeff },
    ];
  }

  async test(): Promise<void> {
    const username = 'naos';
    const password = 'naos';

    // Combine username and password into a base64-encoded string
    const credentials = btoa(`${username}:${password}`);
    // Set up the headers with the Authorization header
    const headers = new HttpHeaders({
      Authorization: `Basic ${credentials}`
    });
    // Set the crossOrigin property to 'true' in the request options
    const requestOptions = {
      headers,
      withCredentials: true, // This allows cookies and credentials to be sent in the request
      crossOrigin: true, // This ensures the Referer header is sent
    };
    const result = await this.http.get(`https://share.garmin.com/Feed/Share/naos`, requestOptions).toPromise();
    console.info('[AppComponent] test ', result);
  }
}
