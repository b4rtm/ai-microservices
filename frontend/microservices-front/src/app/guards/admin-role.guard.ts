import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminRoleGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') ?? '').trim().toUpperCase();

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  if (role === 'ADMIN') {
    return true;
  }

  return router.createUrlTree(['/home']);
};
