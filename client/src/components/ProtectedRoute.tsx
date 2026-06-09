import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const loading = useAuthStore((s) => s.loading);
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => { loadUser(); }, [loadUser]);

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
}
