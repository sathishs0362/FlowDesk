import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/domain';
import { authStorage } from './auth.storage';

export interface AuthState {
  token: string | null;
  user: User | null;
}

const parseStoredUser = (): User | null => {
  const raw = authStorage.getUserJson();
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  token: authStorage.getToken(),
  user: parseStoredUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      authStorage.setAuth(action.payload.token, JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      authStorage.clear();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
