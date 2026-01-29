import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/portafolios']);
    }
  }

  async loginWithGoogle() {
    this.loading = true;
    this.error = null;

    try {
      const user = await this.authService.loginWithGoogle();

      if (user) {
        // Redirigir según el rol
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (user.role === 'programador') {
          this.router.navigate(['/programador']);
        } else {
          this.router.navigate(['/portafolios']);
        }
      } else {
        this.error = 'No se pudo iniciar sesión. Intenta de nuevo.';
      }
    } catch (err: any) {
      this.error = err.message || 'Error desconocido';
    } finally {
      this.loading = false;
    }
  }
}
