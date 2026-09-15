# NovaPAY Bank — Demo Banking Platform

A fictional, full-stack demo banking application built with **Next.js 16**, **Prisma**, **React 19**, and **Tailwind CSS v4**.

NovaPAY runs a simulated $650,000.00 account with a full ledger of transactions, pending transfers, balance history, support chat, and login activity.

An optional companion environment — **Fargo Digital Banking** — provides a second $0.00 simulated account. Internal transfers between NovaPAY and Fargo are atomic, with paired ledger entries in both accounts.

**No real money is sent, received, or stored. All data is simulated.**

---

## Local Development

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Setup

```bash
npm install
```

This automatically runs `postinstall`, which generates the Prisma client for the default SQLite database.

### Environment Variables

Copy the example env file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description | Default (dev) |
|---|---|---|
| `DATABASE_URL` | SQLite path or PostgreSQL connection string | `file:./dev.db` |
| `SESSION_SECRET` | Secret for signing session cookies | (required) |
| `APP_URL` | Public base URL of the app | `http://localhost:3000` |

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed the Demo Data

```bash
npm run db:seed
```

This creates the demo user and all simulated accounts. Safe to run repeatedly — the seed is idempotent and will exit cleanly if data already exists.

To wipe and re-seed from scratch:

```bash
npm run db:reset
npm run db:seed
```

### Useful Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build (auto-selects correct Prisma schema) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run db:seed` | Seed the demo data (idempotent) |
| `npm run db:reset` | Reset the SQLite database and re-apply migrations |
| `npm run db:generate` | Regenerate the Prisma client (SQLite) |
| `npm run db:generate:prod` | Regenerate the Prisma client (auto-detects DATABASE_URL) |
| `npm run db:migrate:prod` | Deploy pending PostgreSQL migrations |

---

## Production Database (PostgreSQL)

The project ships with dual Prisma schemas:

- `prisma/schema.prisma` — SQLite (local development)
- `prisma/postgres/schema.prisma` — PostgreSQL (production)

### Create a PostgreSQL Database

Create a PostgreSQL 15+ database using your hosting provider (Vercel Postgres, Neon, Supabase, Railway, etc.).

### Configure the Connection String

Set `DATABASE_URL` to your PostgreSQL connection string in your hosting environment's settings:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

### Run the Migration

Locally (against your production database):

```bash
DATABASE_URL="postgresql://..." npm run db:migrate:prod
```

Or on the server/build environment, run `npx prisma migrate deploy --schema=prisma/postgres/schema.prisma`.

### Generate the Prisma Client

The build script (`npm run build`) automatically detects PostgreSQL in `DATABASE_URL` and generates the correct client. To generate manually:

```bash
DATABASE_URL="postgresql://..." npm run db:generate:prod
```

### Seed the Production Database

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

The seed is deterministic and idempotent. Safe to re-run.

---

## Deploy to Vercel

### 1. Push to GitHub

Initialize a git repository (if not already) and push the project.

### 2. Import into Vercel

Go to [vercel.com](https://vercel.com), import your GitHub repository, and select the `novapay` directory as the root if it is in a monorepo.

### 3. Configure Environment Variables

In the Vercel project settings, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `SESSION_SECRET` | A long random secret (e.g. from `openssl rand -base64 32`) |
| `APP_URL` | Your Vercel deployment URL (e.g. `https://your-app.vercel.app`) |

### 4. Configure the Build Command

In the Vercel project settings, set the **Build Command** to:

```bash
npm run build
```

This automatically:
- Detects PostgreSQL from `DATABASE_URL`
- Generates the correct Prisma client
- Runs `next build`

### 5. Configure the Install Command

Vercel runs `npm install` by default, which triggers `postinstall` and generates the Prisma client.

### 6. Run the PostgreSQL Migration

After deployment, connect to your database and run:

```bash
npx prisma migrate deploy --schema=prisma/postgres/schema.prisma
```

Or use a Vercel Postgres-compatible migration process via a build step or one-off run command.

### 7. Seed the Production Database

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

### 8. Verify

- Open your Vercel URL.
- Sign in with the demo credentials (see the seed output for login details).
- Check both `/novapay/dashboard` and `/fargo/dashboard`.
- Perform an internal transfer to verify both accounts update.

---

## Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | Database connection string (`file:./dev.db` for SQLite, `postgresql://...` for PostgreSQL) | Yes |
| `SESSION_SECRET` | HMAC secret for signing session cookies — use a stable random string | Yes |
| `APP_URL` | Public application URL (e.g. `https://your-app.vercel.app`) | Yes |
| `NODE_ENV` | `production` or `development` — set automatically by Next.js | Automatic |

Never commit `.env` or `.env.local`. The `.env.example` file is safe to commit.

---

## Project Structure

```
novapay/
├── prisma/
│   ├── schema.prisma              # SQLite dev schema
│   ├── postgres/
│   │   ├── schema.prisma          # PostgreSQL production schema
│   │   └── migrations/            # PostgreSQL migration history
│   └── seed.ts                    # Deterministic, idempotent seed
├── scripts/
│   └── prepare-prisma.mjs         # Auto-selects SQLite vs PostgreSQL client
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── login/                 # Shared auth: login
│   │   ├── register/              # Shared auth: register
│   │   ├── novapay/               # NovaPAY Bank UI
│   │   │   ├── page.tsx           # Redirects to /novapay/dashboard
│   │   │   └── (dashboard)/       # Dashboard shell (requires auth)
│   │   └── fargo/                 # Fargo Digital Banking UI
│   │       ├── page.tsx           # Redirects to /fargo/dashboard
│   │       └── (dashboard)/       # Fargo shell (requires auth)
│   ├── components/                # UI components, views, layouts
│   ├── lib/                       # Auth, Prisma client, utilities, agent logic
│   └── ...
├── .env.example
└── package.json
```

---

## License

This is a fictional demonstration project for educational purposes only. No real financial services are provided.
