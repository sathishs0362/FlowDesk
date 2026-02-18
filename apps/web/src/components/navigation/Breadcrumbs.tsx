import { Link, useLocation } from 'react-router-dom';

const titleize = (segment: string): string =>
  segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/dashboard/overview">Dashboard</Link>
      {segments.slice(1).map((segment, index) => {
        const to = `/${segments.slice(0, index + 2).join('/')}`;
        return (
          <span key={to}>
            <span className="crumb-sep">/</span>
            <Link to={to}>{titleize(segment)}</Link>
          </span>
        );
      })}
    </nav>
  );
};
