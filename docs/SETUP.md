# Zilpo Admin - Setup & Development Guide

Complete guide for setting up and working with Zilpo Admin project.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Docker Setup](#docker-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting](#troubleshooting)
8. [Useful Commands](#useful-commands)

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start Docker services (PostgreSQL + MinIO)
docker-compose up -d

# 3. Set up environment
cp .env.docker.example .env
# Edit .env if needed (defaults work for local development)

# 4. Set up database
pnpm --filter support db:push

# 5. Seed database (optional, creates admin user)
pnpm --filter support db:seed

# 6. Start development server
pnpm dev
```

App will be available at `http://localhost:3000`

**Default Admin Credentials:**

- Email: `admin@pisky.dev`
- Password: `admin123`

---

## Docker Setup

Zilpo Admin uses Docker for infrastructure services (PostgreSQL, MinIO) while the app runs on your host machine for faster development.

### Starting Services

```bash
# Start all services in background
docker-compose up -d

# Start services and follow logs
docker-compose up

# Stop services
docker-compose down

# Stop services and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Services Overview

| Service       | Port | Access URL              | Credentials                    |
| ------------- | ---- | ----------------------- | ------------------------------ |
| PostgreSQL    | 5432 | `localhost:5432`        | `zilpo` / `zilpo123`           |
| MinIO API     | 9000 | `http://localhost:9000` | `minioadmin` / `minioadmin123` |
| MinIO Console | 9001 | `http://localhost:9001` | Same as API                    |

### Managing Services

```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f postgres
docker-compose logs -f minio

# Restart a service
docker-compose restart postgres

# Rebuild and restart (after Dockerfile changes)
docker-compose up -d --build
```

### Connecting to MinIO Console

1. Open `http://localhost:9001` in your browser
2. Login with `minioadmin` / `minioadmin123`
3. Create bucket named `zilpo-uploads` (or your configured bucket name)

### Database Access

You can use any PostgreSQL client:

- **Command line:** `docker exec -it zilpo-postgres psql -U zilpo -d zilpo_admin`
- **GUI:** Use TablePlus, DBeaver, or pgAdmin with:
  - Host: `localhost`
  - Port: `5432`
  - User: `zilpo`
  - Password: `zilpo123`
  - Database: `zilpo_admin`

### Running App in Docker (Optional)

If you prefer to run everything in Docker (useful for consistent testing):

```bash
# Build and run all services including the app
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

---

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root:

```bash
# Copy example file
cp .env.docker.example .env
```

### Variable Reference

| Variable                | Required | Default                 | Description                                                           |
| ----------------------- | -------- | ----------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`          | ✅       | -                       | PostgreSQL connection string                                          |
| `NEXTAUTH_SECRET`       | ✅       | -                       | Secret for NextAuth sessions (generate with `openssl rand-base64 32`) |
| `NEXTAUTH_URL`          | ✅       | `http://localhost:3000` | Your app's URL                                                        |
| `S3_BUCKET`             | ❌       | `zilpo-uploads`         | Bucket name for file uploads                                          |
| `AWS_REGION`            | ❌       | `us-east-1`             | AWS/S3 region                                                         |
| `AWS_ACCESS_KEY_ID`     | ❌       | -                       | S3 access key (MinIO uses `minioadmin`)                               |
| `AWS_SECRET_ACCESS_KEY` | ❌       | -                       | S3 secret key (MinIO uses `minioadmin123`)                            |
| `MINIO_ENDPOINT`        | ❌       | `http://localhost:9000` | MinIO endpoint for local development                                  |

### Generating NEXTAUTH_SECRET

```bash
# macOS/Linux
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# PowerShell (Windows)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

---

## Database Setup

### Initial Setup

```bash
# Push schema to database (development, no migration)
pnpm --filter support db:push

# Create and apply migration (production recommended)
pnpm --filter support db:migrate

# Seed database with initial data
pnpm --filter support db:seed
```

### What Gets Seeded?

The seed script creates:

- **14 Permissions** across categories (USER, ROLE, PERMISSION, FILE, DASHBOARD)
- **2 Roles:** ADMIN (all permissions), USER (dashboard access only)
- **1 Admin User:** `admin@pisky.dev` / `admin123`

### Database Schema

Key models:

- `User` - User accounts with role assignment
- `Role` - User roles (ADMIN, USER, custom)
- `Permission` - Granular permissions
- `RolePermission` - Junction table for role-permission relationships
- `File` - Uploaded file metadata

### Prisma Studio (Database GUI)

```bash
# Open Prisma Studio
pnpm --filter support db:studio
```

Browse to `http://localhost:5555` to view and edit your database.

### Common Database Commands

```bash
# Reset database (⚠️ deletes all data)
pnpm --filter support db:push --force-reset

# Format Prisma schema
pnpm --filter support db:format

# Generate Prisma Client (after schema changes)
pnpm --filter support db:generate
```

---

## Running the Application

### Development Mode

```bash
# Start all apps and packages in watch mode
pnpm dev
```

This starts:

- Next.js dev server on `http://localhost:3000` (with Turbopack)
- Hot reload for all packages
- TypeScript and ESLint watch mode

### Development Mode (Web App Only)

```bash
# Start only the support app
pnpm --filter support dev
```

### Production Build

```bash
# Build all packages
pnpm build

# Build only support app
pnpm --filter support build

# Start production server
pnpm --filter support start
```

### Code Quality Checks

```bash
# Run all checks (lint, typecheck, format check)
pnpm validate

# Individual checks
pnpm lint              # ESLint
pnpm lint:fix          # ESLint with auto-fix
pnpm typecheck         # TypeScript type checking
pnpm format            # Format with Prettier
pnpm format:check      # Check formatting
```

---

## Development Workflow

This project uses **GitFlow** workflow with feature branches.

### Branch Structure

```
main          ← Production-ready code
develop       ← Integration branch for features
feature/*     ← Feature branches (from develop)
hotfix/*      ← Hotfix branches (from main)
release/*     ← Release preparation branches (from develop)
```

### Starting New Work

**1. Update your local develop:**

```bash
git checkout develop
git pull origin develop
```

**2. Create a feature branch:**

```bash
# Format: feature/ticket-number-or-description
git checkout -b feature/add-user-profile
```

**3. Make changes and commit:**

```bash
# Make your changes...
git add .
git commit -m "feat: add user profile page"
```

### Commit Message Convention

Follow conventional commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**

```bash
git commit -m "feat(auth): add OAuth2 Google provider"
git commit -m "fix(user): resolve pagination bug on user list"
git commit -m "docs: update setup guide with Docker instructions"
```

### Creating Pull Request

**1. Push your branch:**

```bash
git push origin feature/add-user-profile
```

**2. Create PR:**

- Go to GitHub/GitLab
- Create PR from `feature/add-user-profile` → `develop`
- Fill in PR template
- Request review

**3. PR Checklist:**

- [ ] Code follows project style guide
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm validate` passes
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if needed)

### Merging to Develop

After PR approval:

1. Squash and merge (recommended) or merge commit
2. Delete feature branch
3. Pull latest develop locally

### Handling Hotfixes

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Fix, commit, push, create PR to main
# After merge:
git checkout develop
git merge main
git push origin develop
```

### Pre-Commit Hooks

This project uses **lefthook** for git hooks:

- **Pre-commit:** Runs lint-staged (lints and formats changed files)
- **Commit-msg:** Validates commit message format via commitlint

Bypass hooks if needed (not recommended):

```bash
git commit --no-verify -m "message"
```

---

## Troubleshooting

### Database Issues

#### "Connection refused" or "ECONNREFUSED"

**Symptoms:**

```
Error: Cannot connect to database
Connection refused at localhost:5432
```

**Solutions:**

1. **Check Docker services:**

   ```bash
   docker-compose ps
   ```

2. **Start services if stopped:**

   ```bash
   docker-compose up -d
   ```

3. **Check if port is already in use:**

   ```bash
   # macOS/Linux
   lsof -i :5432

   # Kill process using port 5432
   kill -9 <PID>
   ```

4. **Verify DATABASE_URL in .env:**
   ```bash
   # Should match Docker credentials
   DATABASE_URL="postgresql://zilpo:zilpo123@localhost:5432/zilpo_admin?schema=public"
   ```

#### Migration Failed

**Symptoms:**

```
Error: P3006 Migration failed
```

**Solutions:**

1. **Reset database (development only):**

   ```bash
   pnpm --filter support db:push --force-reset
   pnpm --filter support db:seed
   ```

2. **Resolve migration conflict:**

   ```bash
   # Mark migration as applied (careful!)
   pnpm --filter support db:resolve --applied <migration-name>

   # Or mark as rolled back
   pnpm --filter support db:resolve --rolled-back <migration-name>
   ```

#### Prisma Client Not Generated

**Symptoms:**

```
Error: @prisma/client did not initialize yet
```

**Solution:**

```bash
pnpm --filter support db:generate
```

---

### Build & Dependency Issues

#### "Module not found" or Import Errors

**Symptoms:**

```
Error: Cannot find module '@/components/...'
Module not found: Can't resolve '@workspace/ui'
```

**Solutions:**

1. **Clean install:**

   ```bash
   rm -rf node_modules apps/*/node_modules packages/*/node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```

2. **Rebuild packages:**

   ```bash
   pnpm build
   ```

3. **Check tsconfig paths:**
   ```bash
   # Verify paths are configured correctly
   cat apps/support/tsconfig.json | grep paths
   ```

#### TypeScript Errors After Changes

**Symptoms:**

```
Type error: Property 'x' does not exist on type 'Y'
```

**Solutions:**

1. **Run typecheck to see full errors:**

   ```bash
   pnpm typecheck
   ```

2. **Restart TypeScript server:**
   - VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

3. **Clear Next.js cache:**
   ```bash
   rm -rf .next apps/support/.next
   ```

#### Port 3000 Already in Use

**Symptoms:**

```
Error: Port 3000 is already in use
```

**Solutions:**

1. **Find and kill process:**

   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9

   # Windows PowerShell
   Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess }
   ```

2. **Or use different port:**
   ```bash
   PORT=3001 pnpm dev
   ```

---

### Environment Issues

#### NEXTAUTH_SECRET Not Set

**Symptoms:**

```
Error: [next-auth][error][NO_SECRET]
```

**Solution:**

```bash
# Generate secret
openssl rand -base64 32

# Add to .env
NEXTAUTH_SECRET="<generated-secret>"
```

#### MinIO Connection Issues

**Symptoms:**

```
Error: Unable to reach MinIO server
```

**Solutions:**

1. **Check MinIO is running:**

   ```bash
   docker-compose ps minio
   curl http://localhost:9000/minio/health/live
   ```

2. **Verify bucket exists:**
   - Go to `http://localhost:9001`
   - Login and create bucket `zilpo-uploads`

3. **Check MINIO_ENDPOINT in .env:**
   ```bash
   MINIO_ENDPOINT="http://localhost:9000"  # Not 9001 (that's console)
   ```

---

### Common Gotchas

#### pnpm Version Mismatch

**Required:** pnpm >= 9.15.9

```bash
# Check version
pnpm --version

# Upgrade if needed
npm install -g pnpm@latest
```

#### Node.js Version Too Old

**Required:** Node.js >= 20

```bash
# Check version
node --version

# Use nvm to upgrade (Node Version Manager)
nvm install 20
nvm use 20
```

#### Docker Memory Issues (Mac)

**Symptoms:** Docker containers restart randomly

**Solution:**

1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase memory to at least 4GB

#### Turborepo Cache Issues

**Symptoms:** Old code runs despite changes

**Solution:**

```bash
# Clear Turborepo cache
rm -rf node_modules/.cache
pnpm dev --force
```

---

## Useful Commands

### Package Management

```bash
# Add dependency to support app
pnpm --filter support add <package>

# Add dev dependency
pnpm --filter support add -D <package>

# Add to workspace root
pnpm add -w -D <package>
```

### Git Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Stash changes
git stash
git stash pop

# View commit history
git log --oneline --graph --all
```

### Docker Commands

```bash
# Enter container shell
docker exec -it zilpo-postgres sh
docker exec -it zilpo-postgres psql -U zilpo -d zilpo_admin

# View container logs
docker logs zilpo-postgres -f

# Remove all unused Docker data
docker system prune -a --volumes
```

### Database Commands

```bash
# Backup database
docker exec zilpo-postgres pg_dump -U zilpo zilpo_admin > backup.sql

# Restore database
docker exec -i zilpo-postgres psql -U zilpo zilpo_admin < backup.sql

# Drop all tables
pnpm --filter support db:push --force-reset
```

---

## Default Credentials Summary

| Service     | Username        | Password      | URL                   |
| ----------- | --------------- | ------------- | --------------------- |
| App (Admin) | admin@pisky.dev | admin123      | http://localhost:3000 |
| PostgreSQL  | zilpo           | zilpo123      | localhost:5432        |
| MinIO       | minioadmin      | minioadmin123 | http://localhost:9001 |

---

## Getting Help

If you encounter issues not covered here:

1. Check the [README.md](../README.md) for project overview
2. Review error logs in detail
3. Search existing GitHub issues
4. Create a new issue with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Your environment (OS, Node version, pnpm version)
