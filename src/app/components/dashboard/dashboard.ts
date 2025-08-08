import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
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
  newTask: Partial<Task> = { title: '', description: '', dueDate: '' };

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.getTasks();
  }
editTaskId: number | null = null;
editTask = { title: '', description: '', dueDate: '' };

startEdit(task: any) {
  this.editTaskId = task.id;
  this.editTask = { ...task }; // clone the task
}

cancelEdit() {
  this.editTaskId = null;
  this.editTask = { title: '', description: '', dueDate: '' };
}

updateTask(taskId: number) {
  this.taskService.updateTask(taskId, this.editTask).subscribe({
    next: (updated) => {
      const index = this.tasks.findIndex(t => t.id === taskId);
      if (index > -1) {
        this.tasks[index] = updated; // update in local array
      }
      this.cancelEdit();
    },
    error: (err) => console.error(err)
  });
}

  getTasks() {
    this.taskService.getTasks().subscribe({
      next: (res) => (this.tasks = res),
      error: (err) => console.error(err)
    });
  }

  createTask() {
    if (!this.newTask.title || !this.newTask.description || !this.newTask.dueDate) {
      alert('Please fill all fields');
      return;
    }
    this.taskService.addTask(this.newTask as Task).subscribe({
      next: (res) => {
        this.tasks.push(res);
        this.newTask = { title: '', description: '', dueDate: '' };
      },
      error: (err) => console.error(err)
    });
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((task) => task.id !== id);
      },
      error: (err) => console.error(err)
    });
  }
}
