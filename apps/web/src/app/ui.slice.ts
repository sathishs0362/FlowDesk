import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
}

interface UiState {
  toasts: Toast[];
}

const initialState: UiState = {
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'> & { id?: string }>) => {
      const id = action.payload.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
