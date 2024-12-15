import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppInputBase } from '../app-input-base.directive';
import { round } from '../utils';
import { NgForOf, NgIf } from '@angular/common';

interface IDir {
  name: 'N'|'S'|'E'|'W';
  factor: -1 | 1;
  type: 'lat'|'lng';
}

const DIRECTIONS: IDir[] = [
  { name: 'N', factor: 1, type: 'lat' },
  { name: 'S', factor: -1, type: 'lat' },
  { name: 'E', factor: 1, type: 'lng' },
  { name: 'W', factor: -1, type: 'lng' },
];

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
  factor: -1 | 1 = 1;
  directions: IDir[];

  ngOnInit(): void {
    this.directions = DIRECTIONS.filter(x => x.type == this.type);
  }

  protected override onWriteValue( value: number ): void {
    this.factor = value > 0 ? 1 : -1;
    const ints = Math.trunc(value);
    this.deg = Math.abs(ints);
    const decimals = 2; // countDecimal(value);
    this.min = Math.abs(round((value - ints) * 0.60, decimals) * Math.pow(10, decimals));
  }

  setValue( v: number ): void {
    this.value = v;
  }

  setFromDegrees( deg: number ): void {
    const oldValue = this.innerValue;
    this.deg = deg;
    const value = this.innerValue = (this.factor) * round(deg + this.min / 60);
    this.emitChange(oldValue, value);
  }

  setFromMinutes( minutes: number ): void {
    const oldValue = this.innerValue;
    this.min = minutes;
    const value = this.innerValue = (this.factor) * round(this.deg + minutes / 60);
    this.emitChange(oldValue, value);
  }

  setFromDir( factor: -1 | 1 ): void {
    const oldValue = this.innerValue;
    const value = factor * Math.abs(oldValue);
    this.emitChange(oldValue, value);
  }

}
