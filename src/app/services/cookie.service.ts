// src/app/services/cookie.service.ts
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AppCookieService {
  constructor(private cookieService: CookieService) {}

  setToken(token: string): void {
    this.cookieService.set('token', token, { path: '/', secure: true });
  }

  getToken(): string {
    return this.cookieService.get('token');
  }

  deleteToken(): void {
    this.cookieService.delete('token', '/');
  }

  isLoggedIn(): boolean {
    return this.cookieService.check('token');
  }
}
