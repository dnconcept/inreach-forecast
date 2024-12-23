import { Component } from '@angular/core';
// @ts-ignore:next-line
import * as L from 'leaflet';

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
  fav: [ 'radar', 'satellite', 'wind', 'gust', 'rain', 'rainAccu', 'snowAccu', 'thunder', 'temp', 'rh', 'clouds', 'lclouds', 'cbase', 'visibility', 'waves', 'swell1', 'swell2', 'sst', 'no2', 'gtco3', 'aod550', 'pm2p5' ],
  latlon: false,
  numDirection: true,
};

interface IWindyAPI {
  map: L.Map;
  picker: any;
  utils: any;
  store: any;
  broadcast: any;
}

interface IWindyEvent {
  lat: number,
  lon: number,
  values: any,
  overlay: any
}

interface IPosition {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-windy-map-plugin',
  templateUrl: './windy-map-plugin.component.html',
  styleUrl: './windy-map-plugin.component.css',
  standalone: true,
})
export class WindyMapPluginComponent {

  picker: any;
  broadcast: any;
  lat = 45;
  lon = 12;

  // Initialize Windy API
  windyInit = ( windyAPI: IWindyAPI ) => {
    console.info('[AppComponent] test a, b', windyAPI, this);
    // windyAPI is ready, and contain 'map', 'store',
    // 'picker' and other usefull stuff

    const { map, picker, utils, store, broadcast } = windyAPI;
    // .map is instance of Leaflet map
    this.picker = picker;
    this.broadcast = broadcast;
    console.info('[AppComponent] windyInit picker', picker);

    picker.on('pickerOpened', ( { lat, lon, values, overlay }: IWindyEvent ) => {
      // -> 48.4, 14.3, [ U,V, ], 'wind'
      console.log('opened', lat, lon, values, overlay);

      const windObject = utils.wind2obj(values);
      console.log(windObject);
    });

    picker.on('pickerMoved', ( { lat, lon, values, overlay }: IWindyEvent ) => {
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


    map.on('click', ( { latlng }: { latlng: IPosition } ) => {
      const { lat, lng } = latlng;
      this.go(lat, lng);
    });
  }

  go( lat: number, lon: number ): void {
    this.picker.open({ lat, lon });
    this.broadcast.fire('rqstOpen', 'detail', { lat: 50, lon: 14 });
  }

  store( store: any ): void {
    const levels = store.getAllowed('availLevels');
    // levels = ['surface', '850h', ... ]
    // Getting all available values for given key

    let i = 0;
    setInterval(() => {
      i = i === levels.length - 1 ? 0 : i + 1;

      // Changing Windy params at runtime
      store.set('level', levels[ i ]);
    }, 500);

    // Observing change of .store value
    store.on('level', ( level: any ) => {
      console.log(`Level was changed: ${level}`);
    });
  }


}
