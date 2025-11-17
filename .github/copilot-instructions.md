## Repo Overview

This repo is a T3-stack Next.js (App Router) application written in TypeScript. Key subsystems:
- Frontend: `src/app/` (Next.js app router, shadcn/ui components in `src/app/components/`)
- Backend: `src/server/` (tRPC routers, auth, Prisma client)
- tRPC client: `src/trpc/` (client and React provider)
- Prisma schema: `prisma/schema.prisma` → generated client in `generated/prisma`

Use `pnpm` for package management and the scripts in `package.json`.

## Quick Commands
- Install & dev: `pnpm install` then `pnpm dev`
- Build: `pnpm build` ; Preview: `pnpm preview`
- Lint/typecheck: `pnpm check` (runs `next lint` + `tsc --noEmit`)
- Prisma: `pnpm db:push` (dev), `pnpm db:generate` (migrate dev), `pnpm db:migrate` (deploy), `pnpm db:studio`

Note: `postinstall` runs `prisma generate` (Prisma client is generated to `generated/prisma`).

## Important Conventions (do not change without reason)
- Prisma client is imported from `generated/prisma`, not `@prisma/client`.
- Path alias: `~` → `src/` (use `~/...` imports).
- Database patterns: soft-deletes (`deleted_at`), audit fields (`creator_id`, `updater_id`).
- Auth: NextAuth config in `src/server/auth/config.ts`. Sign-in is deliberately restricted to a specific email (see the file).
- UI: shadcn/ui components live in `src/app/components/ui/` and follow Tailwind theme tokens (e.g., `bg-background`).

## tRPC Guidelines (where to add code)
- Create routers in `src/server/api/routers/` and register them in `src/server/api/root.ts`.
- Client usage: import `api` from `~/trpc/react` in client components; for server usage import from `~/trpc/server`.
- Procedures: use `publicProcedure` for unauthenticated operations and `protectedProcedure` for authenticated ones.

Example router skeleton:
```ts
// src/server/api/routers/example.ts
export const exampleRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => ctx.db.example.findMany()),
  create: protectedProcedure.input(z.object({name:z.string()})).mutation(({ctx,input})=> ctx.db.example.create({data:{name:input.name, creator_id: ctx.session.user.id}}))
});
```

## Env & Secrets
- Required env vars: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`.
- Environment validation: `src/env.js` (Zod schemas). Add any new runtime envs there when needed.

## Common Gotchas
- The app uses Next.js 15 (App Router) — prefer server components where appropriate and follow existing `layout.tsx` provider patterns.
- Prisma client path is non-standard: search for `generated/prisma` when changing DB access code.
- Auth flow auto-creates a `Person` for each `User` (see adapter in `src/server/auth`).

## When You Modify Schema / DB
1. Edit `prisma/schema.prisma`.
2. For local development use `pnpm db:push` or `pnpm db:generate` to create migrations.
3. Commit only migrations; never commit `.env`.

## Testing & CI notes
- No tests currently configured. If you add tests, prefer `vitest` for unit tests and a lightweight e2e runner (Playwright/Cypress) for flows that exercise authentication and DB.

## Where to Look First (good entry points)
- `src/server/api/root.ts` — tRPC router registration
- `src/server/trpc.ts` — tRPC helpers and protected/public procedures
- `src/server/db.ts` — Prisma client singleton
- `src/server/auth/config.ts` — NextAuth configuration and sign-in restrictions
- `src/app/layout.tsx` and `src/app/components/AppShell.tsx` — main app composition and providers

If anything in this file is unclear or missing, tell me which area to expand (auth, tRPC, prisma, or frontend patterns) and I'll refine the instructions.
