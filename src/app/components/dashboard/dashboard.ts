import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];

  newTask: Partial<Task> = {
    title: '',
    description: '',
    status: '',
    dueDate: ''
  };

  // Editing state
  editTaskId: number | null = null;
  editTask: Partial<Task> = {
    title: '',
    description: '',
    status: '',
    dueDate: ''
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getTasks();
  }

  // Fetch tasks from backend
  getTasks() {
    this.taskService.getTasks().subscribe({
      next: (res) => (this.tasks = res),
      error: (err) => console.error('Error fetching tasks:', err)
    });
  }

  // Create a new task
  createTask() {
    if (!this.newTask.title || !this.newTask.description || !this.newTask.dueDate) {
      alert('Please fill all fields');
      return;
    }

    this.taskService.addTask(this.newTask as Task).subscribe({
      next: (res) => {
        this.tasks.push(res);
        this.newTask = { title: '', description: '', status: '', dueDate: '' };
      },
      error: (err) => console.error('Error creating task:', err)
    });
  }

  // Start editing a task
  startEdit(task: Task) {
    this.editTaskId = task.id!;
    this.editTask = {
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate
    };
  }

  // Cancel edit
  cancelEdit() {
    this.editTaskId = null;
    this.editTask = { title: '', description: '', status: '', dueDate: '' };
  }

  // Update an existing task
  updateTask(taskId: number) {
    this.taskService.updateTask(taskId, this.editTask as Task).subscribe({
      next: (updated) => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index > -1) {
          this.tasks[index] = updated;
        }
        this.cancelEdit();
      },
      error: (err) => console.error('Error updating task:', err)
    });
  }

  // Delete a task
  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((task) => task.id !== id);
      },
      error: (err) => console.error('Error deleting task:', err)
    });
  }

  // LOGOUT FUNCTION: Calls backend to clear cookie, then navigates to login page
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // If error, still redirect
        this.router.navigate(['/login']);
      }
    });
  }
}
