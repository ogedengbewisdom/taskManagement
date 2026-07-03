import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export interface IOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select-status',
  imports: [ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectStatus),
      multi: true,
    },
  ],
  templateUrl: './select-status.html',
  styleUrl: './select-status.css',
})
export class SelectStatus implements ControlValueAccessor, OnChanges {
  @Input() label = '';
  @Input() placeholder = 'Select an option';
  @Input() options: IOption[] | null = null;
  @Input() hasError: boolean = false;
  @Input() errorMessage: string = '';
  @Input() icon = '';
  @Input() boardName= '';
  isOpen: boolean = false;
  selectedLabel: string = '';
  value: string = '';
  isDisabled: boolean = false;

  // called when value changes
  private onChange: (value: string) => void = () => {
    // console.log('onChange', value);
  };

  // called when field is touched
  private onTouched: () => void = () => {};

  // ControlValueAccessor methods
  // writeValue
  // registerOnChange
  // registerOnTouched
  // setDisabledState optional

  // writes value into component
  // writeValue(value: string): void {
  //   this.value = value;
  //   const match = this.options?.find((option) => option.value === value);
  //   this.selectedLabel = match ? match.label : '';
  // }

  writeValue(value: string): void {
    this.value = value;
    const match = this.options?.find((option) => option.value === value);
    this.selectedLabel = match ? match.label : '';
  }

  // registers your onChange handler
  registerOnChange(changeFn: (value: string) => void): void {
    this.onChange = changeFn;
  }

  // registers your onTouched handler
  registerOnTouched(touchFn: () => void): void {
    this.onTouched = touchFn;
  }

  // calls this when form is disabled
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  toggleDropdown(): void {
    if (!this.isDisabled) {
      this.isOpen = !this.isOpen;
      this.onTouched();
    }
  }

  selectOption(option: IOption): void {
    this.value = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;
    this.onChange(option.value);
    this.onTouched();
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.value) {
      const match = this.options?.find((option) => option.value === this.value);
      this.selectedLabel = match ? match.label : '';
    }
  }
}
