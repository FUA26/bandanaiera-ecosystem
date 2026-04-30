# Naiera Admin to Bandanaiera Admin Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate core features (auth, RBAC, file upload) from naiera-admin to bandanaiera while preserving bandanaiera's modern UI design.

**Architecture:** Copy-adapt-integrate approach — copy workspace packages from naiera, setup Prisma with hybrid schema, integrate auth/RBAC into existing bandanaiera routes.

**Tech Stack:** Next.js 16, NextAuth v5, Prisma, PostgreSQL, S3/MinIO, TypeScript, shadcn/ui

---

## Phase 1: Prisma & Database Setup

### Task 1: Install Prisma Dependencies

**Files:**

- Modify: `apps/support/package.json`
- Modify: `package.json` (root)

- [ ] **Step 1: Add Prisma to root package.json**

Run:

```bash
pnpm add -D -w prisma @prisma/client
```

- [ ] **Step 2: Add bcrypt for password hashing**

Run:

```bash
pnpm add -w bcrypt @types/bcrypt
```

- [ ] **Step 3: Commit**

```bash
git add package.json apps/support/package.json
git commit -m "deps: add prisma and bcrypt"
```

### Task 2: Create Prisma Schema

**Files:**

- Create: `apps/support/prisma/schema.prisma`

- [ ] **Step 1: Create Prisma schema file**

Write to `apps/support/prisma/schema.prisma`:

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

- [ ] **Step 2: Commit**

```bash
git add apps/support/prisma/schema.prisma
git commit -m "schema: add prisma schema with auth, rbac, and file models"
```

### Task 3: Create Prisma Client Singleton

**Files:**

- Create: `apps/support/lib/prisma.ts`

- [ ] **Step 1: Create Prisma client singleton**

Write to `apps/support/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/prisma.ts
git commit -m "feat: add prisma client singleton"
```

### Task 4: Initialize Database

- [ ] **Step 1: Generate Prisma client**

Run:

```bash
cd apps/support && pnpm prisma generate
```

- [ ] **Step 2: Create initial migration**

Run:

```bash
cd apps/support && pnpm prisma migrate dev --name init
```

- [ ] **Step 3: Commit**

```bash
git add apps/support/prisma/migrate
git commit -m "chore: add initial prisma migration"
```

---

## Phase 2: Workspace Packages from Naiera

### Task 5: Create Types Package

**Files:**

- Create: `packages/types/package.json`
- Create: `packages/types/src/index.ts`
- Create: `packages/types/src/rbac/permissions.ts`
- Create: `packages/types/src/rbac/roles.ts`
- Create: `packages/types/src/auth/next-auth.ts`
- Create: `packages/types/src/auth/next-auth-global.d.ts`
- Create: `packages/types/src/api/response.ts`
- Create: `packages/types/src/api/error.ts`

- [ ] **Step 1: Create types package.json**

Write to `packages/types/package.json`:

```json
{
  "name": "@workspace/types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./rbac": "./src/rbac/index.ts",
    "./auth": "./src/auth/index.ts",
    "./api": "./src/api/index.ts"
  }
}
```

- [ ] **Step 2: Create RBAC permission types**

Write to `packages/types/src/rbac/permissions.ts`:

```typescript
export type Permission =
  // User permissions
  | "USER_READ"
  | "USER_CREATE"
  | "USER_UPDATE"
  | "USER_DELETE"
  // Role permissions
  | "ROLE_READ"
  | "ROLE_CREATE"
  | "ROLE_UPDATE"
  | "ROLE_DELETE"
  // Permission permissions
  | "PERMISSION_READ"
  | "PERMISSION_ASSIGN"
  // File permissions
  | "FILE_UPLOAD"
  | "FILE_READ"
  | "FILE_DELETE"
  // Dashboard
  | "DASHBOARD_ACCESS"

export interface PermissionCheckResult {
  can: boolean
  reason?: string
}

export interface RoleWithPermissions {
  id: string
  name: string
  permissions: Permission[]
}
```

- [ ] **Step 3: Create RBAC role types**

Write to `packages/types/src/rbac/roles.ts`:

```typescript
export type RoleName = "ADMIN" | "USER" | "MODERATOR"

export interface RoleData {
  name: RoleName
  permissions: string[]
}
```

- [ ] **Step 4: Create RBAC index**

Write to `packages/types/src/rbac/index.ts`:

```typescript
export * from "./permissions"
export * from "./roles"
```

- [ ] **Step 5: Create NextAuth types**

Write to `packages/types/src/auth/next-auth.ts`:

```typescript
import type { Permission, RoleWithPermissions } from "../rbac"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: RoleWithPermissions
      permissions: Permission[]
    } & DefaultSession["user"]
  }

  interface User {
    role: RoleWithPermissions
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: RoleWithPermissions
  }
}
```

- [ ] **Step 6: Create NextAuth global types**

Write to `packages/types/src/auth/next-auth-global.d.ts`:

```typescript
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: {
        id: string
        name: string
        permissions: string[]
      }
    }
  }
}
```

- [ ] **Step 7: Create auth index**

Write to `packages/types/src/auth/index.ts`:

```typescript
export * from "./next-auth"
```

- [ ] **Step 8: Create API response types**

Write to `packages/types/src/api/response.ts`:

```typescript
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  message?: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

- [ ] **Step 9: Create API error types**

Write to `packages/types/src/api/error.ts`:

```typescript
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}
```

- [ ] **Step 10: Create API index**

Write to `packages/types/src/api/index.ts`:

```typescript
export * from "./response"
export * from "./error"
```

- [ ] **Step 11: Create main index**

Write to `packages/types/src/index.ts`:

```typescript
export * from "./rbac"
export * from "./auth"
export * from "./api"
```

- [ ] **Step 12: Commit**

```bash
git add packages/types
git commit -m "feat: add types package with RBAC, auth, and API types"
```

### Task 6: Create Hooks Package

**Files:**

- Create: `packages/hooks/package.json`
- Create: `packages/hooks/src/index.ts`
- Create: `packages/hooks/src/ui/use-mobile.ts`
- Create: `packages/hooks/src/rbac/use-can.ts`

- [ ] **Step 1: Create hooks package.json**

Write to `packages/hooks/package.json`:

```json
{
  "name": "@workspace/hooks",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "next-auth": "beta",
    "@workspace/types": "workspace:*",
    "react": "19.x"
  },
  "exports": {
    ".": "./src/index.ts",
    "./ui": "./src/ui/index.ts",
    "./rbac": "./src/rbac/index.ts"
  }
}
```

- [ ] **Step 2: Create useMobile hook**

Write to `packages/hooks/src/ui/use-mobile.ts`:

```typescript
import { useEffect, useState } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
```

- [ ] **Step 3: Create UI hooks index**

Write to `packages/hooks/src/ui/index.ts`:

```typescript
export * from "./use-mobile"
```

- [ ] **Step 4: Create useCan hook**

Write to `packages/hooks/src/rbac/use-can.ts`:

```typescript
"use client"

import { useSession } from "next-auth/react"
import type { Permission } from "@workspace/types"

export function useCan() {
  const { data: session } = useSession()

  const can = (permission: Permission): boolean => {
    if (!session?.user) return false
    return session.user.permissions?.includes(permission) ?? false
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((p) => can(p))
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((p) => can(p))
  }

  return {
    can,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: session?.user?.role?.name === "ADMIN",
    isAuthenticated: !!session?.user,
  }
}
```

- [ ] **Step 5: Create RBAC hooks index**

Write to `packages/hooks/src/rbac/index.ts`:

```typescript
export * from "./use-can"
```

- [ ] **Step 6: Create main index**

Write to `packages/hooks/src/index.ts`:

```typescript
export * from "./ui"
export * from "./rbac"
```

- [ ] **Step 7: Commit**

```bash
git add packages/hooks
git commit -m "feat: add hooks package with useCan and useMobile"
```

### Task 7: Create Utils Package

**Files:**

- Create: `packages/utils/package.json`
- Create: `packages/utils/src/index.ts`
- Create: `packages/utils/src/currency.ts`
- Create: `packages/utils/src/breadcrumbs.ts`

- [ ] **Step 1: Create utils package.json**

Write to `packages/utils/package.json`:

```json
{
  "name": "@workspace/utils",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

- [ ] **Step 2: Create currency utils**

Write to `packages/utils/src/currency.ts`:

```typescript
export function formatCurrency(
  amount: number,
  locale: string = "id-ID",
  currency: string = "IDR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}
```

- [ ] **Step 3: Create breadcrumbs utils**

Write to `packages/utils/src/breadcrumbs.ts`:

```typescript
export interface Breadcrumb {
  label: string
  href?: string
}

export function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: Breadcrumb[] = []

  segments.forEach((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    breadcrumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href,
    })
  })

  return breadcrumbs
}
```

- [ ] **Step 4: Create main index**

Write to `packages/utils/src/index.ts`:

```typescript
export * from "./currency"
export * from "./breadcrumbs"
```

- [ ] **Step 5: Commit**

```bash
git add packages/utils
git commit -m "feat: add utils package with currency and breadcrumbs"
```

---

## Phase 3: Authentication

### Task 8: Install NextAuth Dependencies

- [ ] **Step 1: Install NextAuth v5**

Run:

```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "deps: add next-auth v5 and prisma adapter"
```

### Task 9: Create Password Utilities

**Files:**

- Create: `apps/support/lib/auth/password.ts`

- [ ] **Step 1: Create password utilities**

Write to `apps/support/lib/auth/password.ts`:

```typescript
import bcrypt from "bcrypt"

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  }

  // Add more validation as needed

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/auth/password.ts
git commit -m "feat: add password hashing and validation utilities"
```

### Task 10: Create NextAuth Configuration

**Files:**

- Create: `apps/support/lib/auth/config.ts`

- [ ] **Step 1: Create NextAuth config**

Write to `apps/support/lib/auth/config.ts`:

```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "./password"
import type { Permission } from "@workspace/types"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        const permissions = user.role.permissions.map(
          (p) => p.name as Permission
        )

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: {
            id: user.role.id,
            name: user.role.name,
            permissions,
          },
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as {
          id: string
          name: string
          permissions: Permission[]
        }
        session.user.permissions = token.role?.permissions as Permission[]
      }
      return session
    },
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/auth/config.ts
git commit -m "feat: add NextAuth configuration with credentials provider"
```

### Task 11: Create NextAuth API Route

**Files:**

- Create: `apps/support/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create NextAuth route handler**

Write to `apps/support/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth/config"

export const { GET, POST } = handlers
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/app/api/auth/[...nextauth]/route.ts
git commit -m "feat: add NextAuth API route handler"
```

### Task 12: Update Sign In Page

**Files:**

- Modify: `apps/support/features/auth/components/sign-in-form.tsx`

- [ ] **Step 1: Read existing sign-in form**

Read the current file to understand its structure:

```bash
cat apps/support/features/auth/components/sign-in-form.tsx
```

- [ ] **Step 2: Update sign-in form to use NextAuth**

The form should POST to `/api/auth/callback/credentials` with email and password.

Update the form action:

```typescript
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { toast } from "sonner"

export function SignInForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        toast.error("Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/support/features/auth/components/sign-in-form.tsx
git commit -m "feat: update sign-in form to use NextAuth"
```

---

## Phase 4: RBAC Implementation

### Task 13: Create RBAC Server Utilities

**Files:**

- Create: `apps/support/lib/rbac/permissions.ts`
- Create: `apps/support/lib/rbac/roles.ts`

- [ ] **Step 1: Create permission utilities**

Write to `apps/support/lib/rbac/permissions.ts`:

```typescript
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/config"
import type { Permission } from "@workspace/types"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session
}

export const getPermissions = cache(
  async (userId: string): Promise<Permission[]> => {
    // Check cache first (5 minute TTL)
    const cached = await prisma.permissionCache.findUnique({
      where: { userId },
    })

    if (cached && Date.now() - cached.updatedAt.getTime() < 5 * 60 * 1000) {
      return cached.permissions as Permission[]
    }

    // Fetch fresh permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })

    if (!user) {
      return []
    }

    const permissions = user.role.permissions.map((p) => p.name as Permission)

    // Update cache
    await prisma.permissionCache.upsert({
      where: { userId },
      update: { permissions: permissions as string[] },
      create: { userId, permissions: permissions as string[] },
    })

    return permissions
  }
)

export async function requirePermission(
  userId: string,
  permission: Permission
): Promise<void> {
  const permissions = await getPermissions(userId)

  if (!permissions.includes(permission)) {
    throw new Error(`Missing required permission: ${permission}`)
  }
}

export async function hasPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const permissions = await getPermissions(userId)
  return permissions.includes(permission)
}

export async function invalidatePermissionCache(userId: string): Promise<void> {
  await prisma.permissionCache.update({
    where: { userId },
    data: { updatedAt: new Date(0) }, // Force refresh
  })
}
```

- [ ] **Step 2: Create role utilities**

Write to `apps/support/lib/rbac/roles.ts`:

```typescript
import { prisma } from "@/lib/prisma"
import type { Permission, RoleName } from "@workspace/types"

const DEFAULT_PERMISSIONS: Record<RoleName, Permission[]> = {
  ADMIN: [
    "USER_READ",
    "USER_CREATE",
    "USER_UPDATE",
    "USER_DELETE",
    "ROLE_READ",
    "ROLE_CREATE",
    "ROLE_UPDATE",
    "ROLE_DELETE",
    "PERMISSION_READ",
    "PERMISSION_ASSIGN",
    "FILE_UPLOAD",
    "FILE_READ",
    "FILE_DELETE",
    "DASHBOARD_ACCESS",
  ],
  USER: ["DASHBOARD_ACCESS"],
  MODERATOR: [
    "USER_READ",
    "ROLE_READ",
    "PERMISSION_READ",
    "FILE_UPLOAD",
    "FILE_READ",
    "DASHBOARD_ACCESS",
  ],
}

export async function seedRoles() {
  const existingRoles = await prisma.role.findMany()

  if (existingRoles.length > 0) {
    return existingRoles
  }

  const roles = await Promise.all(
    Object.entries(DEFAULT_PERMISSIONS).map(async ([name, permissions]) => {
      return prisma.role.upsert({
        where: { name },
        update: {},
        create: {
          name,
          permissions: {
            connectOrCreate: permissions.map((p) => ({
              where: { name: p },
              create: {
                name: p,
                category: p.split("_")[0],
              },
            })),
          },
        },
        include: { permissions: true },
      })
    })
  )

  return roles
}

export async function getDefaultRole() {
  return prisma.role.findUnique({
    where: { name: "USER" },
  })
}

export async function getAdminRole() {
  return prisma.role.findUnique({
    where: { name: "ADMIN" },
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/support/lib/rbac
git commit -m "feat: add RBAC server utilities"
```

### Task 14: Create RBAC Client Components

**Files:**

- Create: `apps/support/features/rbac/components/can.tsx`

- [ ] **Step 1: Create Can component**

Write to `apps/support/features/rbac/components/can.tsx`:

```typescript
"use client"

import { useCan } from "@workspace/hooks"
import type { Permission } from "@workspace/types"

interface CanProps {
  permission: Permission
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const { can } = useCan()

  if (!can(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/features/rbac/components/can.tsx
git commit -m "feat: add Can component for permission-based rendering"
```

### Task 15: Create Protected Route Middleware

**Files:**

- Create: `apps/support/middleware.ts`

- [ ] **Step 1: Create middleware**

Write to `apps/support/middleware.ts`:

```typescript
import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/sign-")
  const isBackoffice =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/manage")

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Redirect to sign-in if trying to access protected routes while logged out
  if (!isLoggedIn && isBackoffice) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/middleware.ts
git commit -m "feat: add auth middleware for protected routes"
```

---

## Phase 5: Services Layer

### Task 16: Create User Service

**Files:**

- Create: `apps/support/lib/services/user-service.ts`

- [ ] **Step 1: Create user service**

Write to `apps/support/lib/services/user-service.ts`:

```typescript
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth/password"
import { getDefaultRole } from "./role-service"
import { invalidatePermissionCache } from "@/lib/rbac/permissions"

export interface CreateUserInput {
  email: string
  name?: string
  password: string
  roleId?: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  roleId?: string
}

export interface ListUsersOptions {
  page?: number
  pageSize?: number
  search?: string
}

export const userService = {
  async listUsers({ page = 1, pageSize = 10, search }: ListUsersOptions = {}) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { role: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: { include: { permissions: true } } },
    })
  },

  async createUser(data: CreateUserInput) {
    const defaultRole = data.roleId
      ? await prisma.role.findUnique({ where: { id: data.roleId } })
      : await getDefaultRole()

    if (!defaultRole) {
      throw new Error("Default role not found")
    }

    const hashedPassword = await hashPassword(data.password)

    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        roleId: defaultRole.id,
      },
      include: { role: true },
    })
  },

  async updateUser(id: string, data: UpdateUserInput) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        roleId: data.roleId,
      },
      include: { role: true },
    })

    // Invalidate permission cache if role changed
    if (data.roleId) {
      await invalidatePermissionCache(id)
    }

    return user
  },

  async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    })
  },

  async getUserPermissions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })

    return user?.role.permissions.map((p) => p.name) ?? []
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/services/user-service.ts
git commit -m "feat: add user service with CRUD operations"
```

### Task 17: Create Role Service

**Files:**

- Create: `apps/support/lib/services/role-service.ts`

- [ ] **Step 1: Create role service**

Write to `apps/support/lib/services/role-service.ts`:

```typescript
import { prisma } from "@/lib/prisma"

export interface CreateRoleInput {
  name: string
  permissionIds: string[]
}

export const roleService = {
  async listRoles() {
    return prisma.role.findMany({
      include: { permissions: true },
      orderBy: { name: "asc" },
    })
  },

  async getRoleById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    })
  },

  async createRole(data: CreateRoleInput) {
    return prisma.role.create({
      data: {
        name: data.name,
        permissions: {
          connect: data.permissionIds.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    })
  },

  async updateRole(id: string, data: CreateRoleInput) {
    // Update role name and permissions
    const role = await prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        permissions: {
          set: [], // Clear existing
          connect: data.permissionIds.map((pid) => ({ id: pid })),
        },
      },
      include: { permissions: true },
    })

    // Invalidate all users with this role
    const users = await prisma.user.findMany({
      where: { roleId: id },
      select: { id: true },
    })

    for (const user of users) {
      await prisma.permissionCache.delete({ where: { userId: user.id } })
    }

    return role
  },

  async deleteRole(id: string) {
    // Check if role is being used
    const userCount = await prisma.user.count({ where: { roleId: id } })
    if (userCount > 0) {
      throw new Error("Cannot delete role that is assigned to users")
    }

    return prisma.role.delete({
      where: { id },
    })
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/services/role-service.ts
git commit -m "feat: add role service with CRUD operations"
```

---

## Phase 6: API Routes

### Task 18: Create Users API Routes

**Files:**

- Create: `apps/support/app/api/users/route.ts`
- Create: `apps/support/app/api/users/[id]/route.ts`

- [ ] **Step 1: Create users list/create route**

Write to `apps/support/app/api/users/route.ts`:

```typescript
import { auth } from "@/lib/auth/config"
import { requirePermission } from "@/lib/rbac/permissions"
import { userService } from "@/lib/services/user-service"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "USER_READ")

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const search = searchParams.get("search") || undefined

    const result = await userService.listUsers({ page, pageSize, search })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch users",
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "USER_CREATE")

    const body = await req.json()
    const user = await userService.createUser(body)

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Create user detail route**

Write to `apps/support/app/api/users/[id]/route.ts`:

```typescript
import { auth } from "@/lib/auth/config"
import { requirePermission } from "@/lib/rbac/permissions"
import { userService } from "@/lib/services/user-service"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "USER_READ")

    const { id } = await params
    const user = await userService.getUserById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch user",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "USER_UPDATE")

    const { id } = await params
    const body = await req.json()

    const user = await userService.updateUser(id, body)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update user",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "USER_DELETE")

    const { id } = await params
    await userService.deleteUser(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete user",
      },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/support/app/api/users
git commit -m "feat: add users API routes"
```

### Task 19: Create Roles API Routes

**Files:**

- Create: `apps/support/app/api/roles/route.ts`
- Create: `apps/support/app/api/roles/[id]/route.ts`

- [ ] **Step 1: Create roles list/create route**

Write to `apps/support/app/api/roles/route.ts`:

```typescript
import { auth } from "@/lib/auth/config"
import { requirePermission } from "@/lib/rbac/permissions"
import { roleService } from "@/lib/services/role-service"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ROLE_READ")

    const roles = await roleService.listRoles()
    return NextResponse.json(roles)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch roles",
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ROLE_CREATE")

    const body = await req.json()
    const role = await roleService.createRole(body)

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create role",
      },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Create role detail route**

Write to `apps/support/app/api/roles/[id]/route.ts`:

```typescript
import { auth } from "@/lib/auth/config"
import { requirePermission } from "@/lib/rbac/permissions"
import { roleService } from "@/lib/services/role-service"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ROLE_READ")

    const { id } = await params
    const role = await roleService.getRoleById(id)

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    return NextResponse.json(role)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch role",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ROLE_UPDATE")

    const { id } = await params
    const body = await req.json()

    const role = await roleService.updateRole(id, body)
    return NextResponse.json(role)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update role",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ROLE_DELETE")

    const { id } = await params
    await roleService.deleteRole(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete role",
      },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/support/app/api/roles
git commit -m "feat: add roles API routes"
```

---

## Phase 7: File Upload

### Task 20: Install S3 Dependencies

- [ ] **Step 1: Install AWS SDK**

Run:

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "deps: add AWS SDK for S3"
```

### Task 21: Create S3 Storage Config

**Files:**

- Create: `apps/support/lib/storage/s3.ts`

- [ ] **Step 1: Create S3 client**

Write to `apps/support/lib/storage/s3.ts`:

```typescript
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  // For MinIO (local development)
  ...(process.env.MINIO_ENDPOINT && {
    endpoint: process.env.MINIO_ENDPOINT,
    forcePathStyle: true,
  }),
})

export { s3Client }

export async function generatePresignedUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET || "bandanaiera-uploads",
    Key: key,
    ContentType: contentType,
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET || "bandanaiera-uploads",
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

export function generateKey(
  userId: string,
  category: string,
  filename: string
): string {
  const timestamp = Date.now()
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
  return `uploads/${userId}/${category}/${timestamp}-${cleanFilename}`
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/storage/s3.ts
git commit -m "feat: add S3 client and presigned URL utilities"
```

### Task 22: Create File Upload Service

**Files:**

- Create: `apps/support/lib/services/file-service.ts`

- [ ] **Step 1: Create file service**

Write to `apps/support/lib/services/file-service.ts`:

```typescript
import { prisma } from "@/lib/prisma"
import { generatePresignedUrl, generateKey } from "@/lib/storage/s3"

export interface UploadOptions {
  userId: string
  filename: string
  mimeType: string
  size: number
  category:
    | "AVATAR"
    | "DOCUMENT"
    | "IMAGE"
    | "VIDEO"
    | "AUDIO"
    | "ARCHIVE"
    | "OTHER"
  isPublic?: boolean
}

export const fileService = {
  async createUploadRecord(options: UploadOptions) {
    const storagePath = generateKey(
      options.userId,
      options.category,
      options.filename
    )

    const file = await prisma.file.create({
      data: {
        originalFilename: options.filename,
        storedFilename: storagePath.split("/").pop() || "",
        mimeType: options.mimeType,
        size: options.size,
        category: options.category,
        storagePath,
        bucketName: process.env.S3_BUCKET || "bandanaiera-uploads",
        uploadedById: options.userId,
        isPublic: options.isPublic ?? false,
        cdnUrl: options.isPublic
          ? `${process.env.CDN_URL || ""}/${storagePath}`
          : null,
      },
    })

    return file
  },

  async getPresignedUploadUrl(fileId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    })

    if (!file) {
      throw new Error("File not found")
    }

    return generatePresignedUrl(file.storagePath, file.mimeType)
  },

  async getPresignedDownloadUrl(fileId: string, userId: string) {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        uploadedById: userId,
      },
    })

    if (!file) {
      throw new Error("File not found")
    }

    return generatePresignedDownloadUrl(file.storagePath)
  },

  async listUserFiles(userId: string, category?: string) {
    return prisma.file.findMany({
      where: {
        uploadedById: userId,
        ...(category && { category }),
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    })
  },

  async deleteFile(fileId: string, userId: string) {
    return prisma.file.updateMany({
      where: {
        id: fileId,
        uploadedById: userId,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/services/file-service.ts
git commit -m "feat: add file upload service"
```

### Task 23: Create File Upload API Route

**Files:**

- Create: `apps/support/app/api/files/upload/route.ts`

- [ ] **Step 1: Create upload route**

Write to `apps/support/app/api/files/upload/route.ts`:

```typescript
import { auth } from "@/lib/auth/config"
import { requirePermission } from "@/lib/rbac/permissions"
import { fileService } from "@/lib/services/file-service"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "FILE_UPLOAD")

    const body = await req.json()
    const { filename, mimeType, size, category, isPublic } = body

    const file = await fileService.createUploadRecord({
      userId: session.user.id,
      filename,
      mimeType,
      size,
      category,
      isPublic,
    })

    const uploadUrl = await fileService.getPresignedUploadUrl(file.id)

    return NextResponse.json({
      file,
      uploadUrl,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/app/api/files/upload/route.ts
git commit -m "feat: add file upload API route"
```

---

## Phase 8: Seed Data

### Task 24: Create Seed Script

**Files:**

- Create: `apps/support/prisma/seed.ts`

- [ ] **Step 1: Create seed script**

Write to `apps/support/prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create roles and permissions
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      permissions: {
        create: [
          { name: "USER_READ", category: "USER" },
          { name: "USER_CREATE", category: "USER" },
          { name: "USER_UPDATE", category: "USER" },
          { name: "USER_DELETE", category: "USER" },
          { name: "ROLE_READ", category: "ROLE" },
          { name: "ROLE_CREATE", category: "ROLE" },
          { name: "ROLE_UPDATE", category: "ROLE" },
          { name: "ROLE_DELETE", category: "ROLE" },
          { name: "PERMISSION_READ", category: "PERMISSION" },
          { name: "PERMISSION_ASSIGN", category: "PERMISSION" },
          { name: "FILE_UPLOAD", category: "FILE" },
          { name: "FILE_READ", category: "FILE" },
          { name: "FILE_DELETE", category: "FILE" },
          { name: "DASHBOARD_ACCESS", category: "DASHBOARD" },
        ],
      },
    },
  })

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
      permissions: {
        create: [{ name: "DASHBOARD_ACCESS", category: "DASHBOARD" }],
      },
    },
  })

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bandanaiera.com" },
    update: {},
    create: {
      email: "admin@bandanaiera.com",
      name: "Admin",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  })

  console.log("Seed completed!")
  console.log("Admin user: admin@bandanaiera.com / admin123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

- [ ] **Step 2: Add seed script to package.json**

Update `apps/support/package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 3: Install tsx for seed script**

Run:

```bash
pnpm add -D -w tsx
```

- [ ] **Step 4: Run seed**

Run:

```bash
cd apps/support && pnpm prisma db seed
```

- [ ] **Step 5: Commit**

```bash
git add apps/support/prisma/seed.ts apps/support/package.json package.json
git commit -m "feat: add database seed script with admin user"
```

---

## Phase 9: Environment Variables

### Task 25: Create Environment Template

**Files:**

- Create: `apps/support/.env.example`

- [ ] **Step 1: Create env example**

Write to `apps/support/.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bandanaiera"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AWS S3 / MinIO
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="bandanaiera-uploads"

# Optional: MinIO for local development
# MINIO_ENDPOINT="http://localhost:9000"

# Optional: CDN
# CDN_URL="https://cdn.example.com"
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/.env.example
git commit -m "chore: add environment variables template"
```

---

## Phase 10: Testing & Verification

### Task 26: Verify Auth Flow

- [ ] **Step 1: Start dev server**

Run:

```bash
pnpm dev
```

- [ ] **Step 2: Test sign in**

1. Navigate to `http://localhost:3000/sign-in`
2. Enter credentials: `admin@bandanaiera.com` / `admin123`
3. Verify redirect to `/dashboard`
4. Check that session is valid

- [ ] **Step 3: Test protected route**

1. Log out
2. Navigate to `/dashboard`
3. Verify redirect to `/sign-in`

### Task 27: Verify RBAC

- [ ] **Step 1: Test permission check**

1. Log in as admin
2. Navigate to `/manage/users` (to be created)
3. Verify access is granted

### Task 28: Verify API Routes

- [ ] **Step 1: Test users API**

Run:

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

- [ ] **Step 2: Test roles API**

Run:

```bash
curl -X GET http://localhost:3000/api/roles \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

## Completion Checklist

- [ ] All tasks completed
- [ ] Database seeded with admin user
- [ ] Sign in flow works
- [ ] Protected routes redirect correctly
- [ ] API routes return correct data
- [ ] RBAC permissions enforced
- [ ] File upload service functional

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-21-naiera-migration.md`.**
