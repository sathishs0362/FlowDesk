import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { rootReducer } from './rootReducer';
import { rtkQueryErrorMiddleware } from './rtkQueryErrorMiddleware';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, rtkQueryErrorMiddleware),
});

export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<AppStore['getState']>;
