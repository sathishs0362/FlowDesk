import { api } from '../../services/api';
import type { ApiSuccessResponse } from '../../types/api';
import type { User } from '../../types/domain';
import { setCredentials } from './auth.slice';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: User['role'];
}

interface AuthPayload {
  user: User;
  accessToken: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthPayload, LoginRequest>({
      query: (payload) => ({
        url: '/auth/login',
        method: 'POST',
        data: payload,
      }),
      transformResponse: (response: ApiSuccessResponse<AuthPayload>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ token: data.accessToken, user: data.user }));
      },
    }),
    register: builder.mutation<AuthPayload, RegisterRequest>({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        data: payload,
      }),
      transformResponse: (response: ApiSuccessResponse<AuthPayload>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ token: data.accessToken, user: data.user }));
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
