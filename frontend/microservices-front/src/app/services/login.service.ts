import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../Interfaces/AuthInterfaces';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly loginUrl = 'http://localhost:8080/auth/login';

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    localStorage.clear();
    return this.http
      .post<LoginResponse>(this.loginUrl, payload)
      .pipe(tap((response) => this.saveAuthData(response)));
  }

  logout() {
    localStorage.clear();
  }

  private saveAuthData(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('email', response.email);
    localStorage.setItem('role', response.role);
    localStorage.setItem('userId', String(response.userId));
  }
}
