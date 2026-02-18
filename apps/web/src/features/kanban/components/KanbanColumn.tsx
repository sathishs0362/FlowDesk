import { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Task, TaskStatus } from '../../../types/domain';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  canDrop: boolean;
  previewStatus: TaskStatus | null;
  dragActive: boolean;
  loading?: boolean;
  groupingMode: 'none' | 'assignee' | 'priority';
  selectedTaskIds: string[];
  onSelectToggle: (taskId: string) => void;
  canDragTask: (task: Task) => boolean;
}

const KanbanColumnComponent = ({
  status,
  tasks,
  canDrop,
  previewStatus,
  dragActive,
  loading = false,
  groupingMode,
  selectedTaskIds,
  onSelectToggle,
  canDragTask,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const isPreview = previewStatus === status;
  const showInvalidTarget = dragActive && !canDrop;

  const groupedByLane =
    groupingMode === 'none'
      ? [{ key: 'all', label: '', tasks }]
      : Object.entries(
          tasks.reduce<Record<string, Task[]>>((acc, task) => {
            const key =
              groupingMode === 'assignee'
                ? task.assignedToId.slice(0, 8)
                : task.priority ?? 'MEDIUM';
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(task);
            return acc;
          }, {}),
        ).map(([key, laneTasks]) => ({ key, label: key, tasks: laneTasks }));

  return (
    <section
      ref={setNodeRef}
      className={`kanban-column ${showInvalidTarget ? 'blocked invalid-target' : ''} ${isOver ? 'over' : ''} ${isPreview ? 'preview' : ''}`}
    >
      <header className="kanban-column-header">
        <h3>{status}</h3>
        <span>{tasks.length}</span>
      </header>

      <div className="kanban-column-body">
        {loading && tasks.length === 0 ? <div className="skeleton-card" /> : null}
        {groupedByLane.map((lane) => (
          <div key={lane.key} className="kanban-lane">
            {lane.label ? <p className="kanban-lane-label">{lane.label}</p> : null}
            {lane.tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                disabled={!canDragTask(task)}
                selected={selectedTaskIds.includes(task.id)}
                onSelectToggle={onSelectToggle}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export const KanbanColumn = memo(KanbanColumnComponent);
