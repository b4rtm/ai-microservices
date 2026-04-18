import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserPageResponse } from '../Interfaces/AdminInterfaces';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly baseUrl = 'http://localhost:8080/users/users';

  constructor(private readonly http: HttpClient) {}

  getAllUsers(page = 0, size = 10, email?: string): Observable<UserPageResponse> {
    let params = new HttpParams().set('page', page).set('size', size);

    const normalizedEmail = email?.trim();
    if (normalizedEmail) {
      params = params.set('email', normalizedEmail);
    }

    return this.http.get<UserPageResponse>(`${this.baseUrl}/all`, { params });
  }

  toggleArchiveUser(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/archive`, null);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleUserRole(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/role`, null);
  }
}
