import { Router, Response } from 'express';
import { z } from 'zod';
import { getDB } from '../db.js';
import { generateId } from '../auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

const createBoardSchema = z.object({
  title: z.string().min(1).max(100),
});

router.post('/', (req: AuthRequest, res: Response) => {
  const parsed = createBoardSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0].message }); return; }

  const db = getDB();
  const boardId = generateId();
  db.run(`INSERT INTO boards (id, title, owner_id) VALUES (?, ?, ?)`, { bind: [boardId, parsed.data.title, req.userId!] });

  // Default columns: Todo, In Progress, Done
  const cols = ['Todo', 'In Progress', 'Done'];
  const columnIds: string[] = [];
  cols.forEach((title, i) => {
    const colId = generateId();
    columnIds.push(colId);
    db.run(`INSERT INTO columns (id, title, board_id, position) VALUES (?, ?, ?, ?)`, { bind: [colId, title, boardId, i] });
  });

  res.status(201).json({ id: boardId, title: parsed.data.title, columns: cols.map((t, i) => ({ id: columnIds[i], title: t, cards: [] })) });
});

router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDB();
  const result = db.exec(`SELECT id, title, created_at FROM boards WHERE owner_id = ? ORDER BY created_at DESC`, { bind: [req.userId!] });
  const boards = result[0]?.values.map((row: any[]) => ({ id: row[0], title: row[1], createdAt: row[2] })) || [];
  res.json(boards);
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const db = getDB();
  const boardResult = db.exec(`SELECT id, title, created_at FROM boards WHERE id = ? AND owner_id = ?`, { bind: [req.params.id, req.userId!] });
  if (!boardResult[0]?.values.length) { res.status(404).json({ error: 'Board not found' }); return; }

  const [boardId, title] = boardResult[0].values[0] as string[];
  const colResult = db.exec(`SELECT id, title, position FROM columns WHERE board_id = ? ORDER BY position`, { bind: [boardId] });
  const columns = (colResult[0]?.values || []).map((row: any[]) => ({
    id: row[0] as string, title: row[1] as string, position: Number(row[2]), cards: [] as any[],
  }));

  // Load cards per column
  for (const col of columns) {
    const cardResult = db.exec(`SELECT id, title, description, position, created_at, updated_at FROM cards WHERE column_id = ? ORDER BY position`, { bind: [col.id] });
    col.cards = (cardResult[0]?.values || []).map((row: any[]) => ({
      id: row[0] as string, title: row[1] as string, description: row[2] as string, position: Number(row[3]), createdAt: row[4] as string, updatedAt: row[5] as string,
    }));
  }

  res.json({ id: boardId, title, columns });
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const parsed = createBoardSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0].message }); return; }

  const db = getDB();
  db.run(`UPDATE boards SET title = ? WHERE id = ? AND owner_id = ?`, { bind: [parsed.data.title, req.params.id, req.userId!] });
  res.json({ ok: true });
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDB();
  db.run(`DELETE FROM cards WHERE column_id IN (SELECT id FROM columns WHERE board_id = ?)`, { bind: [req.params.id] });
  db.run(`DELETE FROM columns WHERE board_id = ?`, { bind: [req.params.id] });
  db.run(`DELETE FROM boards WHERE id = ? AND owner_id = ?`, { bind: [req.params.id, req.userId!] });
  res.json({ ok: true });
});

export default router;
