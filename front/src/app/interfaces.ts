import { IPosition } from './utils';

export interface IGribEncodedResponse {
  /** encoded message to be sent */
  encoded: string;
  lats: number[];
  lngs: number[];
  u: number[];
  v: number[];
}

export interface IDecodedItem {
  /** Vitesse en m/s */
  speedMs: string;
  /** Vitesse en noeuds */
  speedKnots: string;
  /** Direction en degrés */
  direction: number;
}

export interface IGribCheck extends IGribEncodedResponse {
  file: string;
}

export interface IGribRequest {
  lat: number;
  lng: number;
  offsetDegrees: number;
}

export interface IGribRequestResponse {
  message?: string;
  center?: IPosition;
  grib_request?: string;
  grib_subject?: string;
}

export interface IResult extends IPosition {
  label: string;
  dir: string;
  wind_dir?: number;
  wind?: number;
  max_wind?: number;
  wave?: number;
}

export interface IFormValue {
  lat: number,
  lng: number,
  cap: number,
  speed: number,
  hoursNumber: number,
  offsetMiles: number,
}
