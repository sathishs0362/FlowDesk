import { useAuth } from '../../../hooks/auth';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { TaskCreateForm } from '../components/TaskCreateForm';
import { useGetTasksQuery } from '../tasks.api';

export const TasksPage = () => {
  const { role } = useAuth();
  const { data: tasks = [], isLoading } = useGetTasksQuery();

  return (
    <section className="page-grid">
      <div className="card">
        <div className="page-heading">
          <h2 className="page-title">Tasks</h2>
          <p className="muted">Monitor ownership and workflow progress.</p>
        </div>
        {isLoading ? (
          <p>Loading tasks...</p>
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
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>
                    <StatusBadge status={task.status} />
                  </td>
                  <td>{task.projectId.slice(0, 8)}</td>
                  <td>{task.assignedToId.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(role === 'admin' || role === 'manager') && <TaskCreateForm />}
    </section>
  );
};
