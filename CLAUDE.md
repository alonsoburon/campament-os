# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**campamentOS** is a T3 Stack application for managing scout camps, including participants, logistics, budgets, and food planning. The system handles scout groups, units, camps, activities, accommodations, transportation, and comprehensive meal planning with allergen tracking.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **API Layer**: tRPC for end-to-end type safety
- **Authentication**: NextAuth.js v5 with Google OAuth
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Package Manager**: pnpm

## Development Commands

### Core Commands
```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Build for production
pnpm start        # Run production build
pnpm check        # Run linter and type check
pnpm typecheck    # Type check only (tsc --noEmit)
```

### Linting & Formatting
```bash
pnpm lint                # Run ESLint
pnpm lint:fix            # Fix ESLint errors
pnpm format:check        # Check Prettier formatting
pnpm format:write        # Apply Prettier formatting
```

### Database Commands
```bash
pnpm db:push             # Push schema changes (development)
pnpm db:generate         # Run migrations (development)
pnpm db:migrate          # Deploy migrations (production)
pnpm db:studio           # Open Prisma Studio
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (NextAuth, tRPC)
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── AppShell.tsx  # Main layout wrapper
│   │   ├── Sidebar.tsx   # Navigation sidebar
│   │   └── Dashboard.tsx # Main dashboard
│   ├── providers/        # React context providers
│   └── layout.tsx        # Root layout with providers
├── server/                # Backend logic
│   ├── api/
│   │   ├── root.ts       # tRPC app router (register routers here)
│   │   └── trpc.ts       # tRPC setup, context, procedures
│   ├── auth/             # NextAuth configuration
│   │   ├── config.ts     # Auth providers & callbacks
│   │   └── index.ts      # Auth instance
│   └── db.ts             # Prisma client singleton
├── trpc/                  # tRPC client setup
│   ├── react.tsx         # Client-side tRPC provider
│   ├── server.ts         # Server-side tRPC caller
│   └── query-client.ts   # TanStack Query config
├── env.js                # Environment variable validation
└── styles/
    └── globals.css       # Global styles and Tailwind config

prisma/
└── schema.prisma         # Database schema (generates to ../generated/prisma)
```

### Key Architectural Patterns

#### tRPC Flow
1. **Define routers** in `src/server/api/routers/` (none exist yet - this is where new routers go)
2. **Register routers** in `src/server/api/root.ts` appRouter
3. **Use in components**: Client components use `api` from `~/trpc/react`, server components use `api` from `~/trpc/server`
4. **Procedures**: Use `publicProcedure` for unauthenticated endpoints, `protectedProcedure` for authenticated

#### Authentication Flow
- Google OAuth only (configured in `src/server/auth/config.ts`)
- **Restricted access**: Only `nuxapower@gmail.com` can sign in (see `AUTHORIZED_EMAIL` in config.ts:37)
- Custom adapter automatically creates a `Person` record when a `User` is created
- Session includes user ID via callback at config.ts:95

#### Database Architecture
- **Prisma Client** generates to `generated/prisma` (not the default location)
- Import from `"../../generated/prisma"` in server code
- **Audit pattern**: Most models have `created_at`, `updated_at`, `deleted_at`, `creator_id`, `updater_id`
- **Key relationships**:
  - `User` ↔ `Person` (1:1): User handles auth, Person handles scout data
  - `ScoutGroup` → `Unit` → Members (`UnitAssistant`)
  - `Camp` → many related entities (participants, activities, menus, budget)
  - `Camp` → `CampParticipation` ← `Person` (many-to-many with metadata)

#### Component Architecture
- UI components from shadcn/ui in `src/app/components/ui/`
- Theme system using `next-themes` with `ThemeProvider`
- App shell pattern: `layout.tsx` → providers → `AppShell` → `Sidebar` + content

### Path Aliases
- `~/` maps to `src/` (configured in tsconfig.json)

### Environment Variables
Required variables (see `.env.example`):
- `AUTH_SECRET`: NextAuth secret (generate with `npx auth secret`)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth secret
- `DATABASE_URL`: PostgreSQL connection string

All environment variables must be registered in `src/env.js` with Zod schemas.

## Development Guidelines

### Adding New Features

#### 1. Adding a tRPC Router
```typescript
// src/server/api/routers/example.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.example.findMany();
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.example.create({
        data: {
          name: input.name,
          creator_id: ctx.session.user.id
        }
      });
    }),
});
```

Then register in `src/server/api/root.ts`:
```typescript
export const appRouter = createTRPCRouter({
  example: exampleRouter,
});
```

#### 2. Database Changes
1. Modify `prisma/schema.prisma`
2. Run `pnpm db:push` (dev) or `pnpm db:generate` (creates migration)
3. Prisma Client auto-regenerates to `generated/prisma`

#### 3. Adding Environment Variables
1. Add to `.env` (not committed)
2. Update `.env.example` with placeholder
3. Add validation schema to `src/env.js` in `server` or `client` section
4. Add to `runtimeEnv` object in `src/env.js`

### UI Components
- Use existing shadcn/ui components from `src/app/components/ui/`
- Theme-aware: Use Tailwind classes that respect theme (e.g., `bg-background`, `text-foreground`)
- Lucide icons: Already installed (`lucide-react`)

### TypeScript Configuration
- Strict mode enabled
- `noUncheckedIndexedAccess: true` - always check array access
- Path alias `~/*` for `./src/*`

### Database Conventions
- Use soft deletes: Set `deleted_at` instead of hard deleting
- Include audit fields when creating records: `creator_id`, `updater_id`
- Generated Prisma client location: `generated/prisma`

## Common Gotchas

1. **Prisma import path**: Import from `"../../generated/prisma"`, not `"@prisma/client"`
2. **Auth restriction**: Only `nuxapower@gmail.com` can sign in (hardcoded in auth config)
3. **tRPC timing middleware**: Adds artificial 100-400ms delay in development (simulates network latency)
4. **Person-User relationship**: When creating a User, a Person is automatically created via adapter
5. **Package manager**: Use `pnpm`, not npm or yarn (specified in package.json)

## Testing Strategy

Currently no test setup. When adding tests, consider:
- Vitest for unit/integration tests
- Playwright or Cypress for E2E
- Mock tRPC routers for component testing
