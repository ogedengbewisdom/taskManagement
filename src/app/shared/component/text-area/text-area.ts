import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-area',
  imports: [ReactiveFormsModule],
  templateUrl: './text-area.html',
  styleUrl: './text-area.css',
})
export class TextArea {
  @Input() formGroup!: FormGroup;
  @Input() name: string = '';
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() errorMessage?: string = '';
  @Input() hasError?: boolean = false;
}
