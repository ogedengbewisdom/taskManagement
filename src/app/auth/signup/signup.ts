import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorState, getErrorMessage } from '../../utils';
import { InputText } from '../../shared/component/input-text/input-text';
import { PasswordInput } from '../../shared/component/password-input/password-input';
import { Button } from '../../shared/component/button/button';
import { AuthService } from '../../core/services/auth/auth-service';
import { ToastService } from '../../core/services/toast/toast.service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, InputText, PasswordInput, Button, RouterLink],
  templateUrl: './signup.html',
  styleUrl: '../auth.css',
})
export class Signup {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  isLoading = signal<boolean>(false);
  signupForm!: FormGroup;

  constructor() {
    this.signupForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get controls() {
    return this.signupForm.controls;
  }

  errorMessage = (formInputName: string) => getErrorMessage(formInputName, this.controls);
  hasError = (formInputName: string) => errorState(formInputName, this.controls);

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    // TODO: wire up auth service
    // console.log('Signup:', this.signupForm.value);
    this.authService.signUp<void>(this.signupForm.value).subscribe({
      next: () => {
        this.toastService.success('Signup successful');
        this.router.navigate(['/auth/login']);
        this.isLoading.set(false);
      },
      error: (error) => {
        const errorMessage = error.error.message ?? 'Signup failed';
        this.toastService.error(errorMessage);
        this.isLoading.set(false);
      },
    });
  }
}
