import { useMemo } from 'react';
import type { Permission } from '../types/domain';
import { useAuth } from './auth';
import { hasPermission } from '../security/permissions';
import { useWorkspace } from './useWorkspace';

export const usePermission = () => {
  const { role } = useAuth();
  const { currentMembership } = useWorkspace();

  return useMemo(() => {
    return {
      can: (permission: Permission) =>
        hasPermission(role, permission, currentMembership?.permissions),
    };
  }, [currentMembership?.permissions, role]);
};
