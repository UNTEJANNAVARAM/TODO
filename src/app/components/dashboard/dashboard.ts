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
  filteredTasks: Task[] = [];
  selectedTask: Task | null = null;

  currentDate = new Date();
  showAddTaskForm = false;
  calendarVisible = false;
  selectedDate: Date | null = null;
  searchTerm = '';
  editMode = false;
  editTaskData: Task = {} as Task;

  // Validation error strings
  createError = '';
  editError = '';

  completedPercent = 0;
  ongoingPercent = 0;
  overduePercent = 0;
  completedCount = 0;
  ongoingCount = 0;
  overdueCount = 0;
  streakCount = 0;

  user = { displayName: '' };
  newTask: Partial<Task> = { title: '', description: '', status: false, dueDate: '' };

  weekDays = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  calendarWeeks: any[] = [];
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  currentMonthName = '';

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
  // Restore the user from storage if available
  this.authService.loadUserFromStorage();

  if (this.authService.currentUser) {
    const u = this.authService.currentUser;
    this.user.displayName = u.name || u.username || u.displayName || 'User';
  } else {
    this.user.displayName = 'User';
  }

  this.getTasks();
  this.updateMonthName();
  this.generateCalendar(this.currentYear, this.currentMonth);
  setInterval(() => (this.currentDate = new Date()), 1000);
}




  /* ===== UI Interaction ===== */
  showAddTaskFormToggle() {
    this.showAddTaskForm = !this.showAddTaskForm;
    if (this.showAddTaskForm) {
      this.editMode = false;
      this.selectedTask = null;
      this.createError = '';
    }
  }

  showTaskDetails(task: Task) {
    this.selectedTask = task;
    this.editMode = false;
    this.showAddTaskForm = false;  // hide add form
    this.createError = '';
    this.editError = '';
  }

  toggleCalendar() {
    this.calendarVisible = !this.calendarVisible;
    if (!this.calendarVisible) {
      this.selectedDate = null;
      this.filteredTasks = [...this.tasks];
    }
  }

  /* ===== CRUD ===== */
  getTasks() {
    this.taskService.getTasks().subscribe(res => {
      this.tasks = res;
      this.filteredTasks = res;
      this.calculateTaskSummary();
      this.calculateStreak();
    });
  }

  createTask() {
    this.createError = '';
    if (!this.newTask.title || !this.newTask.description || !this.newTask.dueDate) {
      this.createError = 'All fields are required.';
      return;
    }
    const due = new Date(this.newTask.dueDate);
    if (due.getTime() < new Date().setHours(0,0,0,0)) {
      this.createError = 'Due date cannot be earlier than today.';
      return;
    }

    this.newTask.status = false;
    this.taskService.addTask(this.newTask as Task).subscribe(task => {
      this.tasks.push(task);
      this.filteredTasks = [...this.tasks];
      this.newTask = { title: '', description: '', status: false, dueDate: '' };
      this.showAddTaskForm = false;
      this.calculateTaskSummary();
      this.calculateStreak();
    });
  }

  startEdit(task: Task) {
    this.editMode = true;
    this.editError = '';
    this.editTaskData = { ...task };
  }

  saveEdit() {
    this.editError = '';
    if (!this.editTaskData.title || !this.editTaskData.description || !this.editTaskData.dueDate) {
      this.editError = 'All fields are required.';
      return;
    }
    const due = new Date(this.editTaskData.dueDate);
    if (due.getTime() < new Date().setHours(0,0,0,0)) {
      this.editError = 'Due date cannot be earlier than today.';
      return;
    }

    this.taskService.updateTask(this.editTaskData.id!, this.editTaskData).subscribe(updated => {
      const idx = this.tasks.findIndex(t => t.id === updated.id);
      if (idx > -1) this.tasks[idx] = updated;
      this.filteredTasks = [...this.tasks];
      this.selectedTask = updated;
      this.editMode = false;
      this.calculateTaskSummary();
      this.calculateStreak();
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.editError = '';
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.filteredTasks = this.filteredTasks.filter(t => t.id !== id);
      if (this.selectedTask?.id === id) {
        this.selectedTask = null;
        this.editMode = false;
      }
      this.calculateTaskSummary();
      this.calculateStreak();
    });
  }

  toggleComplete(task: Task) {
    const updatedTask = { ...task, status: !task.status };
    this.taskService.updateTask(task.id!, updatedTask).subscribe(updated => {
      const idx = this.tasks.findIndex(t => t.id === updated.id);
      if (idx > -1) this.tasks[idx] = updated;
      this.filteredTasks = [...this.tasks];
      this.selectedTask = updated;
      this.calculateTaskSummary();
      this.calculateStreak();
    });
  }

  /* ===== Calendar & Color Logic ===== */
  selectDate(dateObj: { fullDate: Date | null }): void {
    if (!dateObj.fullDate) {
      this.filteredTasks = [...this.tasks];
      this.selectedDate = null;
      return;
    }
    this.selectedDate = dateObj.fullDate;
    this.filteredTasks = this.tasks.filter(
      t => t.dueDate && new Date(t.dueDate).toDateString() === this.selectedDate!.toDateString()
    );
  }

  isDueWithinTwoDays(dateStr?: string | Date, done?: boolean): boolean {
    if (!dateStr || done) return false;
    const diffDays = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 2 && diffDays >= 0;
  }

  isOverdue(dateStr?: string | Date, done?: boolean): boolean {
    if (!dateStr) return false;
    return !done && new Date(dateStr).getTime() < Date.now();
  }

  getDateClass(dateObj: any): string {
    if (!dateObj.fullDate) return '';
    const dateTasks = this.tasks.filter(
      t => t.dueDate && new Date(t.dueDate).toDateString() === dateObj.fullDate.toDateString()
    );
    if (dateTasks.length === 0) return '';
    if (dateTasks.every(t => t.status)) return 'calendar-green';
    if (dateTasks.some(t => !t.status && t.dueDate && new Date(t.dueDate).getTime() < Date.now())) {
      return 'calendar-red';
    }
    if (dateTasks.some(t => this.isDueWithinTwoDays(t.dueDate, t.status))) {
      return 'calendar-orange';
    }
    return '';
  }

  /* ===== Summary & Streak ===== */
  calculateTaskSummary() {
    const total = this.tasks.length || 1;
    this.completedCount = this.tasks.filter(t => t.status).length;
    this.overdueCount = this.tasks.filter(t => this.isOverdue(t.dueDate, t.status)).length;
    this.ongoingCount = this.tasks.filter(
      t => !t.status && !this.isOverdue(t.dueDate, t.status)
    ).length;
    this.completedPercent = Math.round((this.completedCount / total) * 100);
    this.overduePercent = Math.round((this.overdueCount / total) * 100);
    this.ongoingPercent = Math.round((this.ongoingCount / total) * 100);
  }

  calculateStreak() {
    let count = 0;
    this.tasks.filter(t => t.status && t.dueDate && t.updatedAt).forEach(task => {
      const due = new Date(task.dueDate as string), done = new Date(task.updatedAt as string);
      const diff = Math.floor((due.getTime() - done.getTime()) / 86400000);
      if (diff > 1) count += 2;
      else if (diff >= 0) count += 1;
    });
    this.streakCount = count;
  }

  /* ===== Search ===== */
  applySearchFilter() {
    const term = this.searchTerm.toLowerCase();
    this.filteredTasks = this.tasks.filter(
      t => t.title.toLowerCase().includes(term) ||
           (t.description ?? '').toLowerCase().includes(term)
    );
  }

  /* ===== Calendar Generation ===== */
  generateCalendar(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: any[] = [];
    let currentWeek: any[] = new Array(firstDay).fill({ date: '', fullDate: null });

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push({ date: day, fullDate: new Date(year, month, day) });
      if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push({ date: '', fullDate: null });
      weeks.push(currentWeek);
    }
    this.calendarWeeks = weeks;
  }

  updateMonthName() {
    this.currentMonthName = new Date(this.currentYear, this.currentMonth)
      .toLocaleString('default', { month: 'long' });
  }

  prevMonth() {
    if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear--; }
    else { this.currentMonth--; }
    this.updateMonthName();
    this.generateCalendar(this.currentYear, this.currentMonth);
  }

  nextMonth() {
    if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++; }
    else { this.currentMonth++; }
    this.updateMonthName();
    this.generateCalendar(this.currentYear, this.currentMonth);
  }

  /* ===== Auth ===== */
  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: ()  => this.router.navigate(['/login'])
    });
  }
}
