type WSCallback = (data: any) => void;

let ws: WebSocket | null = null;
let listeners: Map<string, Set<WSCallback>> = new Map();

export function connectWS(token: string): void {
  if (ws?.readyState === WebSocket.OPEN) return;
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${window.location.host}/ws?token=${token}`);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const cbs = listeners.get(msg.type);
      cbs?.forEach((cb) => cb(msg.payload));
    } catch { /* ignore */ }
  };

  ws.onclose = () => { ws = null; };
}

export function sendWS(type: string, payload: unknown): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  }
}

export function subscribeWS(type: string, cb: WSCallback): () => void {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type)!.add(cb);
  return () => { listeners.get(type)?.delete(cb); };
}

export function joinBoard(boardId: string): void {
  sendWS('join:board', boardId);
}

export function leaveBoard(): void {
  sendWS('leave:board', null);
}
