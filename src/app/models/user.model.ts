export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string | Date;  // accept ISO string or Date
  updatedAt: string | Date;
}
