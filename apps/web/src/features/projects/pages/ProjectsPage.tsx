import { ProjectCreateForm } from '../components/ProjectCreateForm';
import { useGetProjectsQuery } from '../projects.api';
import { useAuth } from '../../../hooks/auth';

export const ProjectsPage = () => {
  const { role } = useAuth();
  const { data: projects = [], isLoading } = useGetProjectsQuery();

  return (
    <section className="page-grid">
      <div className="card">
        <div className="page-heading">
          <h2 className="page-title">Projects</h2>
          <p className="muted">Track active initiatives and their purpose.</p>
        </div>
        {isLoading ? (
          <p>Loading projects...</p>
        ) : (
          <ul className="list">
            {projects.map((project) => (
              <li key={project.id} className="list-item">
                <p className="list-title">{project.name}</p>
                <p className="muted">{project.description || 'No description'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(role === 'admin' || role === 'manager') && <ProjectCreateForm />}
    </section>
  );
};
