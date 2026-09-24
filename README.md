# Undangan Ulang Tahun Anak

Undangan bertema pahlawan laba-laba untuk GitHub Pages. Ubah setiap teks, jadwal, lokasi, foto, musik, warna, dan bagian melalui `admin.html`.

## Publikasi

1. Buat repositori publik `Hiijee220/undangan-ulang-tahun-anak`.
2. Unggah seluruh berkas pada direktori ini ke akar branch `main`.
3. Di **Settings → Pages**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Undangan: `https://hiijee220.github.io/undangan-ulang-tahun-anak/`; admin: `/admin.html`.

## Admin

Buka `admin.html` pada perangkat pribadi. Hubungkan akun GitHub pada setiap sesi tab admin dengan fine-grained personal access token milik `Hiijee220`: pilih hanya repositori `undangan-ulang-tahun-anak`, izin `Contents: Read and write`, serta masa berlaku seperlunya. Token hanya tersimpan selama tab admin dibuka, sehingga Anda dapat menyimpan berkali-kali dalam satu sesi tanpa memasukkannya lagi. Token hilang ketika tab ditutup. Jangan masukkan token ke file repositori atau kirim melalui chat. Klik **Putuskan sambungan** untuk menghapusnya dari sesi.

Edit teks, jadwal, lokasi, foto, musik, warna, atau bagian yang ditampilkan. Konsep tersimpan lokal. Klik **Simpan & perbarui undangan** untuk memperbarui `config.json` secara langsung melalui GitHub API. GitHub Pages akan menerbitkan versi baru setelah build selesai. Cadangan `config.json` bisa diunduh. Jika perubahan dibuat dari perangkat lain, admin akan mencegah penimpaan tanpa sengaja.

GitHub Pages bersifat publik. Setiap foto, alamat, dan nomor WhatsApp di dalam `config.json` dapat dilihat pengunjung. Tamu bisa menggunakan tautan `?to=Nama%20Tamu` untuk sapaan yang disesuaikan. Konfirmasi hadir membuka WhatsApp, tanpa database. Musik harus memakai URL HTTPS berkas audio langsung, dan pemutaran otomatis memerlukan klik **Buka Undangan** sesuai kebijakan browser.
