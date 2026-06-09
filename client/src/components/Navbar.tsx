import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { LogOut, Plus } from 'lucide-react';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold text-xl text-blue-600">DevFlow</Link>
      <div className="flex items-center gap-4">
        <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">Boards</Link>
        <span className="text-sm text-gray-400">{user?.username}</span>
        <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-red-500">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
