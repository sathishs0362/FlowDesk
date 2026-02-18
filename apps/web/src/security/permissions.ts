import type { Permission, UserRole } from '../types/domain';

export const rolePermissionMatrix: Record<UserRole, Permission[]> = {
  admin: ['create_project', 'assign_task', 'approve_task', 'comment_task', 'manage_users'],
  manager: ['create_project', 'assign_task', 'approve_task', 'comment_task'],
  employee: ['comment_task'],
};

export const hasPermission = (
  role: UserRole | undefined,
  permission: Permission,
  scopedPermissions?: Permission[],
): boolean => {
  if (!role) {
    return false;
  }

  if (scopedPermissions && scopedPermissions.length > 0) {
    return scopedPermissions.includes(permission);
  }

  return rolePermissionMatrix[role].includes(permission);
};
