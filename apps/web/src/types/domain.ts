export type UserRole = 'admin' | 'manager' | 'employee';

export type TaskStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  projectId: string;
  assignedToId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  taskId: string;
  approvedById: string;
  status: 'approved' | 'rejected';
  comment: string | null;
  createdAt: string;
}
