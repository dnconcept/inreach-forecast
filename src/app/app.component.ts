import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { calculateNewPosition, IPosition, round } from './utils';

interface IResult extends IPosition {
  label: string;
  dir: string;
  wind_dir?: number;
  wind?: number;
  wave?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {

  title = 'windy-routing';
  cap = undefined;
  speed = 5;
  hoursNumber = 24;
  lat;
  lng;
  url1;
  position: IPosition;
  newPosition: IPosition;
  message: string;

  resultList: IResult[];

  isDev = false;

  constructor( private http: HttpClient,
               private flash: MatSnackBar,
               private clipboard: Clipboard ) {
  }

  ngOnInit(): void {
    if (this.isDev) {
      this.lat = 32.85;
      this.lng = -16.867;
      this.cap = 180;
    }
    // const fn = (window as any).windyInit;
    // fn(options, this.windyInit)
  }

  calculate(): void {
    const n = ( x ) => x === undefined || x === null;
    const rules = [
      { error: n(this.lat), msg: `Vous devez définir la latitude en degrés` },
      { error: n(this.lng), msg: `Vous devez définir la longitude en degrés` },
      { error: !this.cap, msg: `Vous devez définir le cap` },
    ];
    const errs = rules.filter(x => x.error);
    if (errs.length) {
      this.flash.open(errs.map(x => x.msg).join(' , '), 'warn');
      return;
    }
    const lat = (this.lat);
    const lng = (this.lng);
    this.position = { lat, lng };
    this.url1 = `https://www.windy.com/${lat}/${lng}`;
    const pos = this.newPosition = calculateNewPosition(lat, lng,
      this.speed, this.cap, this.hoursNumber * 60 * 60);
    this.resultList = [
      ...this.getFourPoints('T0', lat, lng),
      ...this.getFourPoints(`T+${this.hoursNumber}H`, pos.lat, pos.lng),
    ];
    if (this.isDev) {
      for (const o of this.resultList) {
        o.wind_dir = 290;
        o.wind = 15;
        o.wave = 12;
      }
    }
  }

  getMessage(): void {
    this.message = this.resultList.map(( {
                                           dir,
                                           wind_dir,
                                           wind, wave
                                         } ) => `${dir}${wind || ''}k${wind_dir || ''}d${wave || ''}`).join('');
  }

  copyMessage( msg1, msg2 ): void {
    const finalMsg = msg1 + msg2;
    this.clipboard.copy(finalMsg);
    this.flash.open(`Le message a été copié !`, 'info');
    if (finalMsg.length > 160) {
      this.flash.open(`Attention le message fait plus de 160 caractères !`, 'warn');
    }
  }

  getFourPoints( a, lat, lng ): { label, dir, lat, lng }[] {
    return [
      { label: `Point Nord ${a}`, dir: 'N', lat: lat + 0.5, lng },
      { label: `Point Sud ${a}`, dir: 'S', lat: lat - 0.5, lng },
      { label: `Point Est ${a}`, dir: 'E', lat, lng: lng + 0.5 },
      { label: `Point Ouest ${a}`, dir: 'W', lat, lng: lng - 0.5 },
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
    const r = await this.http.get(`https://share.garmin.com/Feed/Share/naos`, requestOptions).toPromise();
  }
}
