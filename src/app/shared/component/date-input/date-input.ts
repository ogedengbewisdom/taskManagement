import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-input',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './date-input.html',
  styleUrl: './date-input.css',
})
export class DateInput {
  @Input() formGroup!: FormGroup;
  @Input() name = '';
  @Input() label = '';
  @Input() hasError = false;
  @Input() errorMessage = '';
  @Input() minDate: string | null = null;
  @Input() maxDate: string | null = null;


  @ViewChild('dateInput')
  dateInput!: ElementRef<HTMLInputElement>;
  @Input() showChevron = false;

  openDatePicker(): void {
    const control = this.formGroup.get(this.name);
  
    control?.markAsTouched();
  
    const input = this.dateInput.nativeElement as HTMLInputElement & {
      showPicker?: () => void;
    };
  
    if (input.showPicker) {
      input.showPicker();
    } else {
      input.click();
    }
  }
}
