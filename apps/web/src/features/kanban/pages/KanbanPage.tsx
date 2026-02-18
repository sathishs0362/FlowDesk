import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { KANBAN_COLUMNS } from '../utils/transitions';
import { useKanbanBoard } from '../hooks/useKanbanBoard';
import { KanbanColumn } from '../components/KanbanColumn';

export const KanbanPage = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const { groupedTasks, allowedDropTargets, onDragStart, onDragEnd, canDragTask } = useKanbanBoard();

  return (
    <section>
      <div className="page-heading">
        <h2 className="page-title">Kanban Board</h2>
        <p className="muted">Drag tasks through each status lane.</p>
      </div>
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="kanban-grid">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column}
              status={column}
              tasks={groupedTasks[column]}
              canDrop={allowedDropTargets.includes(column)}
              canDragTask={canDragTask}
            />
          ))}
        </div>
      </DndContext>
    </section>
  );
};
