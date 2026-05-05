# UI Review — Naiera Support

Project: `/home/acn/ai/codes/bandanaiera/apps/naiera-support`
Date: 2026-05-05
Reviewer: Hermes

## 1. Scope

Review ini mencakup audit UI/UX komprehensif terhadap halaman-halaman utama di aplikasi Naiera Support, meliputi:

- Auth flow
- Dashboard/internal pages
- Admin/manage pages
- Public support pages
- Error and edge-case flows

## 2. Pendekatan Review

Review dilakukan dengan 3 lapisan evaluasi:

### 2.1 Codebase inventory

Semua route aktif dipetakan dari struktur `app/**/page.tsx` untuk memastikan review mencakup seluruh surface area utama aplikasi.

### 2.2 Runtime walkthrough

Halaman-halaman utama dibuka secara langsung melalui browser automation menggunakan Playwright fallback dengan Chromium `--no-sandbox` karena browser tool default gagal dijalankan pada environment Linux saat ini.

Untuk setiap halaman, dilakukan capture terhadap:

- HTTP status
- final URL
- page title
- heading utama (`h1`)
- tombol dan link utama
- console/runtime error
- screenshot full page

### 2.3 Heuristic evaluation

Evaluasi dilakukan berdasarkan prinsip berikut:

- visual consistency
- information hierarchy
- clarity of CTA
- state handling
- navigation and discoverability
- error UX
- runtime correctness yang berdampak langsung ke pengalaman pengguna

## 3. Halaman yang Direview

### Auth

- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

### Dashboard / Internal

- `/`
- `/tickets`
- `/tickets/[id]`
- `/tasks`
- `/apps`
- `/analytics`
- `/settings`
- `/profile`
- `/manage/users`
- `/manage/roles`
- `/manage/permissions`
- `/manage/system-settings`
- `/access-requests`

### Public / Support

- `/support/tickets/new?appSlug=e2e-support-app`
- `/support/tickets/[id]`
- `/support/error`
- `/integrated/view-tickets`

## 4. Executive Summary

Secara umum, aplikasi ini sudah memiliki fondasi produk yang baik:

- struktur route cukup lengkap
- shell dashboard sudah konsisten
- auth layout terasa modern
- area admin/manage sudah terorganisasi

Namun, kualitas UI/UX secara end-to-end masih tertahan oleh masalah runtime dan state management yang signifikan.

Temuan utama:

- beberapa flow publik yang kritikal masih rusak total
- analytics mengalami hydration mismatch
- banyak halaman internal tetap render tetapi memunculkan console error 500
- branding belum konsisten
- beberapa flow terlihat masih template-oriented dan belum sepenuhnya diproductize

Kesimpulan utama:

> Secara visual, produk sudah menuju arah yang benar. Namun dari sisi product UX, reliability dan state handling masih menjadi masalah terbesar, terutama pada public support flow yang justru paling sensitif terhadap trust pengguna.

## 5. Temuan Prioritas

## P0 — Critical / Blocker

### P0.1 Public ticket detail page rusak

- Route: `/support/tickets/[id]`
- Hasil runtime: status `500`
- Tampilan berakhir pada halaman `Something went wrong`
- Console error menunjukkan masalah React/Next boundary:
  - `Event handlers cannot be passed to Client Component props`

**Dampak:**

- user publik tidak dapat melihat detail tiket
- tracking status tiket gagal total
- trust pada portal support turun drastis

**Rekomendasi:**

- perbaiki boundary server/client component pada halaman public ticket detail
- pastikan tombol interaktif dipindah ke client component yang benar
- tambahkan error recovery yang benar-benar graceful

---

### P0.2 Public error page juga rusak

- Route: `/support/error`
- Hasil runtime: status `500`
- Error root cause sama dengan public ticket detail

**Dampak:**

- flow penanganan error gagal total
- pengguna yang seharusnya dibantu saat error justru melihat aplikasi crash

**Rekomendasi:**

- jadikan halaman error publik sesederhana mungkin
- hindari passing event handler dari server component ke client component
- tampilkan pesan yang human-readable dan CTA yang relevan

---

### P0.3 Integrated view flow berakhir ke error page yang juga rusak

- Route: `/integrated/view-tickets`
- Final URL runtime: `/support/error?error=MISSING_TOKEN`
- Halaman error berstatus `500`

**Dampak:**

- error handling untuk token/authorization issue tidak usable
- user tidak mendapat guidance untuk recovery

**Rekomendasi:**

- tampilkan error state eksplisit untuk `MISSING_TOKEN`
- sediakan CTA seperti:
  - kembali ke portal asal
  - minta link terbaru
  - hubungi admin

---

### P0.4 Analytics mengalami hydration mismatch

- Route: `/analytics`
- Console menangkap hydration error
- Terdapat mismatch nilai server vs client, contoh `54` vs `58`

**Dampak:**

- angka berubah setelah load
- trust terhadap dashboard analytics turun
- potensi layout shift dan flicker

**Rekomendasi:**

- hilangkan render angka non-deterministic pada SSR
- bila data client-only, render skeleton lalu fetch di client
- hindari `Math.random()`, `Date.now()`, atau transform data yang tidak sinkron SSR/client

---

### P0.5 Sign-up flow misleading

- Route yang diuji: `/sign-up`
- Hasil runtime mengarah ke tampilan/URL sign-in

**Dampak:**

- user tidak dapat memahami apakah registrasi tersedia atau tidak
- high confusion pada auth flow

**Rekomendasi:**

- bila self-registration dinonaktifkan, redirect ke halaman explanation yang jelas
- bila sign-up seharusnya aktif, perbaiki route render agar benar-benar menampilkan form registrasi

---

### P0.6 Banyak halaman internal menghasilkan error 500 di console

Terjadi pada beberapa halaman seperti:

- dashboard
- tickets
- ticket detail
- apps
- settings
- profile
- manage users/roles/permissions
- access requests
- analytics

**Dampak:**

- halaman tampak hidup tetapi sebagian data/widget kemungkinan gagal
- user dapat melihat UI setengah jadi atau informasi tidak lengkap
- reliability UX turun

**Rekomendasi:**

- audit semua subrequest/resource yang gagal
- setiap widget harus punya fallback/inline error state
- jangan mengandalkan page render sukses sebagai indikator UX sehat

## P1 — Major UX Issues

### P1.1 Branding belum konsisten

Temuan:

- auth shell menampilkan **Bandanaiera**
- banyak page title menampilkan **Sonar Support**

**Dampak:**

- identitas produk terasa belum final
- menurunkan persepsi trust dan polish

**Rekomendasi:**

- satukan naming di seluruh:
  - metadata title
  - auth branding
  - dashboard title
  - favicon/SEO labels

---

### P1.2 Auth layout terlalu dominan pada sisi visual dibanding form

Auth layout memiliki hero kiri yang cukup besar dan menarik, namun pada flow utilitarian seperti login/reset password, fokus utama seharusnya tetap pada form.

**Dampak:**

- form terasa sekunder
- scanning pengguna menjadi kurang efisien

**Rekomendasi:**

- kecilkan dominasi panel kiri di desktop
- perbesar prominence form card
- untuk mobile, prioritaskan konteks form sebelum elemen dekoratif

---

### P1.3 Heading kontekstual auth kurang dominan

Pada halaman seperti forgot/reset/verify, heading yang paling dominan tetap hero umum (`Kelola dukungan dengan lebih cepat`) dibanding konteks task aktual.

**Dampak:**

- pengguna harus membaca lebih jauh untuk memahami posisi flow

**Rekomendasi:**

- perkuat heading per halaman:
  - `Lupa kata sandi`
  - `Atur ulang kata sandi`
  - `Verifikasi email`
- gunakan hierarchy semantik yang lebih tepat

---

### P1.4 Struktur IA dashboard/admin/personal settings masih sedikit bercampur

Saat ini terdapat area seperti:

- `Settings`
- `Manage > System Settings`
- `Profile`
- `Access Requests`

**Dampak:**

- batas antara workspace settings, personal settings, dan admin settings belum sepenuhnya jelas

**Rekomendasi IA:**

- **Workspace**: Dashboard, Tickets, Tasks, Apps, Analytics
- **Administration**: Users, Roles, Permissions, Access Requests, System Settings
- **Personal**: Profile, Preferences

---

### P1.5 Public new ticket page belum menunjukkan struktur UX yang kuat

- Route: `/support/tickets/new?appSlug=e2e-support-app`
- Status `200`, namun runtime audit tidak mendeteksi heading/tombol utama secara jelas

**Interpretasi:**

- halaman kemungkinan kurang memiliki struktur semantik yang kuat
- atau visual hierarchy form belum cukup jelas

**Rekomendasi:**

- wajib ada:
  - H1 yang jelas
  - context aplikasi/tenant
  - CTA submit yang kuat
  - grouping field yang rapi
  - help text dan ekspektasi tindak lanjut

## P2 — Polish / Improvement Opportunities

### P2.1 Header actions masih terasa generik

Contoh action global yang muncul:

- Search
- Notifications
- avatar
- toggle sidebar
- Manage

**Masalah:**

- header belum terlalu contextual terhadap tugas utama per halaman

**Rekomendasi:**

- tampilkan CTA spesifik sesuai page context
  - Tickets: `New ticket`
  - Apps: `Create app`
  - Users: `Add user`

---

### P2.2 Profile/topbar identity composition belum rapi

Terdapat label yang terbaca seperti `Pisky DevDevelopment`, yang mengindikasikan nama, role, atau badge saling menempel tanpa separator yang baik.

**Rekomendasi:**

- pisahkan dengan visual badge atau line break
- tampilkan struktur jelas:
  - nama
  - role
  - environment/status badge

---

### P2.3 Debug logging masih bocor ke browser console

Contoh pada ticket detail ada log seperti:

- `All messages: []`

**Dampak:**

- console noisy
- indikasi debug residue di UI flow utama

**Rekomendasi:**

- hapus debug logs dari flow utama
- jika perlu, gunakan logger terkontrol hanya untuk dev/internal diagnostics

---

### P2.4 Beberapa halaman tampak masih shell-first, value hierarchy belum maksimal

Terutama pada halaman seperti Tasks dan sebagian area admin, shell dan navigasi sudah ada, namun belum selalu terlihat prioritas tindakan dan informasi yang paling penting.

**Rekomendasi:**

- tambahkan subheading/deskripsi singkat
- tampilkan primary task dari halaman secara lebih eksplisit
- pastikan ada empty/loading/success states yang jelas

## 6. Review per Area

## 6.1 Auth

**Kelebihan:**

- modern, clean, dan cukup premium
- copy produk sudah relevan dengan support workflow
- route auth utama sudah tersedia

**Catatan utama:**

- branding tidak konsisten
- sign-up flow membingungkan
- form context kalah dominan dari hero content

## 6.2 Dashboard

**Kelebihan:**

- shell layout konsisten
- sidebar dan struktur internal cukup matang
- CTA seperti `View All Tickets` sudah membantu orientasi

**Catatan utama:**

- ada console error 500
- topbar identity butuh perapihan
- perlu memastikan widget-widget benar-benar sehat, bukan hanya tampil

## 6.3 Tickets

**Kelebihan:**

- list dan detail tiket dapat diakses
- back navigation tersedia

**Catatan utama:**

- console 500 masih muncul
- debug logs bocor
- perlu memastikan hierarchy detail ticket kuat, terutama untuk metadata, timeline, dan action panel

## 6.4 Tasks

**Kelebihan:**

- halaman load relatif bersih

**Catatan utama:**

- terlihat belum terlalu menunjukkan task workflow yang kuat
- perlu memperjelas prioritas seperti assigned, overdue, linked-to-ticket, dsb.

## 6.5 Apps

**Kelebihan:**

- CTA `Create App` sudah jelas

**Catatan utama:**

- ada multiple 500 errors
- page ini perlu reliability tinggi karena menyangkut konfigurasi sistem/public integration

## 6.6 Analytics

**Masalah utama:**

- hydration mismatch adalah blocker kualitas UX

**Rekomendasi tambahan:**

- perjelas heading/hierarchy
- hindari data simulatif acak di SSR

## 6.7 Admin / Manage

**Kelebihan:**

- area users/roles/permissions/system settings terpisah dengan cukup logis
- CTA seperti `Add User` dan `Add Role` sudah jelas

**Catatan utama:**

- banyak console 500
- perlu memastikan halaman admin tetap ramah untuk operator non-teknis
- gunakan deskripsi singkat untuk membantu konteks tiap halaman

## 6.8 Public Support Flow

Ini adalah area dengan risiko UX tertinggi.

**Masalah utama:**

- create ticket page belum cukup terbaca strukturnya
- ticket detail publik rusak
- error page publik rusak
- integrated flow kehilangan trust karena handling token issue gagal total

**Kesimpulan untuk area publik:**

- ini harus menjadi prioritas fix pertama sebelum polish visual lainnya

## 7. Rekomendasi Next Steps

### Tahap 1 — Stabilization

1. Fix public error page
2. Fix public ticket detail page
3. Fix integrated missing-token flow
4. Fix analytics hydration mismatch
5. Audit dan perbaiki sumber 500 utama di halaman internal
6. Pastikan sign-up behavior jelas dan intentional

### Tahap 2 — UX Consistency

1. Samakan branding `Bandanaiera` vs `Sonar Support`
2. Rapikan IA dashboard/admin/personal settings
3. Perkuat semantic heading dan page-level context
4. Standardize empty/loading/error/success states

### Tahap 3 — Polish

1. Rapikan topbar identity and badges
2. Hilangkan debug logs dari browser
3. Tingkatkan contextual CTA per page
4. Perbaiki microcopy dan visual hierarchy di halaman publik

## 8. Penutup

Naiera Support sudah memiliki fondasi UI yang cukup baik dan struktur produk yang jelas. Namun kualitas pengalaman pengguna secara keseluruhan saat ini masih lebih banyak ditentukan oleh reliability state dan runtime correctness daripada oleh visual design itu sendiri.

Fokus paling penting saat ini bukan redesign besar, melainkan:

- memperbaiki flow publik yang rusak
- menghilangkan runtime error yang mengganggu UX
- memperjelas struktur pengalaman antara public, operator, dan admin

Bila tiga hal ini dibereskan, kualitas aplikasi akan naik signifikan bahkan tanpa perubahan visual besar.
