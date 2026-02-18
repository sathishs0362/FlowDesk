import { StatusBadge } from '../../../components/ui/StatusBadge';
import { TaskCreateForm } from '../components/TaskCreateForm';
import { useTasks } from '../hooks/useTasks';
import { KANBAN_COLUMNS } from '../../kanban/utils/transitions';
import { useGetProjectsQuery } from '../../projects/projects.api';
import { useGetUsersQuery } from '../../../services/users.api';
import { AccessGuard } from '../../../components/security/AccessGuard';
import { useWorkspace } from '../../../hooks/useWorkspace';

export const TasksPage = () => {
  const { currentWorkspaceId } = useWorkspace();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { tasks, meta, page, filters, updateFilters, clearFilters, nextPage, prevPage, isLoading, isFetching } =
    useTasks({ limit: 15 });
  const employees = users.filter((user) => user.role === 'employee');
  const workspaceProjectIds = new Set(
    projects
      .filter((project) => !project.workspaceId || project.workspaceId === currentWorkspaceId)
      .map((project) => project.id),
  );
  const filteredProjects = projects.filter((project) => workspaceProjectIds.has(project.id));
  const visibleTasks = tasks.filter((task) => workspaceProjectIds.has(task.projectId));
  const projectNamesById = Object.fromEntries(
    filteredProjects.map((project) => [project.id, project.name]),
  );
  const userNamesById = Object.fromEntries(users.map((user) => [user.id, user.name]));
  const activeFilterCount = [filters.search, filters.projectId, filters.assignedToId, filters.status].filter(Boolean).length;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  return (
    <section className="page-grid">
      <div className="card">
        <div className="page-heading page-heading-inline">
          <div>
            <h2 className="page-title">Tasks</h2>
            <p className="muted">Monitor ownership and workflow progress.</p>
          </div>
          <div className="summary-chip-row">
            <span className="summary-chip">Results: {visibleTasks.length}</span>
            <span className="summary-chip">Filters: {activeFilterCount}</span>
          </div>
        </div>
        <div className="tasks-filters tasks-filters-compact">
          <input
            className="input"
            placeholder="Search by task title"
            value={filters.search ?? ''}
            onChange={(event) => updateFilters({ ...filters, search: event.target.value || undefined })}
          />
          <select
            className="input"
            value={filters.projectId ?? ''}
            onChange={(event) => updateFilters({ ...filters, projectId: event.target.value || undefined })}
          >
            <option value="">All projects</option>
            {filteredProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={filters.assignedToId ?? ''}
            onChange={(event) => updateFilters({ ...filters, assignedToId: event.target.value || undefined })}
          >
            <option value="">All assignees</option>
            {employees.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={filters.status ?? ''}
            onChange={(event) => updateFilters({ ...filters, status: (event.target.value || undefined) as typeof filters.status })}
          >
            <option value="">All statuses</option>
            {KANBAN_COLUMNS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary filter-clear-btn" type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
        {isLoading ? (
          <div className="skeleton-table" />
        ) : visibleTasks.length === 0 ? (
          <p className="empty-state">
            {(filters.search || filters.projectId || filters.assignedToId || filters.status)
              ? 'No tasks match your current filters.'
              : 'No tasks created yet.'}
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Project</th>
                <th>Assignee</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>
                    <StatusBadge status={task.status} />
                  </td>
                  <td>{projectNamesById[task.projectId] ?? task.projectId.slice(0, 8)}</td>
                  <td>{userNamesById[task.assignedToId] ?? task.assignedToId.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination-row">
          <button className="btn btn-secondary" type="button" onClick={prevPage} disabled={page <= 1 || isFetching}>
            Previous
          </button>
          <p className="muted">
            Page {meta?.page ?? page} of {totalPages}
          </p>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={nextPage}
            disabled={Boolean(meta && !meta.hasMore) || isFetching}
          >
            Next
          </button>
        </div>
      </div>

      <AccessGuard permission="assign_task">
        <TaskCreateForm />
      </AccessGuard>
    </section>
  );
};
