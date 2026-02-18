export type UserRole = 'admin' | 'manager' | 'employee';
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';
export type Permission =
  | 'create_project'
  | 'assign_task'
  | 'approve_task'
  | 'comment_task'
  | 'manage_users';

export type TaskStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
}

export interface WorkspaceMembership {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  permissions: Permission[];
}

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
  workspaceId?: string;
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
  orderIndex?: number;
  priority?: TaskPriority;
  dueDate?: string | null;
  blockedByTaskIds?: string[];
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
