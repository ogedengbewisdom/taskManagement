import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
