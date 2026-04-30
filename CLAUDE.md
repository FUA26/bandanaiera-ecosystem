# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bandanaiera is a monorepo for the Bandanaiera ecosystem. It contains multiple applications and shared packages, with `apps/naiera-support` serving as the standard app reference for conventions shared across the ecosystem.

**Tech Stack:**

- Next.js 16 with App Router and React Server Components
- React 19
- Turborepo for monorepo management
- shadcn/ui component library
- Tailwind CSS v4 with OKLCH colors
- TypeScript (strict mode)
- pnpm workspace
- NextAuth v5 (beta) for authentication
- Prisma ORM with PostgreSQL
- AWS S3 / MinIO for file storage
- React Hook Form + Zod for validation
- TanStack Table for data tables

## Development Commands

### Root-level commands (run from repository root)

```bash
pnpm dev              # Start all dev servers in parallel
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm lint:fix         # Lint and fix all packages
pnpm format           # Format all code with Prettier
pnpm format:check     # Check formatting without modifying
pnpm typecheck        # Type check all packages
pnpm validate         # Run lint, typecheck, and format:check
```

### Support app-specific commands (run from apps/support/)

```bash
pnpm dev              # Start Next.js dev server with Turbopack
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Format TypeScript/TSX files
pnpm typecheck        # TypeScript type checking (no emit)
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with sample data
pnpm db:studio        # Open Prisma Studio
```

## Monorepo Architecture

### Workspace Structure

```
bandanaiera/
├── apps/
│   ├── support/                # Main Next.js application
│   └── naiera-support/         # Standard app reference for ecosystem apps
├── packages/
│   ├── ui/                     # Shared UI component library (@workspace/ui)
│   ├── eslint-config/          # Shared ESLint configuration
│   └── typescript-config/      # Shared TypeScript configuration
└── docs/                       # Additional documentation
```

### Package Management

- Uses **pnpm** with workspace protocol
- Workspace packages use `workspace:*` dependency references
- Internal imports use `@workspace/*` aliases
- Use `pnpm --filter <package-name>` to run commands in specific packages

### Turborepo Configuration

- Tasks are configured with dependency graphs (e.g., `build` depends on `^build`)
- Dev tasks run with cache disabled and are persistent
- Build outputs are cached for faster subsequent builds
- Global environment variables are defined in turbo.json for database and AWS/S3

## Component Architecture

### Adding Components

Components are added via the shadcn CLI and placed in the shared UI package:

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/support
```

This installs components to `packages/ui/src/components/`.

### Importing Components

Use the workspace alias in your app:

```tsx
import { Button } from "@workspace/ui/components/button"
```

### Component Location

- **Shared components**: `packages/ui/src/components/` - reusable across apps
- **App-specific components**: `apps/support/components/` - specific to the support app

### shadcn/ui Configuration

- **Style**: `radix-nova`
- **Base color**: `neutral`
- **Icon library**: `lucide-react`
- **RSC**: Enabled (React Server Components)
- **CSS variables**: Enabled for theming
- **Aliases** (configured in `apps/support/components.json`):
  - `@/components` → app components
  - `@/hooks` → app hooks
  - `@/lib` → app lib
  - `@workspace/ui/lib/utils` → utilities
  - `@workspace/ui/components` → UI components

### Available Components

The UI package includes:

- Form components: button, input, textarea, select, checkbox, slider, calendar
- Data display: card, badge, avatar, table, data-table, separator, skeleton
- Overlays: dialog, popover, tooltip, sheet, alert-dialog, sonner (toasts)
- Navigation: sidebar, tabs, breadcrumb, command (cmd+k)
- Layout: container, scroll-area, collapsible
- Advanced: field, form, input-group (for form compositions)

## Next.js Configuration

### Transpilation

The `@workspace/ui` package is transpiled by Next.js (configured in `apps/support/next.config.mjs`):

```javascript
transpilePackages: ["@workspace/ui"]
```

### App Router

Uses Next.js App Router (not Pages Router). All routes are in `apps/support/app/`.

### Route Groups

- `(auth)` - Authentication routes (sign-in, sign-up, forgot-password, reset-password)
- `(landing)` - Public landing page
- `(backoffice)` - Protected admin routes (access-management, dashboard, manage, settings)

### Theme System

Uses `next-themes` for dark/light mode theming. The theme provider wraps the app and supports system preference detection with manual override.

### Middleware

NextAuth middleware is configured to protect routes. Middleware runs before matched routes.

## Styling

### Tailwind CSS v4

- Uses PostCSS integration (`@tailwindcss/postcss`)
- Global styles are in `packages/ui/src/styles/globals.css`
- Tailwind config is auto-imported (no separate config file)

### Design Tokens

Theme-aware styling uses CSS variables for colors, spacing, and other design tokens. This enables runtime theme switching.

### Brand Colors

- **Primary**: Teal/cyan at hue ~165 (`oklch(0.508 0.118 165.612)`)
- **Border radius**: 10px for softer, more approachable UI
- **Animation easing**: `cubic-bezier(0.16, 1, 0.3, 1)` for natural deceleration

### Typography

- **Body**: Inter Variable - strategic choice for developer tools
- **Monospace**: Geist Mono - for code/terminal displays

## TypeScript

### Configuration

- Strict mode enabled
- Path aliases are configured in each app's `tsconfig.json`
- Extends shared workspace configs from `@workspace/typescript-config`

### Type Safety

All packages run `tsc --noEmit` for type checking. Run `pnpm typecheck` from the root to check all packages.

## Authentication

### NextAuth v5 (Beta)

- Credential provider (email/password) with bcrypt hashing
- Prisma adapter for database persistence
- Protected routes via middleware
- Custom pages in `app/(auth)/`:
  - `/sign-in` - Login page
  - `/sign-up` - Registration page
  - `/forgot-password` - Password reset request
  - `/reset-password` - Password reset confirmation

### Session Management

Sessions are managed by NextAuth and accessible via the `auth()` function in server components.

## Database

### Prisma ORM

- Schema defined in `apps/support/prisma/schema.prisma`
- PostgreSQL as the primary database
- Seed file at `apps/support/prisma/seed.ts`

### Environment Variables

Required database environment variables:

- `DATABASE_URL` - PostgreSQL connection string

### Common Commands

```bash
pnpm --filter web db:push      # Push schema changes without migration
pnpm --filter web db:migrate   # Create and apply migration
pnpm --filter web db:seed      # Seed database
pnpm --filter web db:studio    # Open Prisma Studio UI
```

## File Storage

### AWS S3 / MinIO

Configured for file uploads with S3-compatible storage:

- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - Access key
- `AWS_SECRET_ACCESS_KEY` - Secret key
- `S3_BUCKET` - Bucket name
- `MINIO_ENDPOINT` - MinIO endpoint (optional, for local development)
- `CDN_URL` - CDN URL for serving assets

## Code Quality

### ESLint

- Uses shared workspace configuration `@workspace/eslint-config`
- Flat config format (eslint.config.js)
- Run `pnpm lint` to check all packages

### Prettier

- Configured with `prettier-plugin-tailwindcss` for class sorting
- Run `pnpm format` to format all code
- Configuration in `prettier.config.js`

### Git Hooks

- **lefthook** - Manages git hooks (configured in `.lefthook.yml`)
- **lint-staged** - Runs linting on staged files (configured in `.lintstagedrc.json`)
- **commitlint** - Enforces conventional commit messages

## Feature Organization

Features are organized in `apps/support/features/` by domain:

- `admin/` - Admin-specific functionality
- `auth/` - Authentication feature modules
- `backoffice/` - Backoffice shared features
- `dashboard/` - Dashboard features
- `landing/` - Landing page features
- `rbac/` - Role-based access control
- `settings/` - Settings functionality
- `showcase/` - Feature demonstrations
- `user/` - User management

Each feature may contain its own components, hooks, and utilities.

## Engine Requirements

- Node.js >= 20
- pnpm >= 9.15.9
- PostgreSQL database
