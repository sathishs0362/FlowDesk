import { useEffect, useMemo, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KANBAN_COLUMNS } from '../utils/transitions';
import { useKanban } from '../hooks/useKanban';
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanCard } from '../components/KanbanCard';
import { useGetProjectsQuery } from '../../projects/projects.api';
import { useGetUsersQuery } from '../../../services/users.api';
import { useState } from 'react';
import type { TaskStatus } from '../../../types/domain';
import { useWorkspace } from '../../../hooks/useWorkspace';

export const KanbanPage = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    groupedTasks,
    allowedDropTargets,
    hoverStatus,
    activeDrag,
    activeTask,
    loading,
    fetching,
    hasMore,
    total,
    filters,
    updateFilters,
    selectedTaskIds,
    toggleTaskSelection,
    clearSelectedTasks,
    moveSelectedTasks,
    loadMore,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    canDragTask,
  } = useKanban();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { currentWorkspaceId } = useWorkspace();
  const [groupingMode, setGroupingMode] = useState<'none' | 'assignee' | 'priority'>('none');
  const [batchStatus, setBatchStatus] = useState<TaskStatus>('IN_PROGRESS');
  const [compactMode, setCompactMode] = useState(false);
  const activeFilterCount = [filters.search, filters.projectId, filters.assignedToId, filters.status].filter(Boolean).length;

  const employeeUsers = useMemo(() => users.filter((user) => user.role === 'employee'), [users]);
  const visibleProjects = useMemo(
    () => projects.filter((project) => !project.workspaceId || project.workspaceId === currentWorkspaceId),
    [currentWorkspaceId, projects],
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: '120px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <section className={compactMode ? 'kanban-compact' : ''}>
      <div className="page-heading page-heading-inline">
        <div>
          <h2 className="page-title">Kanban Board</h2>
          <p className="muted">Drag tasks through each status lane.</p>
        </div>
        <div className="summary-chip-row">
          <span className="summary-chip">Total: {total}</span>
          <span className="summary-chip">Selected: {selectedTaskIds.length}</span>
          <span className="summary-chip">Filters: {activeFilterCount}</span>
          <button
            className={`summary-chip summary-chip-action ${compactMode ? 'active' : ''}`}
            type="button"
            onClick={() => setCompactMode((value) => !value)}
          >
            {compactMode ? 'Comfortable View' : 'Compact View'}
          </button>
        </div>
      </div>

      <div className="kanban-filters card kanban-filters-clean">
        <input
          className="input"
          placeholder="Search task title"
          value={filters.search ?? ''}
          onChange={(event) => updateFilters({ ...filters, search: event.target.value || undefined })}
        />
        <select
          className="input"
          value={filters.projectId ?? ''}
          onChange={(event) => updateFilters({ ...filters, projectId: event.target.value || undefined })}
        >
          <option value="">All projects</option>
          {visibleProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filters.assignedToId ?? ''}
          onChange={(event) => updateFilters({ ...filters, assignedToId: event.target.value || undefined })}
        >
          <option value="">All assignees</option>
          {employeeUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary filter-clear-btn" type="button" onClick={() => updateFilters({})}>
          Clear Filters
        </button>
        <select
          className="input"
          value={groupingMode}
          onChange={(event) => setGroupingMode(event.target.value as 'none' | 'assignee' | 'priority')}
        >
          <option value="none">No swimlanes</option>
          <option value="assignee">Swimlane: Assignee</option>
          <option value="priority">Swimlane: Priority</option>
        </select>
        <select
          className="input"
          value={filters.status ?? ''}
          onChange={(event) => updateFilters({ ...filters, status: (event.target.value || undefined) as typeof filters.status })}
        >
          <option value="">All statuses</option>
          {KANBAN_COLUMNS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {selectedTaskIds.length > 0 ? (
        <div className="batch-toolbar card">
          <p className="muted">{selectedTaskIds.length} selected</p>
          <select
            className="input"
            value={batchStatus}
            onChange={(event) => setBatchStatus(event.target.value as TaskStatus)}
          >
            {KANBAN_COLUMNS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="button" onClick={() => moveSelectedTasks(batchStatus)}>
            Move Selected
          </button>
          <button className="btn btn-secondary" type="button" onClick={clearSelectedTasks}>
            Clear
          </button>
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="kanban-grid">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column}
              status={column}
              tasks={groupedTasks[column]}
              canDrop={allowedDropTargets.includes(column)}
              previewStatus={hoverStatus}
              dragActive={Boolean(activeDrag)}
              loading={loading}
              groupingMode={groupingMode}
              selectedTaskIds={selectedTaskIds}
              onSelectToggle={toggleTaskSelection}
              canDragTask={canDragTask}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? <KanbanCard task={activeTask} overlay /> : null}
        </DragOverlay>
      </DndContext>

      {!loading && total === 0 ? <p className="empty-state">No tasks found for current filters.</p> : null}
      {fetching ? <p className="muted">Updating board...</p> : null}
      {hasMore ? <div ref={loadMoreRef} className="load-sentinel" aria-hidden /> : null}
    </section>
  );
};
