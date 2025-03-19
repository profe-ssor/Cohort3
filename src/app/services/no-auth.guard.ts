import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const role = authService.getUserRole();
    switch (role) {
      case 'admin':
        router.navigate(['/admin-dashboard'], { replaceUrl: true });
        break;
      case 'supervisor':
        router.navigate(['/supervisor-dashboard'], { replaceUrl: true });
        break;
      case 'user':
        router.navigate(['/persneldashboard'], { replaceUrl: true });
        break;
      default:
        router.navigate(['/'], { replaceUrl: true });
    }
    return false;
  }
  return true;
};