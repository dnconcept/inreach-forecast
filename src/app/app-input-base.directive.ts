import { Directive, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class AppInputBase<T = any> implements ControlValueAccessor {

  @HostBinding('class.is-disabled')
  isDisabled: boolean;
  @Input() label: string;
  @Input() placeholder = '';
  @Output() change: EventEmitter<T> = new EventEmitter<T>();

  protected innerValue: T;
  protected pDisabled = false;

  protected onTouched: ( _: any ) => void;
  protected onChangedList: (( _: any ) => void)[] = [];

  get value(): T {
    return this.innerValue;
  }

  @Input() set value( value: T ) {
    const oldValue = this.innerValue;
    this.innerValue = value;
    this.onWriteValue(this.innerValue);
    this.emitChange(oldValue, value);
  }

  protected emitChange( oldValue, value ) {
    if (oldValue !== value) {
      this.onChangedList.forEach(x => x(this.innerValue));
      this.change.emit(this.innerValue);
    }
  }

  @Input()
  get disabled(): boolean {
    return this.pDisabled;
  }

  set disabled( value: boolean ) {
    this.pDisabled = coerceBooleanProperty(value);
    this.isDisabled = this.pDisabled;
  }

  writeValue( obj: T ): void {
    this.innerValue = obj;
    this.onWriteValue(this.innerValue);
  }

  setDisabledState?( isDisabled: boolean ): void {
    this.disabled = isDisabled;
  }

  registerOnTouched( onTouched: any ): void {
    this.onTouched = onTouched;
  }

  registerOnChange( onChange: any ): void {
    this.onChangedList.push(onChange);
  }

  protected onWriteValue( value: T ): void {
  }

}
