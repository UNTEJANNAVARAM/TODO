import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'https://todo-list-backend-sk9a.onrender.com/api/tasks'; // ✅ correct protocol & URL

  constructor(private http: HttpClient) {}

  // ✅ Fetch all tasks for the logged-in user
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, { withCredentials: true });
  }

  // ✅ Add new task
  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task, { withCredentials: true });
  }

  // ✅ Update task by ID
  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task, { withCredentials: true });
  }

  // ✅ Delete task by ID
  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
