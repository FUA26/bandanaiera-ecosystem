# Sonar Support Subtree Sync Guide

Panduan sinkronisasi dua arah antara:

- **Monorepo**: `bandanaiera` (subtree Sonar Support saat ini berada di path legacy: `apps/naiera-support`)
- **Repo terpisah Sonar Support**: `git@github.com:FUA26/sonar-support.git`

> Catatan konsistensi nama: gunakan istilah **Sonar Support** untuk produk/repo.
> Path `apps/naiera-support` masih dipakai sementara untuk kompatibilitas struktur monorepo saat ini.

## Setup satu kali (di monorepo)

```bash
cd /home/acn/ai/codes/bandanaiera

# Tambah remote jika belum ada
git remote add sonar-support git@github.com:FUA26/sonar-support.git
# atau update URL jika remote sudah ada
git remote set-url sonar-support git@github.com:FUA26/sonar-support.git

git fetch sonar-support
```

## Arah 1: Monorepo -> Sonar Support (publish perubahan Sonar Support dari monorepo)

Jalankan setelah perubahan Sonar Support di monorepo sudah di-commit pada branch aktif.

```bash
cd /home/acn/ai/codes/bandanaiera

# Push subtree Sonar Support ke repo sonar-support
git subtree push --prefix=apps/naiera-support sonar-support main
```

## Arah 2: Sonar Support -> Monorepo (ambil perubahan dari repo terpisah)

Jalankan saat ada commit baru di repo `sonar-support` yang ingin masuk lagi ke monorepo.

```bash
cd /home/acn/ai/codes/bandanaiera

git fetch sonar-support

# Merge perubahan Sonar Support kembali ke subtree path di monorepo
git subtree pull --prefix=apps/naiera-support sonar-support main
```

## Rekomendasi workflow tim

1. **Satu source of truth per task**:
   - Jika task dikerjakan di monorepo: commit di monorepo -> `subtree push` ke Sonar Support.
   - Jika task dikerjakan di repo Sonar Support: commit di sonar-support -> `subtree pull` ke monorepo.
2. Hindari edit paralel di kedua repo untuk file yang sama sebelum sync.
3. Selalu sync terbaru (`fetch` + pull/push) sebelum rilis.

## Verifikasi cepat

```bash
# di monorepo
cd /home/acn/ai/codes/bandanaiera
git log --oneline -n 5 -- apps/naiera-support

# di repo terpisah Sonar Support
cd /home/acn/ai/codes/sonar-support
git log --oneline -n 5
```

Jika top commit feature yang sama belum muncul di sisi lain, jalankan command sync yang sesuai.
