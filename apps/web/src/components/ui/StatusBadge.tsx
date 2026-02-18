import type { TaskStatus } from '../../types/domain';

interface StatusBadgeProps {
  status: TaskStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
};
