import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';
import { addToast } from './ui.slice';
import type { NormalizedApiError } from '../types/api';
import { toUserErrorMessage } from '../services/errorMessages';

export const rtkQueryErrorMiddleware: Middleware = ({ dispatch }) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as NormalizedApiError | undefined;

    if (payload?.message) {
      dispatch(
        addToast({
          type: 'error',
          message: toUserErrorMessage(payload),
        }),
      );
    }
  }

  return next(action);
};
