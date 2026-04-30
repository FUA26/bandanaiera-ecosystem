# Bandanaiera

A monorepo for the Bandanaiera ecosystem. It hosts multiple applications and shared packages, with `apps/naiera-support` as the standard app reference for shared conventions.

## Features

- **Next.js 16** with App Router and React Server Components
- **React 19** with latest features
- **Authentication** - NextAuth v5 (beta) with credential provider
- **Database** - Prisma ORM with PostgreSQL support
- **Styling** - Tailwind CSS v4 with shadcn/ui components
- **Forms** - React Hook Form + Zod validation
- **Data Tables** - TanStack Table integration
- **Storage** - AWS S3 / MinIO support for file uploads
- **Type Safety** - TypeScript strict mode
- **Code Quality** - ESLint, Prettier, lint-staged, lefthook
- **Monorepo** - Turborepo for efficient builds

## Project Structure

```
bandanaiera/
├── apps/
│   ├── support/                # Main Next.js application
│   └── naiera-support/         # Standard app for the Bandanaiera ecosystem
│       ├── app/                # App Router routes
│       │   ├── (auth)/         # Auth routes (sign-in, sign-up, etc.)
│       │   ├── (landing)/      # Landing page
│       │   ├── (backoffice)/   # Protected backoffice routes
│       │   │   ├── access-management/
│       │   │   ├── dashboard/
│       │   │   ├── manage/
│       │   │   └── settings/
│       │   └── api/            # API routes
│       ├── components/         # App-specific components
│       ├── features/           # Feature-based modules
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utilities
│       └── prisma/             # Database schema and migrations
├── packages/
│   ├── ui/                     # Shared UI component library
│   │   └── src/
│   │       ├── components/     # shadcn/ui components
│   │       ├── styles/         # Global styles with theme
│   │       ├── lib/            # Utilities (cn, etc.)
│   │       └── hooks/          # Shared hooks
│   ├── eslint-config/          # Shared ESLint configuration
│   └── typescript-config/      # Shared TypeScript configuration
└── docs/                       # Additional documentation
```

## Getting Started

For detailed setup instructions including Docker, troubleshooting, and development workflow, see [docs/SETUP.md](docs/SETUP.md).

### Prerequisites

- Node.js >= 20
- pnpm >= 9.15.9
- PostgreSQL database (or use the provided docker-compose)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
pnpm --filter support db:push

# (Optional) Seed database
pnpm --filter support db:seed

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Docker Setup

```bash
# Start PostgreSQL and MinIO
docker-compose -f docker-compose.admin.yml up -d
```

## Development Commands

### Root-level commands

```bash
pnpm dev              # Start all dev servers in parallel
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm lint:fix         # Lint and fix all packages
pnpm format           # Format all code with Prettier
pnpm format:check     # Check formatting
pnpm typecheck        # Type check all packages
pnpm validate         # Run lint, typecheck, and format:check
```

### Support app commands

```bash
pnpm --filter support dev              # Start Next.js dev server with Turbopack
pnpm --filter support build            # Production build
pnpm --filter support start            # Start production server
pnpm --filter support lint             # Run ESLint
pnpm --filter support typecheck        # TypeScript type checking
pnpm --filter support db:push          # Push schema to database
pnpm --filter support db:migrate       # Run migrations
pnpm --filter support db:seed          # Seed database
pnpm --filter support db:studio        # Open Prisma Studio
```

## Adding Components

Components are managed via shadcn CLI and stored in the shared UI package:

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/support
```

Components are installed to `packages/ui/src/components/` and can be imported:

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Styling

### Theme

The app uses a custom teal/cyan brand color (`oklch(0.508 0.118 165.612)`) with:

- Light mode default
- Dark mode support via `next-themes`
- Generous border radius (10px)
- Warm, approachable neutrals

### CSS Variables

Design tokens are defined in `packages/ui/src/styles/globals.css` using CSS variables for runtime theme switching.

## Authentication

NextAuth v5 is configured with:

- Credential provider (email/password)
- Prisma adapter
- Protected routes via middleware
- Custom sign-in, sign-up, forgot-password, and reset-password pages

## Database

### Schema

Define your schema in `apps/support/prisma/schema.prisma`.

### Migrations

```bash
pnpm --filter support db:migrate
```

### Studio

```bash
pnpm --filter support db:studio
```

## Code Quality

- **ESLint** - Shared workspace configuration with TypeScript rules
- **Prettier** - Code formatting with Tailwind class sorting
- **lint-staged** - Run checks on staged files
- **lefthook** - Git hooks for pre-commit validation
- **commitlint** - Conventional commit messages

## License

MIT
