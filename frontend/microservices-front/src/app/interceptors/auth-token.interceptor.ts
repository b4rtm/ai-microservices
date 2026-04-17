import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { RegisterService } from '../services/register.service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const registerService = inject(RegisterService);
  const token = registerService.getToken();

  if (!token) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
