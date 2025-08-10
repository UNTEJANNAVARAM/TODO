import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.taskApiUrl;

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    console.log('[TaskService] Get Tasks API:', this.apiUrl);
    return this.http.get<Task[]>(this.apiUrl, { withCredentials: true });
  }

  addTask(task: Task): Observable<Task> {
    console.log('[TaskService] Add Task API:', this.apiUrl);
    return this.http.post<Task>(this.apiUrl, task, { withCredentials: true });
  }

  updateTask(id: number, task: Task): Observable<Task> {
    console.log('[TaskService] Update Task API:', `${this.apiUrl}/${id}`);
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task, { withCredentials: true });
  }

  deleteTask(id: number): Observable<{ message: string }> {
    console.log('[TaskService] Delete Task API:', `${this.apiUrl}/${id}`);
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
