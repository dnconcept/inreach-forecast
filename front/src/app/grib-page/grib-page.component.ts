import { Component } from '@angular/core';
import { JsonPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';

import { IDecodedItem, IGribCheck, IGribRequestResponse, IGribEncodedResponse, IGribRequest } from '@app.interfaces';
import { DialogService, RestApiService } from '@app.services';

import { GribMapComponent } from './grib-map/grib-map.component';
import { IPosition, mean } from '../utils';
import { InputGeolocComponent } from '../input-geoloc/input-geoloc.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-grib-page',
  imports: [
    JsonPipe,
    FormsModule,
    MatButton,
    GribMapComponent,
    InputGeolocComponent,
    NgIf,
    MatProgressBar,
    MatTab,
    MatTabGroup,
    NgTemplateOutlet
  ],
  templateUrl: './grib-page.component.html',
  styleUrl: './grib-page.component.scss',
  standalone: true,
})
export class GribPageComponent {

  message: IGribEncodedResponse;
  gribResponse?: IGribRequestResponse;
  center: IPosition;
  grid: IPosition[];
  encodedMessage?: string;
  decodedData: IDecodedItem[];
  lat: number;
  lng: number;
  offset: number = 3;
  file?: File;

  constructor( private restApi: RestApiService, private dialogService: DialogService, ) {
  }

  setLatLng( { lat, lng }: IPosition ) {
    this.lat = lat;
    this.lng = lng;
  }

  setFile( event: Event ) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.file = target.files[ 0 ];
    }
  }

  async requestGrib( lat: number, lng: number, offsetDegrees: number ) {
    const request = this.restApi.postAsync<IGribRequestResponse>(`/grip_request`, {
      lat,
      lng,
      offsetDegrees,
    } as IGribRequest);
    const response = await this.dialogService.executeAsync(request);
    if (!response) {
      return;
    }
    this.gribResponse = response;
    this.dialogService.flashInfo(`Le fichier GRIB a bien été envoyé avec la requête ${response.grib_request}`);
  }

  async checkGrib( search_subject: string ) {
    const response = await this.dialogService.executeAsync(this.restApi.getAsync<IGribCheck>(`/grip_check`, {
      search_subject
    }));
    if (!response) {
      return;
    }
    this.setGribResponse(response);
    this.dialogService.flashInfo(`Le GRIB a bien été récupéré et encodé`);
  }

  async encodeGrib( file?: File ) {
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await this.restApi.postAsync<IGribEncodedResponse>(`/encode_grib`, formData);
      this.setGribResponse(response);
      this.dialogService.flashInfo(`Le GRIB a bien été récupéré et encodé`);
    } catch (e) {
      this.dialogService.flashError(e);
    }
  }

  decode( encodedMessage?: string ) {
    if (encodedMessage) {
      this.decodedData = this.decodeData(encodedMessage);
    } else {
      this.dialogService.flashWarn(`Aucun message à décoder !`);
    }
  }

  private setGribResponse( response: IGribEncodedResponse ) {
    this.message = response;
    this.center = {
      lat: mean(response.lats),
      lng: mean(response.lngs),
    }
    const grid = [];
    for (const lat of response.lats) {
      for (const lng of response.lngs) {
        grid.push({ lat, lng });
      }
    }
    this.grid = grid;
    this.encodedMessage = response.encoded;
  }

  decodeData( encodedString: string ): IDecodedItem[] {
    const MS_TO_KNOTS = 1.94384;  // Conversion de m/s à nœuds
    const numDirections = 24;  // Nombre total de directions (A à X)

    // Générer la correspondance dynamique pour les directions (A-X)
    const directionMapping = Array.from({ length: numDirections }, ( _, index ) => index * 15);

    let decodedData: IDecodedItem[] = [];

    // Parcours de la chaîne encodée par paire (vitesse + direction)
    for (let i = 0; i < encodedString.length; i += 2) {
      let speedChar = encodedString[ i ];      // Vitesse (chiffre)
      let directionChar = encodedString[ i + 1 ]; // Direction (lettre)

      // Convertir la vitesse en nombre
      let speed = parseInt(speedChar);

      // Convertir la direction en index (lettre A=0, B=1, ..., X=23)
      let directionIndex = directionChar.charCodeAt(0) - 'A'.charCodeAt(0);

      // Obtenir la direction en degrés à partir de l'index
      let direction = directionMapping[ directionIndex ];

      // Calculer la vitesse en m/s (en supposant un maximum de 40 nœuds)
      let speedKnots = (speed / 9) * 40;
      let speedMs = speedKnots / MS_TO_KNOTS;

      // Ajouter les valeurs décodées à la liste
      decodedData.push({
        speedMs: speedMs.toFixed(2),
        speedKnots: speedKnots.toFixed(2),
        direction: direction
      });
    }

    return decodedData;
  }


}
