import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { setMemberships, setWorkspace } from '../app/workspace.slice';
import { useAuth } from './auth';
import { rolePermissionMatrix } from '../security/permissions';

export const useWorkspace = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { currentWorkspaceId, workspaces, memberships } = useAppSelector((state) => state.workspace);

  useEffect(() => {
    if (!user) {
      dispatch(setMemberships([]));
      return;
    }

    dispatch(
      setMemberships(
        workspaces.map((workspace) => ({
          workspaceId: workspace.id,
          userId: user.id,
          role: user.role === 'admin' ? 'owner' : user.role === 'manager' ? 'admin' : 'member',
          permissions: rolePermissionMatrix[user.role],
        })),
      ),
    );
  }, [dispatch, user, workspaces]);

  const currentWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === currentWorkspaceId) ?? null,
    [currentWorkspaceId, workspaces],
  );

  const currentMembership = useMemo(
    () =>
      memberships.find(
        (membership) =>
          membership.workspaceId === currentWorkspaceId && membership.userId === user?.id,
      ) ?? null,
    [currentWorkspaceId, memberships, user?.id],
  );

  return {
    currentWorkspaceId,
    currentWorkspace,
    workspaces,
    currentMembership,
    switchWorkspace: (workspaceId: string) => dispatch(setWorkspace(workspaceId)),
  };
};
