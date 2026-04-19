import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse, RegisterRequest } from '../Interfaces/AuthInterfaces';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private readonly registerUrl = 'http://localhost:8080/auth/register';

  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterRequest): Observable<LoginResponse> {
    localStorage.clear();
    return this.http
      .post<LoginResponse>(this.registerUrl, payload)
      .pipe(tap((response) => this.saveAuthData(response)));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private saveAuthData(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('email', response.email);
    localStorage.setItem('role', response.role);
    localStorage.setItem('userId', String(response.userId));
  }
}
