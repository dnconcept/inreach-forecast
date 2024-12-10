import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppInputBase } from '../app-input-base.directive';
import { round } from '../utils';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-input-geoloc',
  templateUrl: './input-geoloc.component.html',
  styleUrl: './input-geoloc.component.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputGeolocComponent), multi: true },
  ],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    NgForOf
  ]
})
export class InputGeolocComponent extends AppInputBase implements OnInit {
  @Input() type?: 'lat' | 'lng';
  asCoord = true;
  deg: number;
  min: number;
  dir: 0 | 1;
  directions: string[];

  ngOnInit(): void {
    this.directions = this.type === 'lat' ? [ 'N', 'S' ] : [ 'E', 'W' ];
  }

  protected override onWriteValue( value: number ): void {
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

  setValue( v: number ): void {
    this.value = v;
  }

  setFromDegrees( deg: number ): void {
    const oldValue = this.innerValue;
    this.deg = deg;
    const value = this.innerValue = (this.dir === 0 ? 1 : -1) * round(deg + this.min / 60);
    this.emitChange(oldValue, value);
  }

  setFromMinutes( minutes: number ): void {
    const oldValue = this.innerValue;
    this.min = minutes;
    const value = this.innerValue = (this.dir === 0 ? 1 : -1) * round(this.deg + minutes / 60);
    this.emitChange(oldValue, value);
  }

}
