import { api } from '../../services/api';
import type { ApiSuccessResponse } from '../../types/api';
import type { Project } from '../../types/domain';

interface CreateProjectRequest {
  name: string;
  description?: string;
}

export const projectsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => ({
        url: '/projects',
        method: 'GET',
      }),
      transformResponse: (response: ApiSuccessResponse<Project[]>) => response.data,
      providesTags: ['Projects'],
    }),
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (payload) => ({
        url: '/projects',
        method: 'POST',
        data: payload,
      }),
      transformResponse: (response: ApiSuccessResponse<Project>) => response.data,
      invalidatesTags: ['Projects'],
    }),
  }),
});

export const { useGetProjectsQuery, useCreateProjectMutation } = projectsApi;
