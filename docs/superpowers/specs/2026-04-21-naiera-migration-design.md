# Naiera Admin to Bandanaiera Admin Migration Design

**Date:** 2026-04-21
**Status:** Approved
**Approach:** Copy-Adapt-Integrate (Approach A)

## Overview

Migrate core features from `naiera-admin` to `bandanaiera` while preserving bandanaiera's modern UI design system. This combines bandanaiera's clean, approachable aesthetics with naiera's robust authentication, RBAC, and file upload systems.

## Goals

1. **Preserve bandanaiera's UI** — Keep the modern, warm design system
2. **Add core functionality** — RBAC, user management, file upload from naiera
3. **Clean integration** — Minimal disruption to existing bandanaiera codebase
4. **Maintainable architecture** — Clear separation between layers

## Scope

### Included (Core Features)

- **Authentication**: NextAuth v5 with credentials provider
- **RBAC**: Role-based access control with permissions
- **User Management**: CRUD operations for users, roles, permissions
- **File Upload**: S3/MinIO integration with presigned URLs

### Excluded (Non-Core)

- SystemSettings model
- Task management module
- Activity logging
- Email templates
- Landing page features from naiera (bandanaiera's is better)

## Architecture

### Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        bandanaiera                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Landing   │  │    Auth     │  │ Backoffice  │         │
│  │  (bandanaiera)    │  │  (bandanaiera+    │  │ (bandanaiera+RBAC) │         │
│  │             │  │   naiera)   │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Workspace Packages                      │    │
│  │  ┌───────────┐ ┌──────────┐ ┌─────────┐ ┌────────┐  │    │
│  │  │    ui     │ │  types   │ │  hooks  │ │ utils  │  │    │
│  │  │ (bandanaiera)   │ │(naiera)  │ │(naiera) │ │(naiera)│  │    │
│  │  └───────────┘ └──────────┘ └─────────┘ └────────┘  │    │
│  │  ┌───────────┐ ┌──────────┐                         │    │
│  │  │  logger   │ │ rbac     │                         │    │
│  │  │ (naiera)  │ │(in-app)  │                         │    │
│  │  └───────────┘ └──────────┘                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Prisma + DB                        │    │
│  │              Users, Roles, Permissions               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Hybrid Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// AUTHENTICATION (NextAuth v5)
// ============================================================================

model User {
  id                   String           @id @default(cuid())
  name                 String?
  email                String           @unique
  emailVerified        DateTime?
  image                String?
  password             String?
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt
  roleId               String
  passwordResetToken   String?          @unique
  passwordResetExpires DateTime?
  accounts             Account[]
  permissionCache      PermissionCache?
  sessions             Session[]
  role                 Role             @relation(fields: [roleId], references: [id])
  uploadedFiles        File[]           @relation("UserUploads")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================================================
// RBAC (Role-Based Access Control)
// ============================================================================

model Role {
  id          String           @id @default(cuid())
  name        String           @unique
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  permissions RolePermission[]
  users       User[]
}

model Permission {
  id              String           @id @default(cuid())
  name            String           @unique
  category        String
  description     String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  rolePermissions RolePermission[]
}

model RolePermission {
  roleId       String     @default(cuid())
  permissionId String     @default(cuid())
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

model PermissionCache {
  id          String   @id @default(cuid())
  userId      String   @unique
  updatedAt   DateTime @updatedAt
  permissions String[]
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

enum FileCategory {
  AVATAR
  DOCUMENT
  IMAGE
  VIDEO
  AUDIO
  ARCHIVE
  OTHER
}

model File {
  id               String       @id @default(cuid())
  originalFilename String
  storedFilename   String       @unique
  mimeType         String
  size             Int
  category         FileCategory @default(OTHER)

  // Storage
  bucketName  String  @default("bandanaiera-uploads")
  storagePath String
  cdnUrl      String?

  // Ownership
  uploadedById String
  uploadedBy   User   @relation("UserUploads", fields: [uploadedById], references: [id], onDelete: Cascade)

  // Lifecycle
  isPublic       Boolean   @default(false)
  referenceCount Int       @default(0)
  lastAccessedAt DateTime  @default(now())
  expiresAt      DateTime?
  deletedAt      DateTime?

  // Metadata
  width  Int?
  height Int?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([uploadedById])
  @@index([category])
  @@index([expiresAt])
  @@index([deletedAt])
}
```

## Workspace Packages

### New Packages (from naiera)

```
packages/
├── types/                # RBAC, Auth, Table, API types
│   └── src/
│       ├── index.ts
│       ├── rbac/         # Permission, Role, PermissionCheckResult
│       ├── auth/         # NextAuth type extensions
│       ├── table/        # SortDescriptor, FilterDescriptor
│       └── api/          # API response types
├── hooks/                # React hooks
│   └── src/
│       ├── index.ts
│       ├── ui/           # useCmdK, useIsMobile
│       └── rbac/         # useCan
├── utils/                # Utility functions
│   └── src/
│       ├── index.ts
│       ├── currency.ts   # formatCurrency
│       └── breadcrumbs.ts
└── logger/               # Logging utilities
    └── src/
        ├── index.ts
        └── logger.ts
```

### Existing Packages (keep as-is)

```
packages/
├── ui/                   # bandanaiera UI components (shadcn/ui)
├── eslint-config/
├── typescript-config/
```

## Application Structure

### Route Groups

```
apps/support/app/
├── (landing)/           # Public pages (unchanged)
├── (auth)/              # Auth pages (bandanaiera UI + naiera logic)
│   ├── sign-in/
│   ├── sign-up/
│   └── forgot-password/
└── (backoffice)/        # Protected pages with RBAC
    ├── dashboard/       # With RBAC check
    └── manage/          # NEW from naiera
        ├── users/
        ├── roles/
        └── permissions/
```

### Feature Organization

```
apps/support/features/
├── auth/                # Keep bandanaiera UI, add naiera logic
│   ├── components/
│   └── lib/
├── backoffice/          # Keep bandanaiera, add manage pages
│   ├── components/
│   │   ├── manage/      # NEW: user/role/permission tables
│   │   └── ...
│   └── lib/             # NEW: services
├── rbac/                # NEW from naiera
│   ├── components/      # Can, ProtectedRoute
│   └── lib/
└── file-upload/         # NEW from naiera
    └── components/
```

## Key Implementations

### NextAuth Configuration

```typescript
// apps/support/lib/auth/config.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        // Verify user with password
        // Return user with role
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub!
      session.user.role = token.role
      return session
    },
  },
})
```

### RBAC Server

```typescript
// apps/support/lib/rbac/permissions.ts
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect("/sign-in")
  return session
}

export async function requirePermission(userId: string, permission: string) {
  const permissions = await getPermissions(userId)
  if (!permissions.includes(permission)) {
    redirect("/unauthorized")
  }
}
```

### RBAC Client Hook

```typescript
// packages/hooks/src/rbac/use-can.ts
export function useCan() {
  const { data: session } = useSession()

  const can = (permission: Permission): boolean => {
    return session?.user?.permissions?.includes(permission) ?? false
  }

  return { can }
}
```

### File Upload Service

```typescript
// apps/support/lib/services/file-service.ts
export async function uploadFile({ userId, file, category }) {
  // Generate storage key
  // Get presigned URL
  // Create file record in DB
  return { fileRecord, uploadUrl }
}
```

## API Routes

```
apps/support/app/api/
├── auth/[...nextauth]/route.ts    # NextAuth handler
├── users/route.ts                  # GET list, POST create
├── users/[id]/route.ts             # GET, PATCH, DELETE
├── roles/route.ts                  # CRUD
├── permissions/route.ts            # GET list
└── files/upload/route.ts           # POST get presigned URL
```

## Dependencies to Add

```json
{
  "dependencies": {
    "next-auth": "beta",
    "@auth/prisma-adapter": "latest",
    "@prisma/client": "latest",
    "prisma": "latest",
    "@aws-sdk/client-s3": "latest",
    "@aws-sdk/s3-request-presigner": "latest",
    "react-dropzone": "latest",
    "bcrypt": "latest"
  },
  "devDependencies": {
    "@types/bcrypt": "latest"
  }
}
```

## Implementation Order

1. **Setup Prisma** — Install dependencies, create schema, run migrations
2. **Add workspace packages** — Copy types, hooks, utils, logger from naiera
3. **Implement auth** — NextAuth config, password utilities
4. **Implement RBAC** — Server permissions, client hooks
5. **Create API routes** — Users, roles, permissions endpoints
6. **Add manage pages** — User/role/permission management UI
7. **Implement file upload** — S3 config, upload service
8. **Test & integrate** — Verify auth flow, permissions, uploads

## Migration Files Reference

Source: `/home/acn/main/naiera-admin`

Key files to copy:

- `packages/types/src/` — Type definitions
- `packages/hooks/src/` — React hooks
- `packages/utils/src/` — Utilities
- `packages/logger/src/` — Logger
- `apps/naiera-support/lib/auth/` — Auth configuration
- `apps/naiera-support/lib/rbac-server/` — RBAC server
- `apps/naiera-support/lib/rbac-client/` — RBAC client
- `apps/naiera-support/lib/services/` — Service layer
- `apps/naiera-support/features/rbac/` — RBAC components
- `apps/naiera-support/features/file-upload/` — Upload components

---

**Design approved:** 2026-04-21
**Next step:** Create implementation plan
