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

  quoteMessage: string = '';

  newTask: Partial<Task> = {
    title: '',
    description: '',
    status: false,
    dueDate: ''
  };

  editTaskId: number | null = null;
  editTask: Partial<Task> = {
    title: '',
    description: '',
    status: false,
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

  getTasks() {
    this.taskService.getTasks().subscribe({
      next: (res) => (this.tasks = res),
      error: (err) => console.error('Error fetching tasks:', err)
    });
  }

  createTask() {
    if (!this.newTask.title || !this.newTask.description || !this.newTask.dueDate) {
      alert('Please fill all fields');
      return;
    }
    this.newTask.status = false;
    this.taskService.addTask(this.newTask as Task).subscribe({
      next: (res) => {
        this.tasks.push(res);
        this.newTask = { title: '', description: '', status: false, dueDate: '' };
        this.showQuote("Let's get chasing your work 🚀");
      },
      error: (err) => console.error('Error creating task:', err)
    });
  }

  startEdit(task: Task) {
    this.editTaskId = task.id!;
    this.editTask = {
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate
    };
  }

  cancelEdit() {
    this.editTaskId = null;
    this.editTask = { title: '', description: '', status: false, dueDate: '' };
  }

  updateTask(task: Task) {
    const taskId = task.id!;
    const originalTask = this.tasks.find(t => t.id === taskId);
    const beforeStatus = originalTask?.status;
    const beforeDue = originalTask?.dueDate;

    this.taskService.updateTask(taskId, this.editTask as Task).subscribe({
      next: (updated) => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index > -1) {
          this.tasks[index] = updated;
        }
        // QUOTE logic
        if (this.editTask.status === true && beforeStatus !== true) {
          this.showQuote("Cheers up! 🎉 Task completed.");
        } else if (
          beforeDue &&
          this.editTask.dueDate &&
          new Date(this.editTask.dueDate) > new Date(beforeDue)
        ) {
          this.showQuote("Taking extra time is fine! Keep going ⏳");
        }
        this.cancelEdit();
      },
      error: (err) => console.error('Error updating task:', err)
    });
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((task) => task.id !== id);
      },
      error: (err) => console.error('Error deleting task:', err)
    });
  }

  // Show quote for 3 seconds and scroll into view
  private showQuote(message: string) {
    this.quoteMessage = message;
    setTimeout(() => (this.quoteMessage = ''), 3000);
    setTimeout(() => {
      const el = document.getElementById('quoteBanner');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 10); // Short delay to allow rendering
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
