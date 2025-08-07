import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs'; // ✅ Fix: Missing import

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:5003/api/auth'; // your backend

  public user: any = null; // ✅ Fix: Declare `user`

  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data, {
      withCredentials: true, // ✅ For cookie auth
    }).pipe(
      tap((res: any) => this.user = res.user) // ✅ Fix: import `tap`
    );
  }

  register(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, data, {
      withCredentials: true,
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, {
      withCredentials: true,
    });
  }

  isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
  }

}
