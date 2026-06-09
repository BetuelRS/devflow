import { useState } from 'react';
import {
  DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '../store/board';
import KanbanColumn from './KanbanColumn';
import { Plus, X } from 'lucide-react';

export default function KanbanBoard() {
  const board = useBoardStore((s) => s.board);
  const addCard = useBoardStore((s) => s.addCard);
  const moveCard = useBoardStore((s) => s.moveCard);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingToCol, setAddingToCol] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  if (!board) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const allCards = board.columns.flatMap((c) => c.cards);
    const card = allCards.find((c) => c.id === active.id);
    if (!card) return;

    // Dropped on column
    const col = board.columns.find((c) => c.id === over.id);
    if (col) {
      moveCard(card.id, col.id, col.cards.length);
      return;
    }

    // Dropped on card
    const overCard = allCards.find((c) => c.id === over.id);
    if (overCard) {
      const overCol = board.columns.find((c) => c.id === overCard.columnId);
      if (overCol) {
        const pos = overCol.cards.findIndex((c) => c.id === overCard.id);
        moveCard(card.id, overCol.id, pos >= 0 ? pos : overCol.cards.length);
      }
    }
  };

  const handleAddCard = (colId: string) => {
    if (!newTitle.trim()) return;
    addCard(newTitle.trim(), '', colId);
    setNewTitle('');
    setAddingToCol(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[65vh]">
        {board.columns.map((col) => (
          <div key={col.id} className="bg-gray-50 rounded-xl p-4 w-72 flex-shrink-0 border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">{col.title}</h3>
              <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">{col.cards.length}</span>
            </div>
            <SortableContext items={col.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <KanbanColumn column={col} />
            </SortableContext>

            {addingToCol === col.id ? (
              <div className="mt-2">
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Card title..." className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddCard(col.id)} />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleAddCard(col.id)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Add</button>
                  <button onClick={() => { setAddingToCol(null); setNewTitle(''); }} className="text-xs text-gray-500 px-2"><X size={14} /></button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingToCol(col.id)} className="mt-2 w-full text-left text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 py-1.5">
                <Plus size={14} /> Add Card
              </button>
            )}
          </div>
        ))}
      </div>
    </DndContext>
  );
}
