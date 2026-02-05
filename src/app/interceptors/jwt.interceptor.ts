import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor JWT DESHABILITADO
 * No se usa validación de JWT - Firebase Auth maneja toda la autenticación
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // JWT deshabilitado - no agregamos ningún header
  // Los backends confían en las peticiones de Angular
  return next(req);
};

/* VERSIÓN ORIGINAL (DESHABILITADA)
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
*/
