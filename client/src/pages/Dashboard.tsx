import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, Trash2 } from 'lucide-react';

interface BoardSummary { id: string; title: string; createdAt: string }

export default function Dashboard() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  const loadBoards = async () => {
    const list = await api.boards.list();
    setBoards(list);
  };

  useEffect(() => { loadBoards(); }, []);

  const createBoard = async () => {
    if (!newTitle.trim()) return;
    const board = await api.boards.create(newTitle.trim());
    setNewTitle('');
    navigate(`/board/${board.id}`);
  };

  const deleteBoard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.boards.delete(id);
    loadBoards();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Boards</h1>
      <div className="flex gap-2 mb-6">
        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New board title..." className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" onKeyDown={(e) => e.key === 'Enter' && createBoard()} />
        <button onClick={createBoard} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"><Plus size={18} />Create</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {boards.map((b) => (
          <Link to={`/board/${b.id}`} key={b.id} className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition flex justify-between items-center group">
            <div>
              <h2 className="font-semibold text-lg">{b.title}</h2>
              <p className="text-sm text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={(e) => deleteBoard(b.id, e)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
              <Trash2 size={18} />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
