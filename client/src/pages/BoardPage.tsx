import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/board';
import KanbanBoard from '../components/KanbanBoard';
import { ArrowLeft } from 'lucide-react';

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const board = useBoardStore((s) => s.board);
  const loadBoard = useBoardStore((s) => s.loadBoard);
  const loading = useBoardStore((s) => s.loading);

  useEffect(() => {
    if (id) { loadBoard(id); }
  }, [id, loadBoard]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (!board) return <div className="p-6 text-gray-500">Board not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold">{board.title}</h1>
      </div>
      <KanbanBoard />
    </div>
  );
}
