# naiera-support

Aplikasi support operations berbasis Next.js untuk ekosistem Bandanaiera/Naiera.

Project ini menggabungkan tiga kapabilitas utama dalam satu app:

- **Dashboard internal** untuk agent, admin, dan operator
- **Portal support publik** untuk submit dan memantau tiket
- **Integration endpoints** untuk aplikasi eksternal yang ingin membuat atau melihat tiket

## Gambaran fitur

- Authentication dengan **NextAuth v5**
- **RBAC** berbasis role + permission
- **Multi-app access**: user bisa di-assign ke app tertentu
- **Ticketing** multi-channel
- **Task management** / kanban untuk tindak lanjut internal
- **File upload** dengan S3-compatible storage (MinIO/AWS S3)
- **System settings** untuk branding dan konfigurasi publik
- **Email notifications** via Resend/React Email

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Prisma + PostgreSQL
- NextAuth v5 beta
- Tailwind CSS v4
- TanStack Query
- TanStack Table
- React Hook Form + Zod
- Jotai
- dnd-kit

## Struktur modul utama

```text
app/
  (auth)/                 Halaman login, signup, reset password
  (dashboard)/            Dashboard internal
  (public)/integrated/    Halaman publik untuk flow integrasi
  support/                Form tiket publik dan detail tiket publik
  api/                    Route handlers per domain

lib/
  auth/                   Konfigurasi auth dan permission guard
  rbac/                   Permission model/checker
  services/ticketing/     Service layer ticketing
  services/               Service domain lain
  file-upload/            Upload dan attachment handling
  storage/                MinIO / S3 integration
  validations/            Zod schemas

prisma/
  schema.prisma           Database schema utama
  seed-*.ts               Seeders untuk role, permission, admin, settings, ticketing
```

## Menjalankan aplikasi

Jalankan dari folder app ini:

```bash
pnpm install
pnpm dev
```

Default dev server app ini berjalan di:

```text
http://localhost:3200
```

## Scripts penting

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm format

pnpm db:push
pnpm db:migrate
pnpm db:seed
pnpm db:seed:fresh
pnpm db:seed:ticketing
pnpm db:studio
```

## Environment variables utama

Minimal yang perlu disiapkan:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/naiera_support"
NEXTAUTH_SECRET="replace-me"
NEXT_PUBLIC_APP_URL="http://localhost:3200"
MINIO_ACCESS_KEY="minio"
MINIO_SECRET_KEY="miniosecret"
```

Lihat validasi lengkap di:

- `lib/env.ts`

## Domain model singkat

### Internal dashboard

Dipakai untuk:

- melihat tiket
- mengelola users / roles / permissions
- mengelola app access
- mengelola task internal
- mengubah system settings

### Public support

Dipakai untuk:

- submit tiket baru
- melihat status tiket tertentu
- flow embed / public link

### Integrated support

Dipakai untuk:

- generate access token untuk external app
- submit tiket dari sistem lain
- melihat tiket customer dari external app

## Catatan arsitektur

- Route handlers di `app/api/*` bertindak sebagai adapter tipis
- Business logic utama dipusatkan di `lib/services/*`
- Permission checks dilakukan di helper server-side, bukan hanya middleware
- Prisma dipakai sebagai source of truth untuk auth, ticketing, tasking, dan settings

## Catatan penting

- App ini adalah **fullstack Next.js app**, bukan frontend terpisah
- Branding utama aplikasi telah disederhanakan menjadi `Sonar Support`, tetapi masih ada sedikit naming internal historis pada beberapa path komponen
- `next.config.ts` saat ini mengatur `typescript.ignoreBuildErrors = true`, jadi build belum fail saat type error masih ada

## Referensi tambahan

- Database setup: `prisma/README.md`
- Ticketing design notes: `docs/superpowers/specs/`
- Ticketing implementation plans: `docs/superpowers/plans/`
