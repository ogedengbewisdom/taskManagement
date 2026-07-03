import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { errorState, getErrorMessage } from '../../utils';
import { InputText } from '../../shared/component/input-text/input-text';
import { PasswordInput } from '../../shared/component/password-input/password-input';
import { Button } from '../../shared/component/button/button';
import { AuthService } from '../../core/services/auth/auth-service';
import { ToastService } from '../../core/services/toast/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputText, PasswordInput, Button, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: '../auth.css',
})
export class Login implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  redirectUrl = this.route.snapshot.queryParams['redirectUrl'] || '/app/dashboard';
  isLoading = signal<boolean>(false);
  loginForm!: FormGroup;

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    // this.redirectUrl = this.route.snapshot.queryParams['redirectUrl'] || '/app/dashboard';
  }

  get controls() {
    return this.loginForm.controls;
  }

  errorMessage = (formInputName: string) => getErrorMessage(formInputName, this.controls);
  hasError = (formInputName: string) => errorState(formInputName, this.controls);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    // TODO: wire up auth service
    this.isLoading.set(true);
    this.authService.signIn<{ token: string }>(this.loginForm.value).subscribe({
      next: (response) => {
        this.authService.refreshToken(response.data.token);
        this.toastService.success(response.message ?? 'Login successful');
        // this.router.navigate([this.redirectUrl]);
        this.router.navigateByUrl(decodeURIComponent(this.redirectUrl));
      },
      error: (error) => {
        this.isLoading.set(false);
        this.toastService.error(error.error.message ?? 'Login failed');
      },
    });
  }
}
