import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoardStore } from '../store/board';
import { Trash2, GripVertical } from 'lucide-react';
import type { Card } from '../types';

interface Props { card: Card }

export default function KanbanCard({ card }: Props) {
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 group hover:shadow-md transition cursor-grab active:cursor-grabbing">
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 mt-0.5 flex-shrink-0">
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 break-words">{card.title}</p>
          {card.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{card.description}</p>}
        </div>
        <button onClick={() => deleteCard(card.id)} className="text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
