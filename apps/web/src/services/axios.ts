import axios from 'axios';
import { logout } from '../features/auth/auth.slice';
import { authStorage } from '../features/auth/auth.storage';
import { addToast } from '../app/ui.slice';
import type { AppStore } from '../app/store';
import { normalizeApiError } from './error';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  timeout: 15000,
});

let interceptorsInitialized = false;

export const setupAxiosInterceptors = (store: AppStore): void => {
  if (interceptorsInitialized) {
    return;
  }

  apiClient.interceptors.request.use((config) => {
    const token = store.getState().auth.token ?? authStorage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const normalized = normalizeApiError(error);

      if (normalized.status === 401) {
        store.dispatch(logout());
      }

      if (normalized.message) {
        store.dispatch(addToast({ type: 'error', message: normalized.message }));
      }

      return Promise.reject(normalized);
    },
  );

  interceptorsInitialized = true;
};
