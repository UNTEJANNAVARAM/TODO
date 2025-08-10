import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.authApiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: { email: string, password: string }): Observable<any> {
    console.log('[AuthService] Login API:', `${this.apiUrl}/login`);
    return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true });
  }

  register(data: { username: string, email: string, password: string }): Observable<any> {
    console.log('[AuthService] Register API:', `${this.apiUrl}/signup`);
    return this.http.post(`${this.apiUrl}/signup`, data, { withCredentials: true });
  }

  logout(): Observable<any> {
    console.log('[AuthService] Logout API:', `${this.apiUrl}/logout`);
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }
}
