export interface Task {
  id?: number;
  title: string;
  description?: string;
  status?: boolean; // <-- now boolean
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}


export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: string;
  dueDate?: string;
}
