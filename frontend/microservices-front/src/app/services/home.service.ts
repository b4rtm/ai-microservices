import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpamCheckRequest, SpamCheckResponse } from '../Interfaces/SpamInterfaces';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private readonly baseUrl = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  predictSpam(payload: SpamCheckRequest): Observable<SpamCheckResponse> {
    return this.http.post<SpamCheckResponse>(`${this.baseUrl}/spam/predict`, payload);
  }
}
