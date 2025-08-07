// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
   private baseUrl = 'http://localhost:5003/api/auth'; // your backend

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  register(user: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/signup`, user); // <-- updated to match backend
}


  login(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, user).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          this.loggedIn.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.loggedIn.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
