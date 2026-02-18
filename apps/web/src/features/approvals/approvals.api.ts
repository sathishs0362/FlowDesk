import { api } from '../../services/api';
import type { ApiSuccessResponse } from '../../types/api';
import type { Approval } from '../../types/domain';

export const approvalsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getApprovalsByTaskId: builder.query<Approval[], string>({
      query: (taskId) => ({
        url: `/approvals/task/${taskId}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiSuccessResponse<Approval[]>) => response.data,
      providesTags: ['Approvals'],
    }),
  }),
});

export const { useGetApprovalsByTaskIdQuery } = approvalsApi;
