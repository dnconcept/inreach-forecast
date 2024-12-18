import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
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
  @Output() mapClicked: EventEmitter<IPosition> = new EventEmitter<IPosition>();

  private map: any;
  private circleMarkers: L.CircleMarker[] = [];

  ngAfterViewInit(): void {
    const map = this.initMap();
    this.updateCircles(map);
  }

  ngOnChanges( { grid, center }: SimpleChanges ) {
    if (grid && !grid.isFirstChange()) {
      this.updateCircles(this.map);
    }
  }

  private initMap(): any {
    const { lat, lng } = this.center || { lat: 30, lng: 2 };
    this.map = L.map('map').setView([ lat, lng ], 5); // Set initial view to a world map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    // Add click event listener
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      this.mapClicked.emit({ lat, lng });
    });
    return this.map;
  }

  private updateCircles( map: L.Map ) {
    if (!this.center) {
      return;
    }
    this.circleMarkers.forEach(marker => marker.removeFrom(this.map));
    this.circleMarkers = [
      // createCircle(this.center),
      ...(this.grid || []).map(createCircle),
    ];
    this.circleMarkers.forEach(marker => marker.addTo(map));
  }

}
