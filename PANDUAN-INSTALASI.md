# Panduan Instalasi — Acc Cell WebApp

Link Bio Interaktif + Katalog Smartphone · Cabang Nabire & Serui
Frontend (GitHub Pages) ⇄ Google Apps Script (REST API) + Google Sheets + Google Drive

> © Nabire Kreatif — template berlisensi. Berkas `js/config.js` bebas diedit. Berkas lain **disegel**: bila diubah, halaman akan terkunci.

---

## Isi paket

| Berkas | Untuk apa |
|---|---|
| `acc-cell-frontend.zip` | Website (diunggah ke GitHub Pages). `index.html` ada langsung di dalam ZIP. |
| `Kode.gs`, `Notifikasi.gs`, `CRM.gs`, `Migrasi.gs` | Backend. Ditempel ke editor Google Apps Script. |
| `appsscript.json` | Manifest backend (zona waktu Jayapura + izin akses). |
| `PANDUAN-INSTALASI.md` | Panduan ini. |
| `nk-protect.js` | Khusus penjual (Nabire Kreatif), untuk menyegel ulang bila template diedit. |

---

## 1. Pasang backend (Google Apps Script)

1. Buka **https://script.google.com** → **Proyek baru**. Beri nama, misalnya `Acc Cell Backend`.
2. Ganti isi `Code.gs` dengan seluruh isi **Kode.gs**. Ganti juga nama berkasnya menjadi `Kode`.
3. Klik **＋ → Skrip** tiga kali untuk membuat `Notifikasi`, `CRM`, dan `Migrasi`. Tempel isi berkas yang sesuai ke masing-masing.
4. Buka **Setelan proyek** (ikon roda gigi) → centang **Tampilkan file manifes "appsscript.json"**. Kembali ke Editor, buka `appsscript.json`, lalu tempel isi **appsscript.json**.
5. Simpan dengan Ctrl+S.
6. Di dropdown fungsi, pilih **`setupAplikasi`** → klik **▶ Jalankan**.
   - Klik **Tinjau izin** → pilih akun Google Anda → **Lanjutan** → **Buka (tidak aman)** → **Izinkan**. Ini normal untuk skrip buatan sendiri.
   - Buka **Log eksekusi**. Di sana tercatat **username `superadmin` dan sandi awal**. Catat sandi itu. Sandi ini hanya muncul di log dan wajib diganti saat login pertama.
   - Setup otomatis membuat folder **📁 Acc Cell WebApp** di Drive (berisi database Sheets dan folder gambar), mengisi **data contoh** (12 produk dengan foto, 3 slide, rekening contoh, QRIS contoh), dan memasang pemicu otomatis tiap 1 menit.
   - `setupAplikasi()` aman dijalankan ulang. Fungsi ini hanya menambahkan yang belum ada, tanpa menggandakan data.
7. **Deploy** → **Deployment baru** → ikon roda gigi → **Aplikasi web**:
   - *Jalankan sebagai*: **Saya**
   - *Yang memiliki akses*: **Siapa saja**
   - Klik **Deploy**, lalu **salin URL yang berakhiran `/exec`**.

> ⚠️ Setiap kali kode backend diubah: **Deploy → Kelola deployment → ✏️ Edit → Versi: Versi baru → Deploy**. Jangan membuat "Deployment baru", karena URL-nya akan berubah dan website berhenti tersambung.

---

## 2. Hubungkan frontend

1. Ekstrak `acc-cell-frontend.zip`. **Folder hasil ekstrak itulah folder proyek**: di dalamnya langsung terlihat `index.html`, `css/`, `js/`, dan `assets/`.
2. Buka `js/config.js` dengan Notepad, lalu tempel URL `/exec` di antara tanda kutip:
   ```js
   GAS_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
   NAMA_USAHA: 'Acc Cell',
   ```
3. Simpan. Bila `GAS_URL` kosong, website tetap tampil dalam **mode demo** memakai data contoh bawaan.

---

## 3. Unggah ke GitHub Pages (lewat terminal)

> Jangan memakai tombol "Upload files" di web GitHub, karena struktur folder `css/` dan `js/` akan rusak.

1. Pasang Git: https://git-scm.com/download/win (pengaturan bawaan). Buka **PowerShell**.
2. Atur identitas Git (cukup sekali seumur komputer):
   ```bash
   git config --global user.name "Nama Anda"
   git config --global user.email "email-github@anda.com"
   ```
3. Di github.com: **＋ → New repository** → beri nama `acc-cell` → pilih **Public** → **jangan** centang README → **Create**.
4. Masuk ke folder hasil ekstrak (yang berisi `index.html`):
   ```bash
   cd "C:\Users\NamaAnda\Downloads\acc-cell-frontend"
   dir
   ```
   Pastikan `index.html` terlihat di daftar. Bila yang terlihat justru sebuah folder, masuk dulu ke folder itu dengan `cd`.
5. Kirim ke GitHub, satu perintah per baris:
   ```bash
   git init
   git add .
   git commit -m "Upload pertama Acc Cell"
   git branch -M main
   git remote add origin https://github.com/USERNAME/acc-cell.git
   git push -u origin main
   ```
   Saat diminta **Password**, tempel **Personal Access Token**, bukan sandi akun GitHub. Buat tokennya di https://github.com/settings/tokens → *Generate new token (classic)* → centang **repo**. Saat token ditempel, layar memang terlihat kosong; itu normal.
6. Di repo GitHub: **Settings → Pages → Deploy from a branch → main → / (root) → Save**. Centang **Enforce HTTPS**.
7. Tunggu 1–2 menit. Website tampil di `https://USERNAME.github.io/acc-cell/`.

**Update berikutnya:**
```bash
git add .
git commit -m "Perbarui"
git push
```
Bila yang tampil masih versi lama, tekan **Ctrl+Shift+R**.

---

## 4. Langkah pertama setelah online

1. Buka `…/#/admin`, lalu login sebagai `superadmin` dengan sandi dari Log. Anda akan diminta mengganti sandi.
2. **Rekening & QRIS** → ganti semua data **CONTOH** dengan rekening dan QRIS asli toko. Unggah gambar QRIS asli. Ini penting untuk mencegah penipuan.
3. **Cabang & Sosmed** → periksa alamat, nomor WA admin (Nabire 082197649558, Serui 081248245606), dan link Google Maps. Untuk peta mini: Google Maps → Bagikan → Sematkan peta → Salin HTML → tempel.
4. **Admin & Akses** → buat akun **admin_nabire** dan **admin_serui** (isi nomor WA agar ikut menerima notifikasi). Admin cabang hanya bisa mengelola produk cabangnya sendiri.
5. **Produk** → hapus produk contoh atau ganti dengan foto asli. Foto otomatis dikompres sebelum diunggah ke Drive.
6. **Profil & Urutan** → atur nama, tagline, kartu promo, dan urutan bagian link bio.
7. **Pop-up Promo** dan **Slide Hero** → atur promo. Pop-up bisa dinyalakan atau dimatikan kapan saja.
8. Pasang link website di bio TikTok, Instagram, Facebook, dan WhatsApp Business.

---

## 5. Reset data contoh & reset sandi superadmin (lewat backend)

Keduanya **hanya** bisa dijalankan dari editor Apps Script. Tidak ada tombol di website.

| Kebutuhan | Fungsi yang dijalankan (▶) | Hasil |
|---|---|---|
| Mengisi ulang data contoh | **`jalankanResetDataContoh`** | Produk, slide, rekening, layanan, dan statistik diganti data contoh. **Akun admin, cabang, sosmed, dan pengaturan utama tidak diubah.** |
| Lupa sandi superadmin | **`resetPasswordSuperadmin`** | Sandi sementara tampil di **Log eksekusi**, semua sesi lama dicabut, dan sandi wajib diganti saat login. |
| Menentukan sendiri sandi sementara | Setelan proyek → **Properti skrip** → tambah `SUPERADMIN_SANDI_BARU` = sandi pilihan, lalu jalankan `resetPasswordSuperadmin` | Properti otomatis dihapus setelah dipakai. |
| Lupa sandi admin cabang | Dasbor superadmin → **Admin & Akses → Reset** | Admin tersebut wajib mengganti sandi saat login. |
| Pemicu hilang / antrean WA macet | **`pasangTrigger`** | Pemicu 1 menit dipasang ulang. |
| Data publik belum berubah | **`bersihkanCache`** | Cache dikosongkan sehingga data langsung dimuat ulang. |

---

## 6. Notifikasi WhatsApp (Fonnte) & Email

1. Daftar di **fonnte.com** → **Device** → scan QR dengan nomor WA toko → salin **token**.
2. Dasbor → **WhatsApp & Notifikasi → ⚙️ Konfigurasi** → tempel token → **Cek Perangkat** (harus `connect`) → **Kirim Tes WA** → nyalakan saklar WhatsApp → **Simpan**. Token disimpan aman di server dan tidak pernah tampil ke pengunjung.
3. Email: nyalakan saklar Email → **Kirim Tes**. Kuota Gmail biasa sekitar 100 email/hari.
4. **Matriks notifikasi otomatis**: atur kejadian mana yang dikirim lewat WA dan/atau email, beserta isi pesannya:
   - Admin login (keamanan)
   - Admin cabang menambah produk
   - Produk ditandai HABIS
   - Pop-up promo dinyalakan
   - Sandi admin direset
   - Ringkasan mingguan setiap Senin pagi (kunjungan, klik WA Nabire vs Serui, produk paling ditanyakan)
5. **📣 Blast WhatsApp** (promo ke pelanggan): pilih sasaran (segmen/tag CRM atau tempel nomor) → **Deteksi Nomor WA** → tulis pesan (`{nama}`, `{toko}`, `{link}`) → pilih batch **10/20/50** dan jeda → **Mulai Blast**. Server tetap mengirim 1 batch per menit walau halaman ditutup.
   - **Tips anti-blokir:** pakai nomor yang sudah lama aktif, mulai dengan batch 10, jeda acak `3-8` detik, tambahkan "Balas STOP untuk berhenti", dan jangan kirim tautan yang sama ke ratusan orang dalam satu jam.

## 7. CRM Kontak

- **Sinkron** otomatis memasukkan tim admin. Pelanggan masuk lewat **Import CSV** (kolom `nama, wa, email, segmen, tag`; ada template) atau **Tambah Kontak**. Nomor 62/+62 otomatis diubah jadi 08, dan kontak ganda dilewati sehingga import aman diulang.
- Kartu KPI bisa diklik sebagai filter: WA terverifikasi, belum dicek, opt-out, duplikat.
- Aksi massal: deteksi WA, beri tag, **Blast ke terpilih**, opt-out/opt-in, gabungkan duplikat, hapus, dan ekspor CSV.
- Kontak **opt-out** tidak pernah ikut blast.

## 8. Migrasi data dari app/katalog lama

Dasbor → **Migrasi Data** → tempel URL spreadsheet lama → pilih data → **Pindai (Dry-run)** → periksa angka → **Jalankan Import**.
- Spreadsheet lama hanya **dibaca**, tidak diubah.
- Kolom dikenali dari nama header, termasuk variasinya: "Nama Produk", "Harga Jual", "Lokasi", "Stok", "Foto", dan lainnya.
- Import ulang tidak membuat data dobel. Jalankan sekali lagi tepat sebelum pindah untuk menangkap data terbaru.
- Gunakan **akun Google yang sama** agar foto Drive lama tetap tampil.
- Tersedia juga **Import produk dari CSV** (ada template).

## 9. Pasang sebagai aplikasi (PWA)

- Android/Chrome: muncul kartu **"Pasang Aplikasi Acc Cell"**. Ketuk **Pasang**.
- iPhone: kartu berisi petunjuk *Bagikan → Tambah ke Layar Utama*.
- Kartu **hilang otomatis** setelah aplikasi terpasang, atau setelah diklik/ditutup sekali, dan tidak muncul lagi.

## 10. Lisensi template (Nabire Kreatif)

- Domain yang belum berlisensi tampil dalam **mode DEMO**: ada pita "DEMO" dan bilah *Beli Lisensi / Aktifkan Lisensi*. Semua fitur tetap berjalan.
- Cara aktivasi: buka **`domain-anda/#key`** atau dasbor → menu **Lisensi**, lalu masukkan kode `NK-XXXX-XXXX`. Cukup **sekali per domain**; setelah itu semua pengunjung tidak diminta kode lagi.
- Setelah berlisensi, footer berubah menjadi **"© 2026 Acc Cell. by Nabirekreatif.com"** (nama diambil dari `NAMA_USAHA` di `config.js`).
- **Jangan** mengubah berkas selain `js/config.js`, dan jangan menghapus atau menutupi hak cipta. Halaman akan **terkunci**.
- Wajib HTTPS (GitHub Pages sudah HTTPS). Bila memakai Cloudflare, matikan *Auto Minify* dan *Rocket Loader* karena bisa memicu kunci yang keliru.

---

## Pemecahan masalah

| Gejala | Penyebab & solusi |
|---|---|
| Situs 404 di GitHub Pages | `index.html` tidak berada di root repo. Ulangi `git init` dari folder yang berisi `index.html`. |
| "Data belum bisa dimuat" | `GAS_URL` salah, deploy belum *Versi baru*, atau akses deploy bukan "Siapa saja". |
| "Backend belum disiapkan" | Jalankan `setupAplikasi()`. |
| Login terkunci 15 menit | Lima kali salah sandi. Tunggu, atau superadmin melakukan reset. |
| Gambar gagal diunggah | Kebijakan Google Workspace melarang berbagi publik. Minta admin Workspace mengizinkan berbagi "Siapa saja yang memiliki link". |
| WA tidak terkirim | Cek token dan status perangkat Fonnte (harus `connect`), lihat tab **Antrean**, lalu jalankan `pasangTrigger()`. |
| Halaman terkunci "Template tidak berlisensi" | Ada berkas tersegel yang diubah, atau hosting mengubah berkas. Unggah ulang berkas asli. |

## Batasan yang perlu diketahui

- **Foto produk contoh** memakai gambar dari referensi desain Google Stitch yang di-hosting Google. Ganti dengan foto asli toko dari dasbor, karena tautan contoh tidak dijamin selamanya.
- Pengiriman WA bergantung pada status perangkat Fonnte. Balasan WA dari pelanggan tidak tercatat otomatis.
- Pencabutan lisensi berlaku paling lambat 24 jam kemudian. Proteksi di browser mempersulit pembajakan, tetapi tidak 100% anti-bobol.
