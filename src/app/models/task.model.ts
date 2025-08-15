export interface Task {
  id?: number;
  title: string;
  description: string;
  dueDate?: string | Date;
  status: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  completedAt?: string | Date | null;  // Add this property to fix the errors
}


export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: string;
  dueDate?: string;
}
