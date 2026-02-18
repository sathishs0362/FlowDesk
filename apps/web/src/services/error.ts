import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse, NormalizedApiError } from '../types/api';

const defaultError: NormalizedApiError = {
  status: 500,
  code: 'UNKNOWN_ERROR',
  message: 'Something went wrong',
};

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status ?? 500;
    const payload = axiosError.response?.data;

    return {
      status,
      code: payload?.error?.code ?? `HTTP_${status}`,
      message: payload?.message ?? axiosError.message ?? defaultError.message,
      details: payload?.error?.details,
    };
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return {
      ...defaultError,
      message: String((error as { message: unknown }).message),
    };
  }

  return defaultError;
};
