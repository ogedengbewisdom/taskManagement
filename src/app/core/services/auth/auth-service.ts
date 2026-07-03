import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface IRegResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  status: string;
  timestamp: string;
}

export interface IRes {
  statusCode: number;
  message: string;
  status: string;
  timestamp: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export type TUserRole = 'admin' | 'user';

export interface IUser {
  id: number;
  email: string;
  role: TUserRole;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;
  private readonly version = 'v1';

  private readonly router = inject(Router);
  isLoggedIn = signal<boolean>(false);
  user = signal<IUser | null>(null);

  refreshToken(newToken: string): void {
    sessionStorage.setItem('taskSpaceJwt', newToken);
    this.isLoggedIn.set(true);
    this.user.set(this.getUserData());
  }

  signUp<T>(request: SignUpRequest): Observable<IRegResponse<T>> {
    return this.http.post<IRegResponse<T>>(`${this.apiUrl}/${this.version}/auth/signup`, request);
  }

  signIn<T>(request: SignInRequest): Observable<IRegResponse<T>> {
    return this.http.post<IRegResponse<T>>(`${this.apiUrl}/${this.version}/auth/signin`, request);
  }

  forgotPassword(request: { email: string }): Observable<IRes> {
    return this.http.post<IRes>(`${this.apiUrl}/${this.version}/auth/forgot-password`, request);
  }

  resetPassword<T>(
    resetPasswordRequest: ResetPasswordRequest,
    token: string,
  ): Observable<IRegResponse<T>> {
    return this.http.post<IRegResponse<T>>(
      `${this.apiUrl}/${this.version}/auth/reset-password/${token}`,
      resetPasswordRequest,
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem('taskSpaceJwt');
  }

  setLoggedIn(value: boolean): void {
    this.isLoggedIn.set(value);
  }

  getUserData(): IUser | null {
    const decoded = this.decodedToken();
    if (!decoded) return null;

    return {
      id: decoded.sub,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      role: decoded.role,
    };
  }

  logout(): void {
    sessionStorage.removeItem('taskSpaceJwt');
    this.isLoggedIn.set(false);
    this.router.navigate(['/auth/login']);
  }

  decodedToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decodePayload = atob(payload);
      return JSON.parse(decodePayload);
    } catch (error) {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const decoded = this.decodedToken();
    if (!decoded?.exp) return true;

    const expiredInMs = decoded.exp * 1000;

    return Date.now() > expiredInMs;
  }

  handleExpiredToken(): boolean {
    const token = this.getToken();

    if (!token) return false;
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }

    return true;
  }

  timerLogout(): void {
    const decoded = this.decodedToken();
    if (!decoded?.exp) return;
    const expiredInMs = decoded.exp * 1000;
    const duration = expiredInMs - Date.now();

    if (duration > 0) {
      setTimeout(() => this.logout(), duration);
    }
  }
}
