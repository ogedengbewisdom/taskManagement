import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  imports: [ReactiveFormsModule],
  templateUrl: './password-input.html',
  styleUrl: './password-input.css',
})
export class PasswordInput {
  @Input() formGroup!: FormGroup;
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() errorMessage?: string = '';
  @Input() hasError?: boolean = false;

  showPassword = false;

  toggle(): void {
    this.showPassword = !this.showPassword;
  }
}
