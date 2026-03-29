import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly baseUrl = 'http://localhost:8080/admin'; //url do zmiany jak juz bedzie

  constructor(private readonly http: HttpClient) {}
}
