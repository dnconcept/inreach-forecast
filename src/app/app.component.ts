import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { calculateNewPosition } from './utils';

const options = {
  // Required: API key
  key: 'RQPlybIeGqzCcaqo4HtLTP6CrriVSMpy',

  // Put additional console output
  // verbose: true,

  // Optional: Initial state of the map
  lat: 50.4,
  lon: 14.3,
  zoom: 5,
  // overlay: 'ecmwfWaves',
  // hasMoreLevels: true,
  // favOverlays: [ 'wind', 'deg0', 'currents', 'radar', 'swell1' ], // 'ecmwfWaves', 'waves', 'temperature',
  fav: [ "radar", "satellite", "wind", "gust", "rain", "rainAccu", "snowAccu", "thunder", "temp", "rh", "clouds", "lclouds", "cbase", "visibility", "waves", "swell1", "swell2", "sst", "no2", "gtco3", "aod550", "pm2p5" ],
  latlon: false,
  numDirection: true,
};

interface IWindyAPI {
  map: L.Map;
  picker;
  utils;
  store;
  broadcast;
}

interface IPosition {
  lat: number;
  lng: number;
}

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
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit {

  title = 'windy-routing';
  cap = undefined;
  speed = 5;
  hoursNumber = 24;
  lat = 45;
  latDeg = 32;
  latMin = 51;
  latDir = 'N';
  lonDeg = 16;
  lonMin = 52;
  lonDir = 'W';
  lon = 12;
  picker;
  broadcast;
  url1;
  position;
  message: string;

  resultList: IResult[];

  ngOnInit() {
    // const fn = (window as any).windyInit;
    // fn(options, this.windyInit)
  }

  calculate() {
    if (!this.cap) {
      alert(`Vous devez définir le cap`);
      return;
    }
    const lat = (this.latDir == 'S' ? -1 : 1) * this.getPoint(this.latDeg, this.latMin);
    const lng = (this.lonDir == 'W' ? -1 : 1) * this.getPoint(this.lonDeg, this.lonMin);
    this.position = { lat, lng };
    this.url1 = `https://www.windy.com/${lat}/${lng}`;
    const pos = calculateNewPosition(lat, lng,
      this.speed, this.cap, this.hoursNumber * 60 * 60);
    this.resultList = [
      ...this.getFourPoints('T0', lat, lng),
      ...this.getFourPoints(`T+${this.hoursNumber}H`, pos.lat, pos.lng),
    ];
    for (const o of this.resultList) {
      o.wind_dir = 290;
      o.wind = 15;
      o.wave = 12;
    }
    console.info('[AppComponent] calculate pos', pos);
  }

  getMessage() {
    this.message = this.resultList.map(( {
                                           dir,
                                           wind_dir,
                                           wind, wave
    } ) => `${dir}${wind}D${wind_dir || '290'}V${wave}`).join('')
  }

  getFourPoints( a, lat, lng ) {
    return [
      { label: `Point Nord ${a}`, dir: 'N', lat: lat + 0.5, lng },
      { label: `Point Sud ${a}`, dir: 'S', lat: lat - 0.5, lng },
      { label: `Point Est ${a}`, dir: 'E', lat, lng: lng + 0.5 },
      { label: `Point Ouest ${a}`, dir: 'W', lat, lng: lng - 0.5 },
    ];
  }

  go( lat, lon ) {
    this.picker.open({ lat, lon });
    this.broadcast.fire('rqstOpen', 'detail', { lat: 50, lon: 14 })
  }

  // Initialize Windy API
  windyInit = ( windyAPI ) => {
    console.info('[AppComponent] test a, b', windyAPI, this);
    // windyAPI is ready, and contain 'map', 'store',
    // 'picker' and other usefull stuff

    const { map, picker, utils, store, broadcast } = windyAPI as IWindyAPI;
    // .map is instance of Leaflet map
    this.picker = picker;
    this.broadcast = broadcast;
    console.info('[AppComponent] windyInit picker', picker);

    picker.on('pickerOpened', ( { lat, lon, values, overlay } ) => {
      // -> 48.4, 14.3, [ U,V, ], 'wind'
      console.log('opened', lat, lon, values, overlay);

      const windObject = utils.wind2obj(values);
      console.log(windObject);
    });

    picker.on('pickerMoved', ( { lat, lon, values, overlay } ) => {
      // picker was dragged by user to latLon coords
      console.log('moved', lat, lon, values, overlay);
      this.lat = lat;
      this.lon = lon;
    });
    // store.set('overlay', 'waves');

    // Wait since weather is rendered
    broadcast.once('redrawFinished', () => {
      // Opening of a picker (async)
      picker.open({ lat: 48.4, lon: 14.3 });
    });


    map.on('click', ( { latlng } ) => {
      const { lat, lng } = latlng;
      this.go(lat, lng);
    });
  }

  store( store ) {
    const levels = store.getAllowed('availLevels');
    // levels = ['surface', '850h', ... ]
    // Getting all available values for given key

    let i = 0;
    setInterval(() => {
      i = i === levels.length - 1 ? 0 : i + 1;

      // Changing Windy params at runtime
      store.set('level', levels[i]);
    }, 500);

    // Observing change of .store value
    store.on('level', level => {
      console.log(`Level was changed: ${level}`);
    });
  }


  private getPoint( deg: number, minutes: number ) {
    return Math.round((deg + minutes / 60) * 1000) / 1000;
  }

}
