// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
   private apiUrl = 'http://localhost:5003/api/auth'; // your backend

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

 login(credentials: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true });
}

register(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/register`, data, { withCredentials: true });
}

logout(): Observable<any> {
  return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
}


  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
