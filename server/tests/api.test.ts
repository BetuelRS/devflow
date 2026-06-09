import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../src/app.js';
import { initDB } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'devflow.db');
const PORT = 3100;
let server: http.Server;

function req(method: string, path: string, body?: any, token?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const opts: http.RequestOptions = {
      hostname: 'localhost', port: PORT, path, method,
      headers: { 'Content-Type': 'application/json' } as any,
    };
    if (token) (opts.headers as any)['Authorization'] = `Bearer ${token}`;
    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

let token: string;
let boardId: string;
let colId: string;
let cardId: string;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  await initDB();
  server = createServer(app);
  server.listen(PORT);
  await new Promise(r => setTimeout(r, 500));
});

afterAll(() => {
  server?.close();
});

describe('Auth', () => {
  it('registers a new user', async () => {
    const res = await req('POST', '/api/auth/register', { username: 'testuser', email: 'test@test.com', password: 'password123' });
    expect(res.token).toBeDefined();
    expect(res.user.username).toBe('testuser');
    token = res.token;
  });

  it('rejects duplicate email', async () => {
    const res = await req('POST', '/api/auth/register', { username: 'testuser2', email: 'test@test.com', password: 'password123' });
    expect(res.error).toBeDefined();
  });

  it('logs in', async () => {
    const res = await req('POST', '/api/auth/login', { email: 'test@test.com', password: 'password123' });
    expect(res.token).toBeDefined();
    token = res.token;
  });

  it('rejects wrong password', async () => {
    const res = await req('POST', '/api/auth/login', { email: 'test@test.com', password: 'wrong' });
    expect(res.error).toBeDefined();
  });

  it('gets current user', async () => {
    const res = await req('GET', '/api/auth/me', null, token);
    expect(res.user.username).toBe('testuser');
  });

  it('rejects unauthenticated requests', async () => {
    const res = await req('GET', '/api/auth/me');
    expect(res.error).toBe('No token provided');
  });
});

describe('Boards', () => {
  it('creates a board with default columns', async () => {
    const res = await req('POST', '/api/boards', { title: 'Test Board' }, token);
    expect(res.id).toBeDefined();
    expect(res.columns).toHaveLength(3);
    expect(res.columns[0].title).toBe('Todo');
    boardId = res.id;
    colId = res.columns[0].id;
  });

  it('lists boards', async () => {
    const res = await req('GET', '/api/boards', null, token);
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThanOrEqual(1);
  });

  it('gets a board with populated columns', async () => {
    const res = await req('GET', `/api/boards/${boardId}`, null, token);
    expect(res.id).toBe(boardId);
    expect(res.columns).toHaveLength(3);
  });

  it('updates board title', async () => {
    const res = await req('PUT', `/api/boards/${boardId}`, { title: 'Updated Board' }, token);
    expect(res.ok).toBe(true);
  });
});

describe('Cards', () => {
  it('creates a card', async () => {
    const res = await req('POST', '/api/cards', { title: 'Test Card', columnId: colId }, token);
    expect(res.id).toBeDefined();
    expect(res.title).toBe('Test Card');
    cardId = res.id;
  });

  it('moves card between columns', async () => {
    const board = await req('GET', `/api/boards/${boardId}`, null, token);
    const col2Id = board.columns[1].id;
    const res = await req('PUT', `/api/cards/${cardId}/move`, { columnId: col2Id, position: 0 }, token);
    expect(res.ok).toBe(true);
  });

  it('updates card title', async () => {
    const res = await req('PUT', `/api/cards/${cardId}`, { title: 'Updated Card' }, token);
    expect(res.ok).toBe(true);
  });

  it('deletes a card', async () => {
    const res = await req('DELETE', `/api/cards/${cardId}`, null, token);
    expect(res.ok).toBe(true);
  });
});

describe('Board cleanup', () => {
  it('deletes a board and cascades', async () => {
    const res = await req('DELETE', `/api/boards/${boardId}`, null, token);
    expect(res.ok).toBe(true);
    // Verify board is gone
    const board = await req('GET', `/api/boards/${boardId}`, null, token);
    expect(board.error).toBeDefined();
  });
});
