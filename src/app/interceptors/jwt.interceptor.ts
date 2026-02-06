import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap, catchError, of } from 'rxjs';

/**
 * Interceptor para agregar el token de Firebase en todas las peticiones HTTP
 * Se envía a los 3 backends: Spring Boot, FastAPI y Jakarta/WildFly
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Si el usuario no está autenticado, continuar sin token
  if (!authService.isAuthenticated()) {
    console.log('🔓 Usuario no autenticado - petición sin token');
    return next(req);
  }

  console.log('🔐 Usuario autenticado - obteniendo token...');

  // Obtener el token de Firebase y agregarlo al header
  return from(authService.getIdToken()).pipe(
    switchMap(token => {
      console.log('✅ Token obtenido, agregando a petición');
      // Clonar la petición y agregar el header Authorization
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedReq);
    }),
    catchError(error => {
      console.error('❌ Error obteniendo token de Firebase:', error);
      // Si falla, continuar sin token
      console.log('⚠️ Continuando petición sin token debido al error');
      return next(req);
    })
  );
};
