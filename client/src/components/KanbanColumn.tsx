import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';
import type { Column } from '../types';

interface Props { column: Column }

export default function KanbanColumn({ column }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className={`flex-1 space-y-2 transition-colors rounded-lg ${isOver ? 'bg-blue-50/50' : ''}`}>
      {column.cards.map((card) => (
        <KanbanCard key={card.id} card={card} />
      ))}
    </div>
  );
}
