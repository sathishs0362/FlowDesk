import type { PropsWithChildren, ReactNode } from 'react';
import type { Permission } from '../../types/domain';
import { usePermission } from '../../hooks/usePermission';

interface AccessGuardProps {
  permission: Permission;
  fallback?: ReactNode;
}

export const AccessGuard = ({
  permission,
  fallback = null,
  children,
}: PropsWithChildren<AccessGuardProps>) => {
  const { can } = usePermission();
  return can(permission) ? children : fallback;
};
