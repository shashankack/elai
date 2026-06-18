# Mercur — Command Reference

Quick reference for developing the Mercur monorepo in this project.

**Project path:** `mercur/`  
**Package manager:** Bun (`bun@1.3.8`)

---

## Prerequisites

- Node.js v20+
- [Bun](https://bun.sh) v1.3+
- PostgreSQL v14+
- Redis (local or remote)

Configure the API environment in `mercur/apps/api/.env`:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — e.g. `redis://localhost:6379`

---

## First-time setup

```bash
cd mercur
bun install
bun run setup          # builds all packages (required before dev/migrate)
```

Apply database schema and optionally seed demo data:

```bash
cd apps/api
bunx medusa db:migrate
bun run seed           # optional
cd ../..
```

---

## Development server

From the monorepo root (`mercur/`):

```bash
# Start all workspaces (API, admin, vendor, package watchers)
bun run dev

# Start only the three apps (API, admin, vendor)
bun run dev:apps
```

### Local URLs

| Service       | URL                      |
|---------------|--------------------------|
| Backend API   | http://localhost:9000    |
| Admin panel   | http://localhost:7000    |
| Vendor panel  | http://localhost:7001    |

### Run a single app

```bash
# API only
cd mercur/apps/api && bun run dev

# Admin only
cd mercur/apps/admin-test && bun run dev

# Vendor only
cd mercur/apps/vendor && bun run dev
```

---

## Database

All database commands run from `mercur/apps/api`.

### Run pending migrations

```bash
cd mercur/apps/api
bunx medusa db:migrate
```

Run this after:

- Cloning the repo / pointing at a new database
- Pulling code that adds migrations
- Installing registry blocks

`bun run dev` does **not** run migrations automatically.

### Generate migrations (custom modules)

After adding or changing a module with models:

```bash
cd mercur/apps/api
bunx medusa db:generate <module-name>
bunx medusa db:migrate
```

Example:

```bash
bunx medusa db:generate blog
bunx medusa db:migrate
```

### Seed demo data

```bash
cd mercur/apps/api
bun run seed
```

### Build before migrate (if needed)

If migrate fails due to missing compiled output:

```bash
cd mercur
bun run setup
cd apps/api
bunx medusa db:migrate
```

---

## Monorepo scripts (root)

Run from `mercur/`:

| Command | Description |
|---------|-------------|
| `bun run setup` | Build all packages (`turbo run build`) |
| `bun run build` | Same as setup |
| `bun run dev` | Start all dev servers and watchers |
| `bun run dev:apps` | Dev for API, admin, and vendor only |
| `bun run lint` | Lint with oxlint |
| `bun run test:integration:http` | Run HTTP integration tests |

---

## API app scripts

Run from `mercur/apps/api`:

| Command | Description |
|---------|-------------|
| `bun run dev` | Start API via Mercur CLI (`develop`) |
| `bun run start` | Start API in production mode |
| `bun run seed` | Seed database with demo data |
| `bun run test:unit` | Unit tests |
| `bun run test:integration:http` | HTTP integration tests |
| `bun run test:integration:modules` | Module integration tests |

### Medusa CLI (from `apps/api`)

```bash
bunx medusa db:migrate
bunx medusa db:generate <module-name>
```

---

## Admin & vendor app scripts

**Admin** (`mercur/apps/admin-test`):

```bash
bun run dev       # Vite dev server on port 7000
bun run preview   # Preview production build
bun run lint
```

**Vendor** (`mercur/apps/vendor`):

```bash
bun run dev       # Vite dev server on port 7001
bun run preview   # Preview production build
bun run lint
```

---

## Mercur CLI

Use `bunx` from any Mercur project directory. In this monorepo, the local CLI lives at `mercur/packages/cli`.

### Project scaffolding (new projects)

```bash
bunx @mercurjs/cli@latest create [name]
bunx @mercurjs/cli@latest create my-marketplace --template basic
bunx @mercurjs/cli@latest create my-marketplace --skip-db
```

### Blocks & registry

```bash
bunx @mercurjs/cli@latest init
bunx @mercurjs/cli@latest add <block-name>
bunx @mercurjs/cli@latest search
bunx @mercurjs/cli@latest search --query product
bunx @mercurjs/cli@latest view <block-name>
bunx @mercurjs/cli@latest diff
```

After adding blocks:

```bash
cd apps/api
bunx medusa db:generate <module>   # if the block added a new module
bunx medusa db:migrate
bunx @mercurjs/cli@latest codegen  # regenerate typed API client
```

### Build, start, and codegen

```bash
bunx @mercurjs/cli@latest develop   # start dev server (same as apps/api dev)
bunx @mercurjs/cli@latest start     # production start
bunx @mercurjs/cli@latest build     # build application
bunx @mercurjs/cli@latest codegen   # generate API route types
bunx @mercurjs/cli@latest info      # project info
```

### Registry development (monorepo maintainers)

From `mercur/packages/registry`:

```bash
bun run build:registry
bun run codegen
```

---

## Testing

```bash
# From monorepo root
cd mercur
bun run test:integration:http

# From API app
cd mercur/apps/api
bun run test:unit
bun run test:integration:http
bun run test:integration:modules
```

---

## Typical workflows

### Fresh clone

```bash
cd mercur
bun install
bun run setup
cd apps/api
bunx medusa db:migrate
bun run seed          # optional
cd ../..
bun run dev
```

### Daily development

```bash
cd mercur
bun run dev           # or: bun run dev:apps
```

### After pulling new code

```bash
cd mercur
bun install           # if lockfile changed
bun run setup         # if packages changed
cd apps/api
bunx medusa db:migrate
cd ../..
bun run dev
```

### After adding a registry block

```bash
bunx @mercurjs/cli@latest add <block-name>
cd apps/api
bunx medusa db:generate <module>   # only if block adds a module
bunx medusa db:migrate
bunx @mercurjs/cli@latest codegen
cd ../..
bun run dev
```

---

## Services

### Redis (local)

```bash
redis-server
```

The API expects Redis at `REDIS_URL` (default `redis://localhost:6379`).

### PostgreSQL (Docker example)

```bash
docker run -d --name mercur-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16
```

Then set `DATABASE_URL` in `mercur/apps/api/.env` accordingly.

---

## Troubleshooting

### `Pg connection failed` / `KnexTimeoutError` with Neon (or remote Postgres)

Your `DATABASE_URL` may be correct — Medusa's default connection timeout is only **5 seconds**, which Neon often exceeds on cold start (especially while Turbo is building packages in parallel).

`medusa-config.ts` sets `databaseDriverOptions.connection.connectionTimeoutMillis: 30000` to fix this. After changing it, restart dev:

```bash
bun run dev:apps
```

Wait for `Server is ready on port: 9000` in the `@acme/api#dev` logs (~15–20s is normal).

### `Cannot find module '@mercurjs/...'` or missing `index.js` in workspace packages

Stale empty directories under `node_modules/@mercurjs/` block Bun from creating workspace symlinks. Symptoms include:

- `Cannot find module '@mercurjs/types'`
- `Cannot find package '.../node_modules/@mercurjs/dashboard-sdk/index.js'`

Fix it from the monorepo root:

```bash
cd mercur
find . -path "*/node_modules/@mercurjs/*" -type d -empty -delete
bun install
bun run setup
```

Verify symlinks point to `packages/*`, not empty folders:

```bash
ls -la apps/vendor/node_modules/@mercurjs/
```

---

## Related docs

- Mercur README: `mercur/README.md`
- Architecture: `mercur/docs/ARCHITECTURE.md`
- Official docs: https://docs.mercurjs.com/
