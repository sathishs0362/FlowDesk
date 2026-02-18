import { combineReducers } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { authReducer } from '../features/auth/auth.slice';
import { uiReducer } from './ui.slice';
import { workspaceReducer } from './workspace.slice';
import { featureFlagsReducer } from './featureFlags.slice';
import { presenceReducer } from './presence.slice';

export const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  ui: uiReducer,
  workspace: workspaceReducer,
  featureFlags: featureFlagsReducer,
  presence: presenceReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
