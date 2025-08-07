// src/app/services/task.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseUrl = 'http://localhost:5003/api/tasks'; // ✅ or your backend URL

  constructor(private http: HttpClient) {}

  getTasks(): Observable<any> {
  return this.http.get(`${this.baseUrl}/tasks`);
}

createTask(id: number, task: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/tasks/${id}`, task);
}


  addTask(task: any): Observable<any> {
    return this.http.post(this.baseUrl, task, {
      withCredentials: true,
    });
  }

  updateTask(id: number, task: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, task, {
      withCredentials: true,
    });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
