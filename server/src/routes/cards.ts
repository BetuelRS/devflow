import { Router, Response } from 'express';
import { z } from 'zod';
import { getDB, saveDB } from '../db.js';
import { generateId } from '../auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

const createCardSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  columnId: z.string(),
});

router.post('/', (req: AuthRequest, res: Response) => {
  const parsed = createCardSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0].message }); return; }

  const db = getDB();
  const { title, description, columnId } = parsed.data;

  // Verify column belongs to user's board
  const colCheck = db.exec(`SELECT c.id FROM columns c JOIN boards b ON c.board_id = b.id WHERE c.id = ? AND b.owner_id = ?`, { bind: [columnId, req.userId!] });
  if (!colCheck[0]?.values.length) { res.status(404).json({ error: 'Column not found' }); return; }

  // Get next position
  const maxPos = db.exec(`SELECT COALESCE(MAX(position), -1) + 1 FROM cards WHERE column_id = ?`, { bind: [columnId] });
  const position = Number((maxPos[0]?.values[0] || [0])[0]);

  const cardId = generateId();
  db.run(`INSERT INTO cards (id, title, description, column_id, position) VALUES (?, ?, ?, ?, ?)`, { bind: [cardId, title, description, columnId, position] });
  saveDB();

  res.status(201).json({ id: cardId, title, description, columnId, position, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

router.put('/:id/move', (req: AuthRequest, res: Response) => {
  const schema = z.object({ columnId: z.string(), position: z.number().min(0) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0].message }); return; }

  const db = getDB();
  const { columnId, position } = parsed.data;

  // Verify card belongs to user
  const cardCheck = db.exec(`SELECT id FROM cards WHERE id = ? AND column_id IN (SELECT id FROM columns WHERE board_id IN (SELECT id FROM boards WHERE owner_id = ?))`, { bind: [req.params.id, req.userId!] });
  if (!cardCheck[0]?.values.length) { res.status(404).json({ error: 'Card not found' }); return; }

  db.run(`UPDATE cards SET column_id = ?, position = ?, updated_at = datetime('now') WHERE id = ?`, { bind: [columnId, position, req.params.id] });
  saveDB();

  res.json({ ok: true });
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const schema = z.object({ title: z.string().min(1).max(200).optional(), description: z.string().max(2000).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0].message }); return; }

  const db = getDB();
  const updates: string[] = [];
  const binds: any[] = [];

  if (parsed.data.title !== undefined) { updates.push('title = ?'); binds.push(parsed.data.title); }
  if (parsed.data.description !== undefined) { updates.push('description = ?'); binds.push(parsed.data.description); }

  if (updates.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }

  updates.push(`updated_at = datetime('now')`);
  binds.push(req.params.id);

  db.run(`UPDATE cards SET ${updates.join(', ')} WHERE id = ?`, { bind: binds });
  saveDB();

  res.json({ ok: true });
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDB();
  db.run(`DELETE FROM cards WHERE id = ? AND column_id IN (SELECT id FROM columns WHERE board_id IN (SELECT id FROM boards WHERE owner_id = ?))`, { bind: [req.params.id, req.userId!] });
  saveDB();
  res.json({ ok: true });
});

export default router;
