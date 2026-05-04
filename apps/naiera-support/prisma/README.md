# Database Setup Guide for naiera-support

Panduan ini menjelaskan setup database PostgreSQL untuk app `naiera-support`.

## Prerequisites

- PostgreSQL tersedia
- Node.js dan pnpm terpasang
- Dependency project sudah di-install

## Quick setup

### 1. Buat database

Contoh nama database:

```bash
createdb naiera_support
```

Atau jika memakai Docker/Postgres container:

```bash
docker exec -i naiera-postgres psql -U naiera -d postgres -c "CREATE DATABASE naiera_support;"
```

### 2. Siapkan environment

Buat `.env.local` dan isi minimal:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/naiera_support"
NEXTAUTH_SECRET="your-secret-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3200"
MINIO_ACCESS_KEY="minio"
MINIO_SECRET_KEY="miniosecret"
```

Catatan:

- default app port dari `package.json` adalah **3200**
- validasi env lengkap ada di `lib/env.ts`

### 3. Jalankan migration / push schema

Untuk development:

```bash
pnpm db:migrate
```

Jika hanya ingin mendorong schema tanpa migration file:

```bash
pnpm db:push
```

### 4. Seed data dasar

```bash
pnpm db:seed
```

Perintah ini akan menjalankan:

- `prisma/seed-permissions.ts`
- `prisma/seed-roles.ts`
- `prisma/seed-system-settings.ts`
- `prisma/seed-admin.ts`

### 5. Optional: seed fresh atau ticketing sample

```bash
pnpm db:seed:fresh
pnpm db:seed:ticketing
```

## Prisma schema

Schema utama berada di:

```text
prisma/schema.prisma
```

Domain utama di schema ini:

- auth / users / roles / permissions
- system settings dan branding
- ticketing
- task management
- file storage metadata
- app access / multi-tenant support

## Model penting

### User / Role / Permission

Dipakai untuk authentication, authorization, dan RBAC.

### App / Channel / Ticket

Dipakai untuk domain support multi-app dan multi-channel.

### Task / TaskComment / TaskActivity

Dipakai untuk tindak lanjut internal via task board / kanban.

### File

Dipakai untuk metadata file upload yang disimpan di MinIO/S3-compatible storage.

## Default seed behavior

Seed default akan membuat baseline untuk:

- permission
- role
- system settings
- admin user

Karena isi seed bisa berubah seiring evolusi produk, cek file berikut untuk nilai final:

- `prisma/seed-admin.ts`
- `prisma/seed-system-settings.ts`
- `prisma/seed-roles.ts`
- `prisma/seed-permissions.ts`

## Perintah berguna

```bash
pnpm db:studio
pnpm db:reset
pnpm db:push
pnpm db:migrate
pnpm db:seed
```

## Reset database

Jika ingin reset total di development:

```bash
pnpm db:reset
```

Jika database perlu dibuat ulang manual:

```bash
docker exec -i naiera-postgres psql -U naiera -d postgres -c "DROP DATABASE IF EXISTS naiera_support;"
docker exec -i naiera-postgres psql -U naiera -d postgres -c "CREATE DATABASE naiera_support;"
```

Lalu jalankan lagi:

```bash
pnpm db:migrate
pnpm db:seed
```

## Regenerate Prisma client

```bash
npx prisma generate
```

Atau dari workflow normal, Prisma client biasanya ikut terpakai otomatis saat command Prisma dijalankan.

## Troubleshooting

### Env invalid saat startup

Periksa `lib/env.ts` karena semua env divalidasi via Zod. Jika ada field wajib belum diisi, app akan gagal start.

### File upload gagal

Pastikan env storage tersedia:

- `MINIO_ENDPOINT`
- `MINIO_PORT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`

### Auth flow gagal

Pastikan minimal env berikut valid:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Catatan

Dokumen ini sengaja memakai istilah dan port yang sesuai dengan `naiera-support` saat ini. Bila ada perubahan naming produk atau port lokal, sinkronkan juga:

- `README.md`
- `package.json`
- `lib/env.ts`
- seed system settings
