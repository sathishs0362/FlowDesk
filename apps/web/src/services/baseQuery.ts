import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './axios';
import type { NormalizedApiError } from '../types/api';
import { normalizeApiError } from './error';

interface AxiosBaseQueryArgs {
  url: string;
  method: AxiosRequestConfig['method'];
  data?: unknown;
  params?: unknown;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (status: number, attempt: number): boolean => {
  if (attempt >= 3) {
    return false;
  }

  return status === 0 || status >= 500;
};

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, NormalizedApiError> =>
  async ({ url, method, data, params }) => {
    if (!navigator.onLine && method && method.toUpperCase() !== 'GET') {
      return {
        error: {
          status: 0,
          code: 'OFFLINE',
          message: 'You are offline. Change queued until connection is restored.',
        },
      };
    }

    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        const result = await apiClient.request({ url, method, data, params });
        return { data: result.data };
      } catch (error: unknown) {
        const normalized = normalizeApiError(error);
        if (!shouldRetry(normalized.status, attempt)) {
          return { error: normalized };
        }

        await sleep(200 * 2 ** attempt);
      }
    }

    return {
      error: {
        status: 500,
        code: 'RETRY_EXHAUSTED',
        message: 'Request failed after retries',
      },
    };
  };
