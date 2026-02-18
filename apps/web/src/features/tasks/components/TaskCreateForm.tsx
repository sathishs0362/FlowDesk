import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useGetProjectsQuery } from '../../projects/projects.api';
import { useGetUsersQuery } from '../../../services/users.api';
import { useCreateTaskMutation } from '../tasks.api';

export const TaskCreateForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();

  const employeeOptions = useMemo(
    () => users.filter((user) => user.role === 'employee'),
    [users],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await createTask({
      title,
      description: description || undefined,
      projectId,
      assignedToId,
    }).unwrap();

    setTitle('');
    setDescription('');
    setProjectId('');
    setAssignedToId('');
  };

  return (
    <form className="card grid-form" onSubmit={onSubmit}>
      <div className="page-heading">
        <h3 className="page-title">Create Task</h3>
        <p className="muted">Assign work and keep delivery moving.</p>
      </div>
      <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      <Input
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <label className="field">
        <span className="field-label">Project</span>
        <select
          className="input"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          required
        >
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">Assign To</span>
        <select
          className="input"
          value={assignedToId}
          onChange={(event) => setAssignedToId(event.target.value)}
          required
        >
          <option value="">Select employee</option>
          {employeeOptions.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Task'}
      </Button>
    </form>
  );
};
