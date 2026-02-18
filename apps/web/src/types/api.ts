export interface ApiSuccessResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  error?: {
    code?: string;
    details?: unknown;
  };
}

export interface NormalizedApiError {
  status: number;
  message: string;
  code: string;
  details?: unknown;
}
