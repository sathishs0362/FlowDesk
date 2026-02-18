import axios from 'axios';
import { logout } from '../features/auth/auth.slice';
import { authStorage } from '../features/auth/auth.storage';
import type { AppStore } from '../app/store';
import { normalizeApiError } from './error';
import { env } from '../config/env';
import { logger } from './logger';

export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 15000,
});

let interceptorsInitialized = false;

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number };
    if (!payload.exp) {
      return false;
    }

    return payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};

export const setupAxiosInterceptors = (store: AppStore): void => {
  if (interceptorsInitialized) {
    return;
  }

  apiClient.interceptors.request.use((config) => {
    const token = store.getState().auth.token ?? authStorage.getToken();

    if (token && isTokenExpired(token)) {
      store.dispatch(logout());
      return Promise.reject({
        status: 401,
        code: 'INVALID_TOKEN',
        message: 'Session expired',
      });
    }

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

      logger.warn('API request failed', normalized);
      return Promise.reject(normalized);
    },
  );

  interceptorsInitialized = true;
};
