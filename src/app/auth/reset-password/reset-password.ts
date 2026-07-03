import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordInput } from '../../shared/component/password-input/password-input';
import { Button } from '../../shared/component/button/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth-service';
import { ToastService } from '../../core/services/toast/toast.service';
import { getErrorMessage, passwordMatchValidator } from '../../utils';
import { errorState } from '../../utils';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, PasswordInput, Button, RouterLink, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: '../auth.css',
})
export class ResetPassword {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  isLoading = signal<boolean>(false);
  resetPasswordForm!: FormGroup;
  token = this.route.snapshot.queryParamMap.get('token') as string;
  constructor() {
    this.resetPasswordForm = this.formBuilder.group(
      {
        password: ['', [Validators.required, passwordMatchValidator()]],
        confirmPassword: [''],
      },
      {
        validators: [passwordMatchValidator()],
      },
    );
  }

  get controls() {
    return this.resetPasswordForm.controls;
  }

  errorMessage = (formInputName: string) => getErrorMessage(formInputName, this.controls);
  hasError = (formInputName: string) => errorState(formInputName, this.controls);
  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.authService.resetPassword(this.resetPasswordForm.value, this.token).subscribe({
      next: (response) => {
        this.toastService.success(response.message ?? 'Password reset successful');
        this.isLoading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.toastService.error(error.error.message ?? 'Password reset failed');
      },
    });
  }
}
