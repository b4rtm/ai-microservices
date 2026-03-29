import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpamPageResponse } from '../Interfaces/SpamInterfaces';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private readonly baseUrl = 'http://localhost:8080/history';

  constructor(private readonly http: HttpClient) {}

  getUserHistory(userId: number, page = 0, size = 25): Observable<SpamPageResponse> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<SpamPageResponse>(`${this.baseUrl}/user/${userId}`, { params });
  }
}
