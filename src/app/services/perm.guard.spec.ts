import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// Remove permGuard if unused
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
  return true;
};

export const supervisorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated() || !authService.hasRole('supervisor')) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
  return true;
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated() || !authService.hasRole('admin')) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
  return true;
};

export const userGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated() || !authService.hasRole('user')) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
  return true;
};