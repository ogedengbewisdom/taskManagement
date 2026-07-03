import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'pending' | null;

interface IToast {
  message: string;
  statusCode?: number;
  status: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<IToast>({
    message: '',
    status: null,
  });
  toast$ = this.toastSubject.asObservable();

  showToast(message: string, status: ToastType, statusCode?: number, duration = 3000): void {
    this.toastSubject.next({ message, statusCode, status });
    if (status !== 'pending') {
      setTimeout(() => this.clearToast(), duration);
    }
  }

  clearToast(): void {
    this.toastSubject.next({ message: '', status: null, statusCode: undefined });
  }

  success(message: string, statusCode?: number, duration = 3000): void {
    this.showToast(message, 'success', statusCode, duration);
  }

  error(message: string, statusCode?: number, duration = 3000): void {
    this.showToast(message, 'error', statusCode, duration);
  }

  pending(message: string, statusCode?: number): void {
    this.showToast(message, 'pending', statusCode);
  }
}
