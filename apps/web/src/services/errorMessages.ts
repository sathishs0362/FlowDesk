import type { NormalizedApiError } from '../types/api';

const errorCodeMap: Record<string, string> = {
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  INVALID_TOKEN: 'Your session is invalid. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  FORBIDDEN_SUBMIT: 'Only the assigned employee can submit this task.',
  FORBIDDEN_REVIEW: 'Only managers or admins can review this task.',
  FORBIDDEN_IN_PROGRESS: 'Only the assigned employee can start this task.',
  REVIEW_COMMENT_REQUIRED: 'A review comment is required for approve/reject actions.',
  TASK_NOT_FOUND: 'The task could not be found.',
  PROJECT_NOT_FOUND: 'The project could not be found.',
  USER_NOT_FOUND: 'The user could not be found.',
  EMAIL_ALREADY_EXISTS: 'This email is already in use.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  INVALID_STATUS_TRANSITION: 'This status transition is not allowed.',
  TASK_IMMUTABLE: 'Approved tasks cannot be changed.',
  ROUTE_NOT_FOUND: 'Requested endpoint is unavailable.',
  OFFLINE: 'You are offline. The action will be retried when network is back.',
  RETRY_EXHAUSTED: 'Request failed after multiple retries.',
};

export const toUserErrorMessage = (error: NormalizedApiError): string => {
  return errorCodeMap[error.code] ?? error.message ?? 'Something went wrong. Please try again.';
};
