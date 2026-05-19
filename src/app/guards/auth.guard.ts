import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return router.parseUrl('/login');
  }
  return true;
};

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn()) {
      return router.parseUrl('/login');
    }
    const hasRole = allowedRoles.some(r => auth.hasRole(r));
    if (!hasRole) {
      return router.parseUrl('/solicitudes');
    }
    return true;
  };
}
