import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from '../../shared/component/input-text/input-text';
import { Button } from '../../shared/component/button/button';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth-service';
import { ToastService } from '../../core/services/toast/toast.service';
import { getErrorMessage } from '../../utils';
import { errorState } from '../../utils';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, InputText, Button, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: '../auth.css',
})
export class ForgotPassword {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  isLoading = signal<boolean>(false);
  forgotPasswordForm!: FormGroup;
  constructor() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get controls() {
    return this.forgotPasswordForm.controls;
  }

  errorMessage = (formInputName: string) => getErrorMessage(formInputName, this.controls);
  hasError = (formInputName: string) => errorState(formInputName, this.controls);
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
      next: (response) => {
        this.toastService.success(response.message ?? 'Reset password link sent');
        this.isLoading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.toastService.error(error.error.message ?? 'Failed to send reset password link');
      },
    });
  }
}
