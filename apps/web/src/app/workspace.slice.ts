import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Workspace, WorkspaceMembership } from '../types/domain';

interface WorkspaceState {
  currentWorkspaceId: string | null;
  workspaces: Workspace[];
  memberships: WorkspaceMembership[];
}

const WORKSPACE_KEY = 'flowdesk_workspace_id';

const defaultWorkspaces: Workspace[] = [
  { id: 'ws-default', name: 'Default Workspace', slug: 'default' },
  { id: 'ws-ops', name: 'Operations Workspace', slug: 'operations' },
];

const initialState: WorkspaceState = {
  currentWorkspaceId:
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(WORKSPACE_KEY) ?? defaultWorkspaces[0]?.id ?? null
      : defaultWorkspaces[0]?.id ?? null,
  workspaces: defaultWorkspaces,
  memberships: [],
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspace: (state, action: PayloadAction<string>) => {
      state.currentWorkspaceId = action.payload;
      localStorage.setItem(WORKSPACE_KEY, action.payload);
    },
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      state.workspaces = action.payload;
      if (!state.currentWorkspaceId && action.payload.length > 0) {
        state.currentWorkspaceId = action.payload[0].id;
      }
    },
    setMemberships: (state, action: PayloadAction<WorkspaceMembership[]>) => {
      state.memberships = action.payload;
    },
  },
});

export const { setWorkspace, setWorkspaces, setMemberships } = workspaceSlice.actions;
export const workspaceReducer = workspaceSlice.reducer;
