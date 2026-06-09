# DevFlow API

Minimal Kanban board with real-time collaboration.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + dnd-kit
- **Backend**: Express + TypeScript + sql.js (SQLite)
- **Realtime**: WebSocket (ws)
- **Auth**: JWT + bcrypt
- **Testing**: Vitest + Playwright

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current user |

**POST /api/auth/register**
```json
{ "username": "string", "email": "string", "password": "string" }
```
→ `{ "token": "...", "user": { id, username, email } }`

**POST /api/auth/login**
```json
{ "email": "string", "password": "string" }
```
→ `{ "token": "...", "user": { id, username, email } }`

### Boards

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/boards` | Yes | List user boards |
| POST | `/api/boards` | Yes | Create board (with 3 default columns) |
| GET | `/api/boards/:id` | Yes | Get board with columns and cards |
| PUT | `/api/boards/:id` | Yes | Update board title |
| DELETE | `/api/boards/:id` | Yes | Delete board (cascades columns + cards) |

### Cards

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/cards` | Yes | Create card |
| PUT | `/api/cards/:id` | Yes | Update card title/description |
| PUT | `/api/cards/:id/move` | Yes | Move card to different column/position |
| DELETE | `/api/cards/:id` | Yes | Delete card |

## Architecture

```
client/  → Vite dev server (:5173) → API proxy → Express server (:3001)
                                              → WebSocket (:3001/ws)
                                              → SQLite (devflow.db)
```

## Running

```bash
npm install --legacy-peer-deps
npm run dev          # Start both server + client
npm run dev -w server   # Server only
npm run dev -w client   # Client only
npm test            # Run all tests
```

## Docker

```bash
docker build -t devflow .
docker run -p 3001:3001 devflow
```

## Deploy (Render)

1. Push to GitHub
2. Create new Web Service on Render
3. Set build command: `npm ci --legacy-peer-deps && npm run build -w server && npm run build -w client`
4. Set start command: `node server/dist/index.js`
5. Set env: `JWT_SECRET`, `CLIENT_URL`, `PORT`
