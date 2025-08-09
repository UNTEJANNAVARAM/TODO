export interface Task {
  id?: number;
  title: string;
  description?: string;
  status?: boolean;
  dueDate?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: boolean;
  dueDate?: string;
}