import { combineReducers } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { authReducer } from '../features/auth/auth.slice';
import { uiReducer } from './ui.slice';

export const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
