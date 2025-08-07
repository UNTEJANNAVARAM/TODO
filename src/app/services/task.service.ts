// src/app/services/task.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseUrl = 'https://localhost:5003/api/tasks';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getTasks(): Observable<any> {
    return this.http.get(this.baseUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  createTask(task: any): Observable<any> {
    return this.http.post(this.baseUrl, task, {
      headers: this.getAuthHeaders(),
    });
  }

  updateTask(id: number, task: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, task, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
