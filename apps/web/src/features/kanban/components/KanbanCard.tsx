import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../../types/domain';

interface KanbanCardProps {
  task: Task;
  disabled: boolean;
}

export const KanbanCard = ({ task, disabled }: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled,
    data: { task },
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.45 : 1,
      }}
      className={`kanban-card ${disabled ? 'disabled' : ''}`}
      {...listeners}
      {...attributes}
    >
      <p className="kanban-card-title">{task.title}</p>
      <p className="muted">{task.description || 'No description'}</p>
    </article>
  );
};
