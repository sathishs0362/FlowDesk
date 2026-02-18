import { useMemo, useState } from 'react';
import { useGetProjectsQuery } from '../../projects/projects.api';
import { useTasks } from '../../tasks/hooks/useTasks';
import { useAuth } from '../../../hooks/auth';
import { KANBAN_COLUMNS } from '../../kanban/utils/transitions';
import type { TaskStatus } from '../../../types/domain';
import { useWorkspace } from '../../../hooks/useWorkspace';

const SLA_HOURS = 72;
const STATUS_META: Record<TaskStatus, { label: string; toneClass: string }> = {
  DRAFT: { label: 'Draft', toneClass: 'status-tone-draft' },
  IN_PROGRESS: { label: 'In Progress', toneClass: 'status-tone-progress' },
  SUBMITTED: { label: 'Submitted', toneClass: 'status-tone-submitted' },
  APPROVED: { label: 'Approved', toneClass: 'status-tone-approved' },
  REJECTED: { label: 'Rejected', toneClass: 'status-tone-rejected' },
};

export const DashboardOverviewPage = () => {
  const [mountTimestamp] = useState(() => Date.now());
  const { role } = useAuth();
  const { currentWorkspaceId } = useWorkspace();
  const { data: projects = [] } = useGetProjectsQuery();
  const { tasks = [] } = useTasks({ limit: 100 });
  const visibleProjects = projects.filter(
    (project) => !project.workspaceId || project.workspaceId === currentWorkspaceId,
  );
  const workspaceProjectIds = new Set(visibleProjects.map((project) => project.id));
  const visibleTasks = tasks.filter((task) => workspaceProjectIds.has(task.projectId));
  const totalTasks = visibleTasks.length;

  const distribution = useMemo(() => {
    const base = Object.fromEntries(KANBAN_COLUMNS.map((status) => [status, 0])) as Record<TaskStatus, number>;
    visibleTasks.forEach((task) => {
      base[task.status] += 1;
    });
    return base;
  }, [visibleTasks]);

  const overdueCount = useMemo(() => {
    return visibleTasks.filter((task) => {
      if (task.status === 'APPROVED') {
        return false;
      }
      const dueDate = task.dueDate ? new Date(task.dueDate).getTime() : new Date(task.createdAt).getTime() + SLA_HOURS * 60 * 60 * 1000;
      return dueDate < mountTimestamp;
    }).length;
  }, [mountTimestamp, visibleTasks]);
  const approvalRate = totalTasks > 0 ? Math.round((distribution.APPROVED / totalTasks) * 100) : 0;
  const submittedCount = distribution.SUBMITTED;
  const activeCount = totalTasks - distribution.APPROVED;

  return (
    <section className="overview-stack">
      <article className="card overview-hero">
        <div>
          <p className="overview-kicker">Workspace Overview</p>
          <h2 className="page-title">Execution health at a glance</h2>
          <p className="muted">Track flow, SLA risk, and approval throughput in one place.</p>
        </div>
        <div className="overview-hero-metrics">
          <div className="kpi-card">
            <span className="muted">Projects</span>
            <strong>{visibleProjects.length}</strong>
          </div>
          <div className="kpi-card">
            <span className="muted">Tasks</span>
            <strong>{totalTasks}</strong>
          </div>
          <div className="kpi-card">
            <span className="muted">Overdue</span>
            <strong className={overdueCount > 0 ? 'danger-text' : ''}>{overdueCount}</strong>
          </div>
          <div className="kpi-card">
            <span className="muted">Approval Rate</span>
            <strong>{approvalRate}%</strong>
          </div>
        </div>
      </article>

      <section className="analytics-grid">
        <article className="card task-distribution-card">
          <h3 className="page-title">Task Distribution</h3>
          <p className="muted">Current load across workflow stages with completion context</p>
          <div className="distribution-summary">
            <div className="summary-pill">
              <span className="muted">Total</span>
              <strong>{totalTasks}</strong>
            </div>
            <div className="summary-pill">
              <span className="muted">Active</span>
              <strong>{activeCount}</strong>
            </div>
            <div className="summary-pill">
              <span className="muted">Completed</span>
              <strong>{distribution.APPROVED}</strong>
            </div>
          </div>
          {totalTasks === 0 ? (
            <div className="empty-state">No tasks yet in this workspace.</div>
          ) : (
            <div className="chart-bars">
              {KANBAN_COLUMNS.map((status) => {
                const count = distribution[status];
                const ratio = (count / totalTasks) * 100;
                const statusMeta = STATUS_META[status];

                return (
                  <div key={status} className="chart-row">
                    <span className={`status-chip ${statusMeta.toneClass}`}>{statusMeta.label}</span>
                    <div className="chart-bar-track">
                      <div
                        className={`chart-bar-fill ${statusMeta.toneClass}`}
                        style={{ width: `${ratio}%` }}
                        aria-label={`${statusMeta.label}: ${count} tasks (${Math.round(ratio)}%)`}
                      />
                    </div>
                    <strong className="chart-value">
                      {count}
                      <small>{Math.round(ratio)}%</small>
                    </strong>
                  </div>
                );
              })}
            </div>
          )}
          <div className="distribution-footnote muted">
            Approved share: <strong>{approvalRate}%</strong>
          </div>
        </article>

        <article className="card">
          <h3 className="page-title">Action Queue</h3>
          <div className="overview-queue">
            <div className="queue-item">
              <span className="muted">Awaiting approval</span>
              <strong>{submittedCount}</strong>
            </div>
            <div className="queue-item">
              <span className="muted">Overdue tasks</span>
              <strong className={overdueCount > 0 ? 'danger-text' : ''}>{overdueCount}</strong>
            </div>
            <div className="queue-item">
              <span className="muted">Your current role</span>
              <strong>{role}</strong>
            </div>
          </div>
        </article>

        <article className="card">
            <h3 className="page-title">SLA Heatmap</h3>
            <div className="heatmap">
              {visibleTasks.slice(0, 42).map((task) => {
                const overdue =
                  task.status !== 'APPROVED' &&
                  new Date(task.createdAt).getTime() + SLA_HOURS * 3600000 < mountTimestamp;
                return <span key={task.id} className={`heat-cell ${overdue ? 'hot' : 'cool'}`} title={task.title} />;
              })}
            </div>
          <p className="muted">Showing first 42 tasks for density view.</p>
        </article>

        <article className="card">
          <h3 className="page-title">Role View</h3>
          <p className="muted">
            {role === 'employee'
              ? 'Focus on assigned execution tasks and dependencies.'
              : 'Focus on throughput, approvals, and SLA risk control.'}
          </p>
        </article>
      </section>
    </section>
  );
};
