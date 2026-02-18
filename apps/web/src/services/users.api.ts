import { api } from './api';
import type { ApiSuccessResponse } from '../types/api';
import type { User } from '../types/domain';

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({
        url: '/users',
        method: 'GET',
      }),
      transformResponse: (response: ApiSuccessResponse<User[]>) => response.data,
      providesTags: ['Users'],
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;
