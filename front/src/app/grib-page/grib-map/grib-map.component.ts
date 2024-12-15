import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import * as geojson from "geojson";
import { IPosition } from '../../utils';

const createCircle = ( pos: IPosition ) => {
  return L.circleMarker(pos, {
    fillColor: 'red',
    color: '#000',
    radius: 3,
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  });
}

@Component({
  selector: 'app-grib-map',
  imports: [],
  templateUrl: './grib-map.component.html',
  styleUrl: './grib-map.component.scss',
  standalone: true,
})
export class GribMapComponent implements AfterViewInit, OnChanges {

  @Input() grid: IPosition[];
  @Input() center: IPosition;

  private map: any;
  private circleMarkers: L.CircleMarker[];

  ngAfterViewInit(): void {
    const map = this.initMap();
    this.updateCircles(map);
    this.loadGeoJSON(map);
  }

  ngOnChanges( { grid, center }: SimpleChanges ) {
    if (grid && !grid.isFirstChange()) {
      this.circleMarkers.forEach(marker => marker.removeFrom(this.map));
      this.updateCircles(this.map);
    }
  }

  private initMap(): any {
    const { lat, lng } = this.center;
    this.map = L.map('map').setView([ lat, lng ], 5); // Set initial view to a world map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    return this.map;
  }

  private updateCircles( map: L.Map ) {
    this.circleMarkers = [
      createCircle(this.center),
      ...this.grid.map(createCircle),
    ];
    this.circleMarkers.forEach(marker => marker.addTo(map));
  }

  private loadGeoJSON( map: L.Map ): void {
    const geojsonData: geojson.GeoJsonObject = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [ [ [ -0.09, 51.505 ], [ -0.08, 51.503 ], [ -0.08, 51.504 ], [ -0.09, 51.504 ], [ -0.09, 51.505 ] ] ],
          [ [ [ -0.09, 51.506 ], [ -0.08, 51.506 ], [ -0.08, 51.505 ], [ -0.09, 51.505 ], [ -0.09, 51.506 ] ] ]
        ]
      }
    } as geojson.GeoJsonObject;

    // Add GeoJSON layer to the map with the SVG pattern
    L.geoJSON(geojsonData, {
      style: ( feature ) => {
        return {
          fillColor: 'url(#angledCrossLines)',//Defined SVG pattern id
          color: 'green',  // Border color
          weight: 0.2,      // Border thickness
          fillOpacity: 1
        };
      }
    }).addTo(map);

  }

}
