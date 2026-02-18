import { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../../types/domain';

interface KanbanCardProps {
  task: Task;
  disabled?: boolean;
  overlay?: boolean;
  selected?: boolean;
  onSelectToggle?: (taskId: string) => void;
}

const KanbanCardComponent = ({
  task,
  disabled = false,
  overlay = false,
  selected = false,
  onSelectToggle,
}: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: disabled || overlay,
    data: { task },
  });

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  if (overlay) {
    return (
      <article className="kanban-card overlay" aria-hidden>
        <p className="kanban-card-title">{task.title}</p>
        <div className="kanban-card-meta">
          {task.priority ? <span className={`kanban-chip priority-${task.priority.toLowerCase()}`}>{task.priority}</span> : null}
          {formattedDueDate ? <span className="kanban-chip subtle">Due {formattedDueDate}</span> : null}
        </div>
      </article>
    );
  }

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.45 : 1,
      }}
      className={`kanban-card ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}`}
      {...listeners}
      {...attributes}
    >
      {onSelectToggle ? (
        <label className="kanban-select">
          <input
            className="kanban-select-input"
            type="checkbox"
            checked={selected}
            onChange={() => onSelectToggle(task.id)}
            onClick={(event) => event.stopPropagation()}
          />
          <span className="kanban-select-box" aria-hidden>
            <span className="kanban-select-tick">✓</span>
          </span>
        </label>
      ) : null}
      <p className="kanban-card-title">{task.title}</p>
      <div className="kanban-card-meta">
        {task.priority ? <span className={`kanban-chip priority-${task.priority.toLowerCase()}`}>{task.priority}</span> : null}
        {task.blockedByTaskIds && task.blockedByTaskIds.length > 0 ? (
          <span className="kanban-chip blocked">Blocked: {task.blockedByTaskIds.length}</span>
        ) : null}
        {formattedDueDate ? <span className="kanban-chip subtle">Due {formattedDueDate}</span> : null}
      </div>
      <p className="kanban-card-description muted">{task.description || 'No description provided'}</p>
      <div className="kanban-card-footer">
        <span className="muted">#{task.id.slice(0, 8)}</span>
      </div>
    </article>
  );
};

export const KanbanCard = memo(KanbanCardComponent);
