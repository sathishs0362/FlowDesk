import { useDroppable } from '@dnd-kit/core';
import type { Task, TaskStatus } from '../../../types/domain';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  canDrop: boolean;
  canDragTask: (task: Task) => boolean;
}

export const KanbanColumn = ({ status, tasks, canDrop, canDragTask }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={`kanban-column ${canDrop ? '' : 'blocked'} ${isOver ? 'over' : ''}`}
    >
      <header className="kanban-column-header">
        <h3>{status}</h3>
        <span>{tasks.length}</span>
      </header>

      <div className="kanban-column-body">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} disabled={!canDragTask(task)} />
        ))}
      </div>
    </section>
  );
};
