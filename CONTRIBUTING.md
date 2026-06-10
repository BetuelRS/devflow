# Contributing

## Dev Setup

```bash
npm ci --legacy-peer-deps
npm run dev
```

Server :3001, client :5173.

## Tests

```bash
npm test                    # unit + integration
npm run test:e2e -w client  # Playwright E2E
```

## Code Style

- TypeScript strict mode
- No `any` unless unavoidable
- Prefer `const` over `let`

## PR Checklist

- [ ] Tests pass
- [ ] No type errors (`tsc --noEmit`)
- [ ] No lint warnings
- [ ] Add/update tests for new features
- [ ] Update `docs/api.md` if API changes

## Commit Style

Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
