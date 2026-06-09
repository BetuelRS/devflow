import { Router, Response } from 'express';
import { z } from 'zod';
import { getDB } from '../db.js';
import { hashPassword, verifyPassword, generateToken, generateId } from '../auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/register', (req: AuthRequest, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const { username, email, password } = parsed.data;
  const db = getDB();

  const existing = db.exec(`SELECT id FROM users WHERE username = ? OR email = ?`, { bind: [username, email] });
  if (existing.length > 0 && existing[0].values.length > 0) {
    res.status(409).json({ error: 'Username or email already taken' });
    return;
  }

  const id = generateId();
  const hash = hashPassword(password);
  db.run(`INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)`, { bind: [id, username, email, hash] });

  const token = generateToken(id);
  res.status(201).json({ token, user: { id, username, email } });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', (req: AuthRequest, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const { email, password } = parsed.data;
  const db = getDB();

  const result = db.exec(`SELECT id, username, email, password FROM users WHERE email = ?`, { bind: [email] });
  if (result.length === 0 || result[0].values.length === 0) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const [id, username, userEmail, hash] = result[0].values[0] as string[];
  if (!verifyPassword(password, hash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = generateToken(id);
  res.json({ token, user: { id, username, email: userEmail } });
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDB();
  const result = db.exec(`SELECT id, username, email FROM users WHERE id = ?`, { bind: [req.userId!] });
  if (result.length === 0 || result[0].values.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const [id, username, email] = result[0].values[0] as string[];
  res.json({ user: { id, username, email } });
});

export default router;
