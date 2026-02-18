import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useCreateProjectMutation } from '../projects.api';

export const ProjectCreateForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createProject({
      name,
      description: description || undefined,
    }).unwrap();
    setName('');
    setDescription('');
  };

  return (
    <form className="card grid-form" onSubmit={onSubmit}>
      <div className="page-heading">
        <h3 className="page-title">Create Project</h3>
        <p className="muted">Start a new workspace for your team.</p>
      </div>
      <Input label="Project Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  );
};
