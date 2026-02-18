export interface ApiSuccessResponse<TData, TMeta = unknown> {
  success: boolean;
  message: string;
  data: TData;
  meta?: TMeta;
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
