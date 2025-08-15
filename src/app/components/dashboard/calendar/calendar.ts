import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { Task } from '../../../models/task.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarComponent implements OnInit {

  /** Sidebar / Header **/
  sidebarOpen = false;
  user = { displayName: '' };

  /** Calendar Data **/
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  calendarWeeks: any[] = [];
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  currentMonthName = '';

  /** Task Data **/
  tasks: Task[] = [];
  selectedDate: Date | null = null;
  tasksForSelectedDate: Task[] = [];

  /** Date Field Selector **/
  selectedDateField: 'dueDate' | 'createdAt' | 'updatedAt' = 'dueDate';

  /** Edit State **/
  editingTask: Task | null = null;
  editMode = false;
  editError = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.authService.loadUserFromStorage();
    this.user.displayName =
      this.authService.currentUser?.name ||
      this.authService.currentUser?.username ||
      this.authService.currentUser?.displayName ||
      'User';

    this.loadTasks();
    this.updateMonthName();
    this.generateCalendar(this.currentYear, this.currentMonth);
    this.updateDateTime();
  setInterval(() => this.updateDateTime(), 1000);
  }
  currentDateTime: string = '';
  updateDateTime() {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long', // e.g. Monday
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false  // 24-hour time format
  };
  this.currentDateTime = now.toLocaleString('en-US', options);
}
  /** Sidebar Navigation **/
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  goToProfile() { this.router.navigate(['/dashboard/profile']); }
  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToCalendar() { this.router.navigate(['/dashboard/calendar']); }
  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  /** Load & Filter Tasks **/
  loadTasks() {
    this.taskService.getTasks().subscribe(t => {
      this.tasks = t;
      this.filterTasksByDate(this.selectedDate);
      this.generateCalendar(this.currentYear, this.currentMonth);
    });
  }

  /** Single day filter for right pane */
  filterTasksByDate(date: Date | null) {
    if (!date) {
      this.tasksForSelectedDate = [];
      return;
    }
    const selectedTime = new Date(date).setHours(0, 0, 0, 0);
    this.tasksForSelectedDate = this.tasks.filter(task => {
      const fieldValue = task[this.selectedDateField];
      if (!fieldValue) return false;
      const taskTime = new Date(fieldValue as string | Date).setHours(0, 0, 0, 0);
      return taskTime === selectedTime;
    });
  }

  /** Date Field Dropdown change handler */
  onDateFieldChange() {
    // Refresh both grid highlights and right pane
    this.generateCalendar(this.currentYear, this.currentMonth);
    this.filterTasksByDate(this.selectedDate);
  }

  /** Calendar month grid */
  generateCalendar(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: any[] = [];
    let currentWeek: any[] = new Array(firstDay).fill({ date: '', fullDate: null });
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push({ date: day, fullDate: new Date(year, month, day) });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
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
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.updateMonthName();
    this.generateCalendar(this.currentYear, this.currentMonth);
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.updateMonthName();
    this.generateCalendar(this.currentYear, this.currentMonth);
  }

  onSelectDate(day: any) {
    if (day.fullDate) {
      this.selectedDate = day.fullDate;
      this.filterTasksByDate(this.selectedDate);
    }
  }

  /** Day cell coloring (uses dynamic field!) */
  getDayColorClass(day: any): string {
    if (!day.fullDate) return '';
    const dayTime = new Date(day.fullDate).setHours(0, 0, 0, 0);

    const tasksForDay = this.tasks.filter(task => {
      const fieldValue = task[this.selectedDateField];
      if (!fieldValue) return false;
      return new Date(fieldValue as string | Date).setHours(0, 0, 0, 0) === dayTime;
    });

    if (tasksForDay.length === 0) return '';

    // Only for dueDate mode, use overdue/soon/red/orange coloring
    if (this.selectedDateField === 'dueDate') {
      if (tasksForDay.some(t => this.isOverdue(t.dueDate, t.status))) return 'red-day';
      if (tasksForDay.some(t => !t.status && this.isDueSoon(t.dueDate))) return 'orange-day';
      if (tasksForDay.some(t => !t.status)) return 'blue-day';
      return 'green-day';
    }

    // For createdAt/updatedAt, highlight as blue if any incomplete, green if all complete
    if (tasksForDay.some(t => !t.status)) return 'blue-day';
    else return 'green-day';
  }

  /** Card color top-border (right pane) */
  getTaskColorClass(task: Task): string {
    if (this.selectedDateField === 'dueDate') {
      if (task.status) return 'green-top';
      if (this.isOverdue(task.dueDate, task.status)) return 'red-top';
      if (this.isDueSoon(task.dueDate) && !task.status) return 'orange-top';
    }
    if (!task.status) return 'blue-top';
    return 'green-top';
  }

  /** Helpers */
  isDueSoon(dateVal?: string | Date): boolean {
    if (!dateVal) return false;
    const date = dateVal instanceof Date ? dateVal : new Date(dateVal);
    if (date.getTime() < Date.now()) return false; // exclude overdue
    const diffMs = date.getTime() - Date.now();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 2;
  }

  isOverdue(dateVal?: string | Date, done?: boolean): boolean {
    if (!dateVal) return false;
    const date = dateVal instanceof Date ? dateVal : new Date(dateVal);
    return !done && date.getTime() < Date.now();
  }

  /** CRUD Ops */
  startEdit(task: Task) {
    this.editingTask = { ...task };
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      this.editingTask.dueDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    this.editMode = true;
    this.editError = '';
  }

  saveEdit() {
    this.editError = '';
    if (!this.editingTask?.title || !this.editingTask.description || !this.editingTask.dueDate) {
      this.editError = 'All fields are required.';
      return;
    }
    const due = new Date(this.editingTask.dueDate as string);
    const now = new Date();
    if (due.getTime() <= now.getTime()) {
      this.editError = 'Due date and time must be in the future.';
      return;
    }
    this.taskService.updateTask(this.editingTask.id!, this.editingTask).subscribe({
      next: updated => {
        const idx = this.tasks.findIndex(t => t.id === updated.id);
        if (idx > -1) this.tasks[idx] = updated;
        this.filterTasksByDate(this.selectedDate);
        this.editMode = false;
        this.editingTask = null;
      },
      error: () => {
        this.editError = 'Failed to update task.';
      }
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.editingTask = null;
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.filterTasksByDate(this.selectedDate);
    });
  }

  toggleComplete(task: Task) {
    const now = new Date().toISOString();
    const updatedTask: Task = {
      ...task,
      status: !task.status,
      completedAt: !task.status ? now : null,
      updatedAt: now
    };
    this.taskService.updateTask(task.id!, updatedTask).subscribe(updated => {
      const idx = this.tasks.findIndex(t => t.id === updated.id);
      if (idx > -1) this.tasks[idx] = updated;
      this.filterTasksByDate(this.selectedDate);
    });
  }
}
