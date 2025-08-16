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
  sidebarOpen = false;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedTask: Task | null = null;
  searchTerm = '';

  // Form control
  showAddTaskForm = false;
  newTask: Partial<Task> = { title: '', description: '', status: false, dueDate: '' };
  editTaskData: any = {};
  editMode = false;
  createError = '';
  editError = '';

  // Counters
  completedCount = 0;
  incompleteCount = 0;
  overdueCount = 0;
  dueSoonCount = 0;
  streakCount = 0;

  user = { displayName: '' };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.loadUserFromStorage();
    this.user.displayName =
    this.authService.currentUser?.name ||
    this.authService.currentUser?.username ||
    this.authService.currentUser?.displayName ||
    'User';

    this.getTasks();
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
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  goToProfile() {
   this.router.navigate(['/dashboard/profile']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToCalendar() {
    this.router.navigate(['/dashboard/calendar']);
  }

  getTasks() {
    this.taskService.getTasks().subscribe(res => {
      this.tasks = res;
      this.applySearchFilter();
      this.calculateTaskSummary();
      this.calculateStreak();
    });
  }

 selectedSortFilter: string = 'all'; // Add this at class level

applySearchFilter() {
  let tasks = [...this.tasks];

  // 1️⃣ Search term filtering (unchanged)
  if (this.searchTerm) {
    const term = this.searchTerm.toLowerCase();
    tasks = tasks.filter(task =>
      task.title.toLowerCase().includes(term) ||
      (task.description && task.description.toLowerCase().includes(term))
    );
  }

  // 2️⃣ Sort/Filter dropdown logic
  switch (this.selectedSortFilter) {
    case 'completed':
      tasks = tasks.filter(t => t.status);
      break;
    case 'incomplete':
      tasks = tasks.filter(t => !t.status);
      break;
    case 'overdue':
      tasks = tasks.filter(t => this.isOverdue(t.dueDate, t.status));
      break;
    case 'neartoduedate':
      tasks = tasks.filter(t => !t.status && this.isDueWithinTwoDays(t.dueDate, t.status));
      break;
    case 'all':
    default:
      // ✅ When showing ALL tasks — sort by color priority:
      // Red -> Orange -> Blue -> Green
      
      tasks.sort((a, b) => {
        const getPriority = (task: Task) => {
          if (this.isOverdue(task.dueDate, task.status)) return 1;           // Red
          if (!task.status && this.isDueWithinTwoDays(task.dueDate, task.status)) return 2; // Orange
          if (!task.status) return 3;                                        // Blue
          return 4;                                                          // Green
        };
        return getPriority(a) - getPriority(b);
      });
      break;
  }

  // 3️⃣ Save filtered list
  this.filteredTasks = tasks;
}



  showAddTaskFormToggle() {
    this.showAddTaskForm = !this.showAddTaskForm;
    if (this.showAddTaskForm) {
      this.editMode = false;
      this.selectedTask = null;
      this.createError = '';
      this.newTask = { title: '', description: '', status: false, dueDate: '' };
    }
  }
  toastMessage: string = '';
showToast: boolean = false;
showPopup(message: string) {
  this.toastMessage = message;
  this.showToast = true;
  setTimeout(() => {
    this.showToast = false;
  }, 5000); // Show for 5 seconds
}
  createTask() {
    this.createError = '';
    if (!this.newTask.title || !this.newTask.description || !this.newTask.dueDate) {
      this.createError = 'All fields are required.';
      return;
    }
    const due = new Date(this.newTask.dueDate as string);

    // Compare directly with the current moment
    if (due.getTime() <= Date.now()) {
      this.createError = 'Due date and time must be in the future.';
      return;
    }


    const now = new Date().toISOString();
    this.newTask.status = false;
    this.newTask.createdAt = now;
    this.newTask.updatedAt = now;
    this.newTask.completedAt = null; // new tasks start with no completion date

    this.taskService.addTask(this.newTask as Task).subscribe(task => {
      this.tasks.push(task);
      this.applySearchFilter();
      this.showAddTaskForm = false;
      this.calculateTaskSummary();
      this.calculateStreak();
    });
    this.showPopup('🎉 Great job! Task added.');
  }

  showTaskDetails(task: Task) {
    this.selectedTask = task;
    this.editMode = false;
    this.showAddTaskForm = false;
  }

  startEdit(task: Task) {
    this.editMode = true;
    this.editError = '';
    this.editTaskData = { ...task };

    if (task.dueDate) {
      const date = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      this.editTaskData.dueDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  }
  originalDueDate: string | Date = '';
  

 saveEdit() {
  this.editError = '';
  if (!this.editTaskData.title || !this.editTaskData.description || !this.editTaskData.dueDate) {
    this.editError = 'All fields are required.';
    return;
  }
  const due = new Date(this.editTaskData.dueDate as string);
  const now = new Date();
  if (due.getTime() <= now.getTime()) {
    this.editError = 'Due date and time must be in the future.';
    return;
  }
  this.editTaskData.updatedAt = new Date().toISOString();

  // Do comparison BEFORE the API call
  const oldDueDate = new Date(this.originalDueDate);
  const newDueDate = new Date(this.editTaskData.dueDate);

  this.taskService.updateTask(this.editTaskData.id!, this.editTaskData).subscribe(updated => {
    const idx = this.tasks.findIndex(t => t.id === updated.id);
    if (idx > -1) this.tasks[idx] = updated;
    this.applySearchFilter();
    this.selectedTask = updated;
    this.editMode = false;
    this.calculateTaskSummary();
    this.calculateStreak();

    // Show toast INSIDE subscribe, using stored comparison
    if (newDueDate > oldDueDate) {
      this.showPopup('⏳ Due date extended. Use it wisely!');
    } else {
      this.showPopup('✏️ Task updated! Keep moving forward.');
    }
  });
}


  cancelEdit() {
    this.editMode = false;
    this.editError = '';
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.applySearchFilter();
      if (this.selectedTask?.id === id) this.selectedTask = null;
      this.calculateTaskSummary();
      this.calculateStreak();
    });
    this.showPopup('🗑️ Task deleted. Stay focused!');
  }

  toggleComplete(task: Task) {
  const now = new Date().toISOString();

  let streakChange = 0;

  if (!task.status) {
    // Marking task COMPLETE: calculate streak increase for this task
    if (task.dueDate) {
      const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      const nowDate = new Date();

      const dueMid = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      const nowMid = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());

      const dayDiff = Math.floor((dueMid.getTime() - nowMid.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff > 0) {
        streakChange = dayDiff;
      }
    }
    this.showPopup('✅ Task completed! Well done.');
  } else {
    // Marking task INCOMPLETE: decrease streak based on previous completion streak for this task

    // If you track how many days early the task was completed (e.g. saved on task.completedAt),
    // recalculate the days early similar to above:

    if (task.completedAt && task.dueDate) {
      const completedDate = task.completedAt instanceof Date ? task.completedAt : new Date(task.completedAt);
      const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);

      const dueMid = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      const completedMid = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate());

      const dayDiff = Math.floor((dueMid.getTime() - completedMid.getTime()) / (1000 * 60 * 60 * 24));
    
      // Only decrease if completed early
      if (dayDiff > 0) {
        streakChange = -dayDiff;
      }
    }
    
    this.showPopup('🔄 Task marked incomplete. Keep it up!');
  }

  const updatedTask: Task = {
    ...task,
    status: !task.status,
    completedAt: !task.status ? now : null,
    updatedAt: now
  };

  this.taskService.updateTask(task.id!, updatedTask).subscribe(updated => {
    // Update task list
    const idx = this.tasks.findIndex(t => t.id === updated.id);
    if (idx > -1) this.tasks[idx] = updated;

    this.applySearchFilter();
    this.selectedTask = updated;
    this.calculateTaskSummary();
      this.calculateStreak();

    // Update streak count adding or subtracting streakChange
    this.streakCount = Math.max(0, this.streakCount + streakChange);
  });
}




  calculateTaskSummary() {
    const total = this.tasks.length || 1;
    this.completedCount = this.tasks.filter(t => t.status).length;
    this.incompleteCount = total - this.completedCount;
    this.overdueCount = this.tasks.filter(
      t => this.isOverdue(t.dueDate, t.status)
    ).length;
    this.dueSoonCount = this.tasks.filter(
      t => !t.status && this.isDueWithinTwoDays(t.dueDate, t.status)
    ).length;
  }

calculateStreak() {
  // In this logic, streak is the count of tasks marked as completed
  // You can change this to other logic if needed
  const completedTasksCount = this.tasks.filter(task => task.status).length;

  // Or if you want streak to be capped or an absolute count, just assign:
  this.streakCount = completedTasksCount;
}


  isDueWithinTwoDays(dateVal?: string | Date, done?: boolean): boolean {
  if (!dateVal || done) return false;
  const date = dateVal instanceof Date ? dateVal : new Date(dateVal);

  // ✅ Exclude overdue tasks
  if (date.getTime() < Date.now()) return false;

  const diffDays = Math.ceil(
    (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return diffDays <= 2 && diffDays >= 0; // due today or within 2 days
}


  isOverdue(dateVal?: string | Date, done?: boolean): boolean {
    if (!dateVal) return false;
    const date = dateVal instanceof Date ? dateVal : new Date(dateVal);
    return !done && date.getTime() < Date.now();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
