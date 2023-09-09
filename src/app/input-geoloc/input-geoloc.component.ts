import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppInputBase } from '../app-input-base.directive';
import { round } from '../utils';

@Component({
  selector: 'app-input-geoloc',
  templateUrl: './input-geoloc.component.html',
  styleUrls: [ './input-geoloc.component.css' ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputGeolocComponent), multi: true },
  ]
})
export class InputGeolocComponent extends AppInputBase implements OnInit {
  @Input() placeholder;
  @Input() type: 'lat' | 'lng';
  asCoord = true;
  deg;
  min;
  dir: 0 | 1;
  directions;

  ngOnInit(): void {
    this.directions = this.type === 'lat' ? [ 'N', 'S' ] : [ 'E', 'W' ];
  }

  protected onWriteValue( value: number ): void {
    if (this.type === 'lat') {
      this.dir = value > 0 ? 0 : 1;
    } else {
      this.dir = value > 0 ? 0 : 1;
    }
    const ints = Math.trunc(value);
    this.deg = Math.abs(ints);
    const decimals = 2; // countDecimal(value);
    // console.info('[InputGeolocComponent] onWriteValue decimals', decimals, value);
    this.min = Math.abs(round((value - ints) * 0.60, decimals) * Math.pow(10, decimals));
  }

  setValue( v ): void {
    this.value = v;
  }

  setFromDegrees( deg ): void {
    const oldValue = this.innerValue;
    this.deg = deg;
    const value = this.innerValue = (this.dir === 0 ? 1 : -1) * round(deg + this.min / 60);
    this.emitChange(oldValue, value);
  }

  setFromMinutes( minutes ): void {
    const oldValue = this.innerValue;
    this.min = minutes;
    const value = this.innerValue = (this.dir === 0 ? 1 : -1) * round(this.deg + minutes / 60);
    this.emitChange(oldValue, value);
  }

}
