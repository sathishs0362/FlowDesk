import { NavLink, Outlet } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { logout } from '../features/auth/auth.slice';
import { useAuth } from '../hooks/auth';
import { Button } from '../components/ui/Button';

const navItems = [
  { label: 'Projects', to: '/dashboard/projects' },
  { label: 'Tasks', to: '/dashboard/tasks' },
  { label: 'Kanban', to: '/dashboard/kanban' },
];

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <h1 className="brand">FlowDesk</h1>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="topbar">
          <div>
            <strong>{user?.name}</strong>
            <p className="muted">Role: {user?.role}</p>
          </div>
          <Button variant="secondary" onClick={() => dispatch(logout())}>
            Logout
          </Button>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </section>
    </div>
  );
};
