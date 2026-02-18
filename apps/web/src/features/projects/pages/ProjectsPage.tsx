import { ProjectCreateForm } from '../components/ProjectCreateForm';
import { useGetProjectsQuery } from '../projects.api';
import { AccessGuard } from '../../../components/security/AccessGuard';
import { useWorkspace } from '../../../hooks/useWorkspace';

export const ProjectsPage = () => {
  const { currentWorkspaceId } = useWorkspace();
  const { data: allProjects = [], isLoading } = useGetProjectsQuery();
  const projects = allProjects.filter(
    (project) => !project.workspaceId || project.workspaceId === currentWorkspaceId,
  );

  return (
    <section className="page-grid">
      <div className="card">
        <div className="page-heading">
          <h2 className="page-title">Projects</h2>
          <p className="muted">Track active initiatives and their purpose.</p>
        </div>
        {isLoading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="empty-state">No projects yet. Create your first project to get started.</p>
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

      <AccessGuard permission="create_project">
        <ProjectCreateForm />
      </AccessGuard>
    </section>
  );
};
