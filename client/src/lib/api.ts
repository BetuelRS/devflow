const API_BASE = '/api';

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    register: (body: { username: string; email: string; password: string }) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
  },
  boards: {
    list: () => request('/boards'),
    get: (id: string) => request(`/boards/${id}`),
    create: (title: string) => request('/boards', { method: 'POST', body: JSON.stringify({ title }) }),
    update: (id: string, title: string) => request(`/boards/${id}`, { method: 'PUT', body: JSON.stringify({ title }) }),
    delete: (id: string) => request(`/boards/${id}`, { method: 'DELETE' }),
  },
  cards: {
    create: (body: { title: string; description?: string; columnId: string }) => request('/cards', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: { title?: string; description?: string }) => request(`/cards/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    move: (id: string, columnId: string, position: number) => request(`/cards/${id}/move`, { method: 'PUT', body: JSON.stringify({ columnId, position }) }),
    delete: (id: string) => request(`/cards/${id}`, { method: 'DELETE' }),
  },
};
