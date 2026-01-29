import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected readonly title = signal('Portafolio y Asesorías AyT');

  constructor(private authService: AuthService) {}

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  isProgramador(): boolean {
    return this.authService.hasRole('programador');
  }

  logout(): void {
    this.authService.logout();
  }
}
