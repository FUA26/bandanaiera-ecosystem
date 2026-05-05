# UI Review Execution Checklist — Naiera Support

Source review: `UI_REVIEW_NAIERA_SUPPORT.md`
Project: `/home/acn/ai/codes/bandanaiera/apps/naiera-support`
Date: 2026-05-05

Dokumen ini mengubah temuan review menjadi checklist eksekusi yang bisa langsung dipakai tim dev/design.

---

## Cara pakai

- **Priority**
  - **P0**: blocker / wajib beres dulu
  - **P1**: major UX issue
  - **P2**: polish / improvement
- **Owner suggestion**
  - **FE**: frontend
  - **BE**: backend
  - **FD**: frontend + design
  - **FULLSTACK**: lintas FE/BE
- **Done when** = definisi selesai yang bisa diverifikasi

---

# Phase 1 — Stabilization / Blocker Fixes

## P0.1 Fix public ticket detail page

- Priority: P0
- Owner: FE / FULLSTACK
- Area: Public Support
- Route: `/support/tickets/[id]`

### Checklist

- [ ] Identifikasi komponen yang memicu error `Event handlers cannot be passed to Client Component props`
- [ ] Pisahkan server component dan client component dengan benar
- [ ] Pastikan tombol/aksi interaktif hanya hidup di client component
- [ ] Pastikan halaman detail tiket publik render sukses tanpa 500
- [ ] Pastikan data tiket utama tampil: title, status, deskripsi, timeline/reply jika ada
- [ ] Pastikan ada fallback bila tiket tidak ditemukan atau token tidak valid

### Done when

- [ ] Route membuka halaman detail tiket tanpa status 500
- [ ] Console tidak memunculkan error boundary terkait event handler
- [ ] User publik bisa membaca status tiket dengan jelas

---

## P0.2 Fix public error page

- Priority: P0
- Owner: FE
- Area: Public Support
- Route: `/support/error`

### Checklist

- [ ] Sederhanakan halaman error agar tidak bergantung pada boundary yang bermasalah
- [ ] Hilangkan pola passing event handler dari server ke client component
- [ ] Tampilkan pesan error yang human-readable
- [ ] Tambahkan CTA yang relevan: kembali, coba lagi, hubungi admin
- [ ] Uji beberapa query/error state seperti `?code=UNKNOWN` dan `?error=MISSING_TOKEN`

### Done when

- [ ] Halaman error publik render normal tanpa 500
- [ ] Pesan error dapat dimengerti user non-teknis
- [ ] Tersedia minimal 1 recovery action yang jelas

---

## P0.3 Fix integrated view missing-token flow

- Priority: P0
- Owner: FULLSTACK
- Area: Public / Integration
- Route: `/integrated/view-tickets`

### Checklist

- [ ] Verifikasi alur redirect saat token tidak tersedia
- [ ] Tampilkan halaman error yang eksplisit untuk kasus `MISSING_TOKEN`
- [ ] Tulis copy yang menjelaskan masalah dan langkah berikutnya
- [ ] Tambahkan CTA: kembali ke portal asal / minta link terbaru / hubungi admin
- [ ] Uji flow tanpa token, token invalid, token expired bila relevan

### Done when

- [ ] User tidak melihat crash page saat token hilang
- [ ] Error state menjelaskan masalah secara jelas
- [ ] Flow recovery tersedia dan dapat diklik

---

## P0.4 Fix analytics hydration mismatch

- Priority: P0
- Owner: FE / FULLSTACK
- Area: Dashboard Analytics
- Route: `/analytics`

### Checklist

- [ ] Identifikasi source nilai yang berubah antara SSR dan client
- [ ] Hapus penggunaan nilai non-deterministic saat SSR (`Math.random`, `Date.now`, dsb.)
- [ ] Bila data client-only, ganti render awal dengan skeleton/loading state
- [ ] Pastikan summary cards tidak berubah angka setelah hydration kecuali memang fetch baru ditampilkan secara jelas
- [ ] Tambahkan heading utama (`h1`) yang jelas bila belum ada

### Done when

- [ ] Tidak ada hydration mismatch di console
- [ ] Angka/stat card stabil saat page load
- [ ] Halaman analytics punya hierarchy heading yang jelas

---

## P0.5 Clarify sign-up behavior

- Priority: P0
- Owner: FE / Product
- Area: Auth
- Route: `/sign-up`

### Checklist

- [ ] Tentukan keputusan produk: self-registration aktif atau tidak
- [ ] Bila nonaktif, tampilkan explanation page/redirect yang jelas
- [ ] Bila aktif, pastikan form sign-up render normal
- [ ] Pastikan CTA dari sign-in ke sign-up sesuai behavior final
- [ ] Uji ulang route `/sign-up` secara langsung

### Done when

- [ ] `/sign-up` berperilaku sesuai keputusan produk
- [ ] Tidak ada redirect membingungkan ke sign-in tanpa konteks
- [ ] User memahami apa yang harus dilakukan untuk mendapatkan akses

---

## P0.6 Audit and fix repeated 500 errors on internal pages

- Priority: P0
- Owner: FULLSTACK
- Area: Dashboard/Internal
- Routes:
  - `/`
  - `/tickets`
  - `/tickets/[id]`
  - `/apps`
  - `/settings`
  - `/profile`
  - `/manage/users`
  - `/manage/roles`
  - `/manage/permissions`
  - `/manage/system-settings`
  - `/access-requests`

### Checklist

- [ ] Petakan semua request/resource yang menghasilkan 500 di tiap halaman
- [ ] Kelompokkan error berdasarkan endpoint atau widget
- [ ] Perbaiki endpoint/query yang gagal
- [ ] Tambahkan inline error state per widget bila data gagal dimuat
- [ ] Pastikan halaman tetap usable walau satu widget gagal
- [ ] Uji ulang semua route utama setelah fix

### Done when

- [ ] Console halaman utama bersih dari 500 yang berulang
- [ ] Widget yang gagal punya fallback state yang jelas
- [ ] Halaman tetap usable dan informatif

---

# Phase 2 — UX Consistency Improvements

## P1.1 Samakan branding product

- Priority: P1
- Owner: FD
- Area: Global

### Checklist

- [ ] Tentukan brand final yang dipakai di app
- [ ] Samakan metadata title di seluruh halaman
- [ ] Samakan auth branding, dashboard branding, dan label browser tab
- [ ] Review favicon/nama aplikasi bila perlu

### Done when

- [ ] Tidak ada campuran `Bandanaiera` dan `Sonar Support` tanpa alasan yang jelas
- [ ] Branding konsisten di auth, dashboard, dan public pages

---

## P1.2 Rebalance auth layout hierarchy

- Priority: P1
- Owner: FD
- Area: Auth

### Checklist

- [ ] Kurangi dominasi panel kiri pada desktop
- [ ] Tingkatkan fokus visual card/form
- [ ] Pastikan heading form lebih mudah discan daripada hero copy
- [ ] Review layout mobile agar form tetap prioritas utama

### Done when

- [ ] User bisa memahami task auth utama dalam 1 glance
- [ ] Form menjadi fokus utama tanpa kehilangan aesthetic layout

---

## P1.3 Perjelas heading per halaman auth

- Priority: P1
- Owner: FE / Design
- Area: Auth

### Checklist

- [ ] Tambahkan/tebalkan heading spesifik untuk `forgot-password`
- [ ] Tambahkan/tebalkan heading spesifik untuk `reset-password`
- [ ] Tambahkan/tebalkan heading spesifik untuk `verify-email`
- [ ] Pastikan hierarchy semantik `h1/h2` masuk akal

### Done when

- [ ] Tiap halaman auth jelas konteksnya tanpa harus membaca banyak teks
- [ ] Heading semantik mendukung aksesibilitas dan scanning

---

## P1.4 Rapikan information architecture dashboard/admin/personal

- Priority: P1
- Owner: Product / Design / FE
- Area: Navigation

### Checklist

- [ ] Kelompokkan nav ke kategori yang lebih jelas
- [ ] Pisahkan area Workspace, Administration, dan Personal
- [ ] Review ulang penempatan `Settings`, `Profile`, `System Settings`, `Access Requests`
- [ ] Pastikan label menu mudah dimengerti oleh admin non-teknis

### Done when

- [ ] User paham ke mana harus pergi untuk task personal vs admin vs operasional
- [ ] Navigasi lebih mudah dipelajari pertama kali

---

## P1.5 Perkuat public new ticket page

- Priority: P1
- Owner: FD
- Area: Public Support
- Route: `/support/tickets/new`

### Checklist

- [ ] Tambahkan H1 yang jelas
- [ ] Tampilkan context aplikasi/tenant secara eksplisit
- [ ] Pastikan CTA submit terlihat menonjol
- [ ] Rapikan grouping field form
- [ ] Tambahkan helper text terkait response expectation / langkah berikutnya
- [ ] Tambahkan success state yang meyakinkan setelah submit

### Done when

- [ ] Halaman bisa discan cepat oleh user publik
- [ ] CTA submit jelas
- [ ] Setelah submit, user tahu apa yang terjadi berikutnya

---

# Phase 3 — Product Polish

## P2.1 Buat header actions lebih contextual

- Priority: P2
- Owner: FE / Design
- Area: Dashboard

### Checklist

- [ ] Tentukan primary action per halaman utama
- [ ] Tampilkan CTA relevan di header atau page header
- [ ] Minimalkan action generik yang tidak membantu task utama

### Done when

- [ ] Tiap halaman punya aksi utama yang jelas
- [ ] Header terasa membantu, bukan hanya dekoratif

---

## P2.2 Rapikan topbar identity chip

- Priority: P2
- Owner: FE / Design
- Area: Dashboard global header

### Checklist

- [ ] Pisahkan nama user, role, dan badge/status dengan visual separator yang jelas
- [ ] Hindari label concatenated seperti `Pisky DevDevelopment`
- [ ] Uji tampilan untuk nama panjang dan role panjang

### Done when

- [ ] Identitas user mudah dibaca
- [ ] Tidak ada label bertabrakan atau menempel

---

## P2.3 Bersihkan debug logging dari browser

- Priority: P2
- Owner: FE
- Area: Multiple pages

### Checklist

- [ ] Cari semua `console.log` debug yang bocor ke flow UI utama
- [ ] Hapus log yang tidak perlu
- [ ] Bila perlu logging dev, bungkus dengan guard/dev logger

### Done when

- [ ] Console tidak noisy untuk flow utama
- [ ] Debugging tetap bisa dilakukan tanpa mengganggu QA/UI review

---

## P2.4 Standardize page states

- Priority: P2
- Owner: FD
- Area: Global components

### Checklist

- [ ] Buat pola loading skeleton yang konsisten
- [ ] Buat pola empty state yang konsisten
- [ ] Buat pola inline error state yang konsisten
- [ ] Buat pola success feedback/toast yang konsisten
- [ ] Terapkan minimal ke tickets, apps, users, roles, permissions

### Done when

- [ ] State UI seragam lintas halaman
- [ ] Pengalaman terasa lebih matang dan predictable

---

# QA Regression Checklist

Gunakan checklist ini setelah fase fix utama selesai.

## Auth

- [ ] `/sign-in` render benar
- [ ] `/sign-up` sesuai keputusan produk
- [ ] `/forgot-password` jelas dan usable
- [ ] `/reset-password` jelas dan usable
- [ ] `/verify-email` jelas dan usable

## Dashboard/Internal

- [ ] `/` tanpa error kritis
- [ ] `/tickets` tanpa 500 di console
- [ ] `/tickets/[id]` tanpa debug leak
- [ ] `/tasks` punya hierarchy yang jelas
- [ ] `/apps` tanpa error data utama
- [ ] `/analytics` tanpa hydration mismatch
- [ ] `/settings` tanpa 500 berulang
- [ ] `/profile` tanpa 500 berulang
- [ ] `/manage/users` tanpa 500 berulang
- [ ] `/manage/roles` tanpa 500 berulang
- [ ] `/manage/permissions` tanpa 500 berulang
- [ ] `/manage/system-settings` tanpa 500 berulang
- [ ] `/access-requests` tanpa 500 berulang

## Public

- [ ] `/support/tickets/new` punya heading, CTA, dan structure yang jelas
- [ ] `/support/tickets/[id]` render normal
- [ ] `/support/error` render normal
- [ ] `/integrated/view-tickets` punya handling error yang benar

---

# Suggested Team Split

## Frontend first

- [ ] P0.1 Fix public ticket detail boundary issue
- [ ] P0.2 Fix public error page
- [ ] P0.4 Fix analytics hydration mismatch
- [ ] P1.2 Rebalance auth layout hierarchy
- [ ] P1.3 Improve auth page headings
- [ ] P2.2 Fix topbar identity chip
- [ ] P2.3 Remove debug logging
- [ ] P2.4 Standardize page states

## Fullstack / Backend-assisted

- [ ] P0.3 Fix integrated missing-token flow
- [ ] P0.6 Fix repeated 500 sources on internal pages
- [ ] P1.5 Strengthen public new ticket page if backed by missing data contracts

## Product / Design alignment

- [ ] P0.5 Decide sign-up product behavior
- [ ] P1.1 Finalize consistent branding
- [ ] P1.4 Rework navigation IA
- [ ] P2.1 Define contextual primary actions per page

---

# Definition of Success

Checklist ini dianggap sukses bila:

- [ ] semua public support flow penting bisa dipakai tanpa crash
- [ ] analytics tidak mengalami hydration mismatch
- [ ] halaman utama internal bersih dari 500 yang mengganggu UX
- [ ] branding konsisten
- [ ] auth dan public pages lebih jelas secara hierarchy
- [ ] UI states lebih matang dan konsisten lintas halaman
