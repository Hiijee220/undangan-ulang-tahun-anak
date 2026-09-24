# Undangan Ulang Tahun Anak

Undangan bertema pahlawan laba-laba untuk GitHub Pages. Ubah setiap teks, jadwal, lokasi, foto, musik, warna, dan bagian melalui `admin.html`.

## Publikasi

1. Buat repositori publik `Hiijee220/undangan-ulang-tahun-anak`.
2. Unggah seluruh berkas pada direktori ini ke akar branch `main`.
3. Di **Settings → Pages**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Undangan: `https://hiijee220.github.io/undangan-ulang-tahun-anak/`; admin: `/admin.html`.

## Admin Firebase

Proyek Firebase: `undangan-ulang-tahun-anak` (Spark). Aplikasi Web dan Google Sign-In sudah aktif, domain `hiijee220.github.io` sudah diizinkan. Cloud Firestore perlu dibuat di lokasi Jakarta dan aturan `firestore.rules` harus diterbitkan sebelum cabang ini digabungkan ke `main`.

Hanya akun Google terverifikasi `remajasilo.rs@gmail.com` yang boleh menulis dokumen `invitation/content`; semua tamu boleh membaca dokumen itu. Admin login dengan Google lalu klik **Simpan & perbarui undangan**. Tidak ada token GitHub di browser. `config.json` tetap menjadi cadangan saat Firestore belum berisi dokumen atau sementara tidak dapat diakses. Saat admin pertama kali menyimpan, data awal diambil dari `config.json`.

Foto hasil unggahan tersimpan sebagai data URL di dokumen Firestore. Total JSON dibatasi di bawah 950 KB agar sesuai batas ukuran dokumen. Foto, alamat, dan nomor WhatsApp yang diterbitkan adalah data publik. Tamu dapat memakai `?to=Nama%20Tamu` untuk sapaan. Musik harus memakai URL HTTPS berkas audio langsung.
