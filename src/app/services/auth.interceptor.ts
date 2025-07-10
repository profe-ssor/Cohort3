import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('access_token');

  // Don't add Authorization header for authentication endpoints
  const authEndpoints = ['/login/', '/register/', '/verify-otp/', '/resend-otp/', '/token/refresh/'];
  const shouldSkipAuth = authEndpoints.some(endpoint => req.url.includes(endpoint));

  if (token && !shouldSkipAuth) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.status === 401 && !req.url.includes('/token/refresh/')) {
        console.log('Token expired, attempting to refresh...');

        // Try to refresh the token
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry the original request with the new token
            const newToken = localStorage.getItem('access_token');
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            console.log('Token refresh failed, redirecting to login');

            // Clear stored tokens and user data
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('userData');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userFullName');

            // Redirect to login page
            router.navigate(['/login'], { replaceUrl: true });
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
