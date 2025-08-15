import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.authApiUrl;

  // Hold the logged in user's info in memory
  currentUser: any = null;

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    console.log('[AuthService] Login API:', `${this.apiUrl}/login`);
    return this.http
      .post<any>(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        tap(res => {
          if (res && res.user) {
            this.currentUser = res.user; // store user for later use in memory
            localStorage.setItem('user', JSON.stringify(res.user)); // persist across reloads
          }
        })
      );
  }

  register(data: { username: string; email: string; password: string }): Observable<any> {
    console.log('[AuthService] Register API:', `${this.apiUrl}/signup`);
    return this.http.post<any>(`${this.apiUrl}/signup`, data, { withCredentials: true });
  }

  logout(): Observable<any> {
    console.log('[AuthService] Logout API:', `${this.apiUrl}/logout`);
    this.currentUser = null;
    localStorage.removeItem('user');
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }
  
  getProfile(): Observable<any> {
  // Assuming your auth API supports /me endpoint for user info
  return this.http.get(`${this.apiUrl}/me`, { withCredentials: true });
}

updateProfile(profileData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/me`, profileData, { withCredentials: true });
}

updatePassword(passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<any> {
  return this.http.put(`${this.apiUrl}/me/password`, passwordData, { withCredentials: true });
}

deleteAccount(): Observable<any> {
  return this.http.delete(`${this.apiUrl}/me`, { withCredentials: true });
}

  /** Load user info from storage on app start */
  loadUserFromStorage(): void {
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
    }
  }
}
