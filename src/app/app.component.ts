import { Component, OnInit } from '@angular/core';
import { calculateNewPosition } from './utils';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

interface IResult {
  label: string;
  lat: number;
  lng: number;
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
  latDeg: number;
  latMin: number;
  latDir = 'N';
  lonDeg: number;
  lonMin: number;
  lonDir = 'W';
  url1;
  position;
  message: string;

  resultList: IResult[];

  isDev = true;

  constructor( private http: HttpClient,
               private flash: MatSnackBar,
               private clipboard: Clipboard ) {
  }

  ngOnInit(): void {
    if (this.isDev) {
      this.latDeg = 32;
      this.latMin = 51;
      this.lonDeg = 16;
      this.lonMin = 52;
      this.cap = 180;
    }
    // const fn = (window as any).windyInit;
    // fn(options, this.windyInit)
  }

  calculate(): void {
    const n = ( x ) => x === undefined || x === null;
    const rules = [
      { error: n(this.latDeg), msg: `Vous devez définir la latitude en degrés` },
      { error: n(this.latMin), msg: `Vous devez définir la latitude en minutes` },
      { error: n(this.lonDeg), msg: `Vous devez définir la longitude en degrés` },
      { error: n(this.lonMin), msg: `Vous devez définir la longitude en minutes` },
      { error: !this.cap, msg: `Vous devez définir le cap` },
    ];
    const errs = rules.filter(x => x.error);
    if (errs.length) {
      alert(errs.map(x => x.msg).join(' , '));
      return;
    }
    const lat = (this.latDir === 'S' ? -1 : 1) * this.getPoint(this.latDeg, this.latMin);
    const lng = (this.lonDir === 'W' ? -1 : 1) * this.getPoint(this.lonDeg, this.lonMin);
    this.position = { lat, lng };
    this.url1 = `https://www.windy.com/${lat}/${lng}`;
    const pos = calculateNewPosition(lat, lng,
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
                                         } ) => `${dir}${wind}k${wind_dir || '290'}d${wave}`).join('');
  }

  copyMessage( msg1, msg2 ): void {
    this.clipboard.copy(msg1 + msg2);
    this.flash.open(`Le message a été copié !`, 'info');
  }

  getFourPoints( a, lat, lng ): { label, dir, lat, lng }[] {
    return [
      { label: `Point Nord ${a}`, dir: 'N', lat: lat + 0.5, lng },
      { label: `Point Sud ${a}`, dir: 'S', lat: lat - 0.5, lng },
      { label: `Point Est ${a}`, dir: 'E', lat, lng: lng + 0.5 },
      { label: `Point Ouest ${a}`, dir: 'W', lat, lng: lng - 0.5 },
    ];
  }

  private getPoint( deg: number, minutes: number ): number {
    return Math.round((deg + minutes / 60) * 1000) / 1000;
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
