import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs/operators';

// Guard genérico: Solo autenticación
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authReady$.pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    }),
  );
};

// Guard específico: Solo admins
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // SIEMPRE esperar authReady$ - no bypass
  return authService.authReady$.pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      if (authService.isAuthenticated() && authService.hasRole('admin')) {
        return true;
      }
      router.navigate(['/portafolios']);
      return false;
    }),
  );
};

// Guard específico: Solo programadores
export const programadorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // SIEMPRE esperar authReady$ - no bypass
  return authService.authReady$.pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      if (authService.isAuthenticated() && authService.hasRole('programador')) {
        return true;
      }
      router.navigate(['/portafolios']);
      return false;
    }),
  );
};
