import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { verifyToken } from './auth.js';

interface Client {
  ws: WebSocket;
  userId: string;
  boardId: string | null;
}

let clients: Client[] = [];

export function setupWS(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const token = url.searchParams.get('token');
    if (!token) { ws.close(4001, 'No token'); return; }

    const payload = verifyToken(token);
    if (!payload) { ws.close(4001, 'Invalid token'); return; }

    const client: Client = { ws, userId: payload.userId, boardId: null };
    clients.push(client);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'join:board') {
          client.boardId = msg.boardId;
        }
        if (msg.type === 'leave:board') {
          client.boardId = null;
        }
        // Broadcast to others in same board
        broadcast(msg, client);
      } catch { /* ignore malformed */ }
    });

    ws.on('close', () => {
      clients = clients.filter(c => c.ws !== ws);
    });
  });

  return wss;
}

function broadcast(msg: unknown, sender: Client): void {
  clients.forEach(c => {
    if (c.ws !== sender.ws && c.ws.readyState === WebSocket.OPEN && c.boardId === sender.boardId) {
      c.ws.send(JSON.stringify(msg));
    }
  });
}
