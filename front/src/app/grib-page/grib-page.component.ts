import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GribMapComponent } from './grib-map/grib-map.component';
import { IPosition, mean } from '../utils';

interface IMessage {
  encoded: string;
  latitudes: number[];
  longitudes: number[];
}

@Component({
  selector: 'app-grib-page',
  imports: [
    JsonPipe,
    NgIf,
    FormsModule,
    GribMapComponent
  ],
  templateUrl: './grib-page.component.html',
  styleUrl: './grib-page.component.scss',
  standalone: true,
})
export class GribPageComponent {

  api = `http://localhost:8000`;
  // api = `https://inreach-grib-api-459273175845.europe-west1.run.app`;
  message: IMessage;
  center: IPosition;
  grid: IPosition[];
  encodedMessage: string;
  decodedMessage: string;

  constructor( private http: HttpClient ) {
  }

  setFile( event: Event ) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[ 0 ];
      this.send(file);
    }
  }

  private send( file: File ) {
    const { api } = this;
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<IMessage>(`${api}/extract_grib`, formData).subscribe({
      next: ( data ) => {
        this.message = data;
        this.center = {
          lat: mean(data.latitudes),
          lng: mean(data.longitudes),
        }
        const grid = [];
        for (const lat of data.latitudes) {
          for (const lng of data.longitudes) {
            grid.push({ lat, lng });
          }
        }
        this.grid = grid;
        console.info('[GribPageComponent] next ', this.center, data);
        // this.encodedMessage = data.encoded;
      },
      error: ( error ) => console.error('[GribPageComponent] Error sending file', error),
    });
  }

}
