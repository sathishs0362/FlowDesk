import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../features/auth/auth.slice';
import { useAuth } from '../hooks/auth';
import { Button } from '../components/ui/Button';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import type { Permission } from '../types/domain';
import { usePermission } from '../hooks/usePermission';

const navItems: Array<{ label: string; to: string; icon: string; permission?: Permission }> = [
  { label: 'Overview', to: '/dashboard/overview', icon: 'OV' },
  { label: 'Projects', to: '/dashboard/projects', icon: 'PR', permission: 'create_project' },
  { label: 'Tasks', to: '/dashboard/tasks', icon: 'TS', permission: 'assign_task' },
  { label: 'Kanban', to: '/dashboard/kanban', icon: 'KB' },
];
const DESKTOP_NAV_KEY = 'flowdesk_desktop_nav_collapsed';

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user } = useAuth();
  const { can } = usePermission();
  const [mobileNavState, setMobileNavState] = useState({
    open: false,
    path: '',
  });
  const [desktopCollapsed, setDesktopCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(DESKTOP_NAV_KEY) === '1';
  });
  const projectPresenceCount = useAppSelector(
    (state) => Object.values(state.presence.projectViewers).flat().length,
  );
  const visibleNavItems = useMemo(
    () => navItems.filter((item) => (item.permission ? can(item.permission) : true)),
    [can],
  );
  const mobileNavOpen = mobileNavState.open && mobileNavState.path === location.pathname;
  const closeMobileNav = () =>
    setMobileNavState({
      open: false,
      path: location.pathname,
    });
  const toggleMobileNav = () =>
    setMobileNavState((current) => ({
      open: !(current.open && current.path === location.pathname),
      path: location.pathname,
    }));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(DESKTOP_NAV_KEY, desktopCollapsed ? '1' : '0');
  }, [desktopCollapsed]);

  return (
    <div className={`dashboard-shell ${desktopCollapsed ? 'desktop-collapsed' : ''}`}>
      <aside className={`sidebar ${mobileNavOpen ? 'open' : ''} ${desktopCollapsed ? 'collapsed' : ''}`}>
        <h1 className="brand">{desktopCollapsed ? 'FD' : 'FlowDesk'}</h1>
        <nav className="sidebar-nav">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title={desktopCollapsed ? item.label : undefined}
              onClick={closeMobileNav}
            >
              <span className="nav-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      {mobileNavOpen ? <button className="sidebar-overlay" type="button" aria-label="Close menu" onClick={closeMobileNav} /> : null}

      <section className="dashboard-main">
        <header className="topbar">
          <div className="topbar-user">
            <button
              className="menu-toggle"
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileNavOpen}
              onClick={toggleMobileNav}
            >
              <span />
              <span />
              <span />
            </button>
            <div>
              <strong>{user?.name}</strong>
              <p className="muted">Role: {user?.role}</p>
            </div>
          </div>
          <div className="topbar-center">
            <Breadcrumbs />
            <p className="muted">Active viewers: {projectPresenceCount}</p>
          </div>
          <div className="topbar-actions">
            <button
              className="desktop-collapse-toggle"
              type="button"
              onClick={() => setDesktopCollapsed((current) => !current)}
            >
              {desktopCollapsed ? 'Expand Nav' : 'Collapse Nav'}
            </button>
            <Button variant="secondary" onClick={() => dispatch(logout())}>
              Logout
            </Button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </section>
    </div>
  );
};
