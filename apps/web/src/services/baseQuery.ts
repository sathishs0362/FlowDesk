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

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, NormalizedApiError> =>
  async ({ url, method, data, params }, _api) => {
    try {
      const result = await apiClient.request({ url, method, data, params });
      return { data: result.data };
    } catch (error: unknown) {
      const normalized = normalizeApiError(error);
      return { error: normalized };
    }
  };
