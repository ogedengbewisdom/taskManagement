import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-text',
  imports: [ReactiveFormsModule],
  templateUrl: './input-text.html',
  styleUrl: './input-text.css',
})
export class InputText {
  @Input() formGroup!: FormGroup;
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'email' = 'text';
  @Input() errorMessage?: string = '';
  @Input() hasError?: boolean = false;
}
