# DevFlow

[![CI](https://github.com/BetuelRS/devflow/actions/workflows/ci.yml/badge.svg)](https://github.com/BetuelRS/devflow/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Full-stack Kanban board with real-time collaboration. Drag-drop cards, manage tasks, sync across devices.

Built with React 19 + Express + SQLite + WebSocket. Zero external dependencies for data — your boards, your server.

## Stack

| Frontend | Backend | Infra |
|----------|---------|-------|
| React 19 + TypeScript | Express + TypeScript | Docker multi-stage |
| Vite + Tailwind CSS | sql.js (SQLite) | GitHub Actions CI/CD |
| dnd-kit (drag-drop) | JWT + bcrypt (auth) | Render free tier |
| Zustand (state) | WebSocket (ws) | Playwright E2E |

## Quick Start

```bash
npm ci --legacy-peer-deps
npm run dev
```

Server on `:3001`, client on `:5173`.

## Tests

```bash
npm test                    # Unit + integration (21 tests)
npm run test:e2e -w client  # Browser E2E (3 tests)
```

**24 tests total** — server integration, client rendering, Playwright browser flows.

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/boards` | Yes | List boards |
| POST | `/api/boards` | Yes | Create board |
| GET | `/api/boards/:id` | Yes | Get board + columns + cards |
| PUT | `/api/boards/:id` | Yes | Rename board |
| DELETE | `/api/boards/:id` | Yes | Delete board |
| POST | `/api/cards` | Yes | Create card |
| PUT | `/api/cards/:id` | Yes | Update card |
| PUT | `/api/cards/:id/move` | Yes | Move card to column/position |
| DELETE | `/api/cards/:id` | Yes | Delete card |

## Deploy

### Render (free)

1. Fork/clone repo
2. New Web Service → Node runtime
3. Build: `npm ci --legacy-peer-deps && npm run build -w server && npm run build -w client`
4. Start: `node server/dist/index.js`
5. Env: `JWT_SECRET=<your-secret>`

### Docker

```bash
docker build -t devflow .
docker run -p 3001:3001 devflow
```

## Project Structure

```
├── server/          Express API (routes, middleware, DB, WS)
├── client/          React frontend (pages, components, store)
├── shared/          Shared TypeScript types
├── tests/e2e/       Playwright browser tests
├── .github/workflows/  CI/CD pipeline
└── docs/            API docs
```

## License

MIT — use, modify, ship.
