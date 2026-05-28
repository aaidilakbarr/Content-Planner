# 🚀 Panduan Penggunaan & Fitur Lengkap Planner Hub

Selamat datang di **Planner Hub**, aplikasi perencana konten personal (*personal content planner*) modern yang dirancang khusus untuk kreator konten. Aplikasi ini dibangun dengan pendekatan **offline-first** (berjalan cepat tanpa koneksi internet menggunakan IndexedDB) dan didukung oleh antarmuka visual adaptif (*Light/Dark Mode*) yang sangat estetis.

Berikut adalah panduan lengkap mengenai fungsi seluruh fitur serta cara menggunakannya untuk melipatgandakan produktivitas pembuatan konten Anda.

---

## 🧭 Navigasi Utama (Sidebar)
Sidebar di sisi kiri adalah pusat kendali Anda untuk berpindah antar halaman visual:
1. **Dashboard**: Ringkasan performa, statistik, dan bagan analisis konten Anda.
2. **Kanban Board**: Papan interaktif bergaya Trello untuk memantau status produksi.
3. **Calendar View**: Kalender visual bulanan untuk manajemen tanggal tayang.
4. **Content List**: Tabel data lengkap untuk penyaringan (*filtering*) dan ekspor/impor data.
* **Info Database Offline**: Di bagian bawah sidebar, Anda dapat melihat total konten Anda saat ini serta progress penyelesaian konten langsung dari database lokal.

---

## 🎨 Penjelasan Detail Fitur & Fungsi

### 1. 📊 Dashboard Analitik & KPI
Dashboard adalah pusat informasi strategis Anda untuk melihat performa dan target pembuatan konten secara real-time.

* **KPI Stats (Top Cards)**: 
  - **Total Rencana**: Seluruh ide konten yang tersimpan di dalam aplikasi.
  - **Telah Terbit**: Jumlah konten yang sudah berstatus *Published* (Live di platform).
  - **Sedang Proses**: Konten dalam tahap *Draft* & *In-Progress*.
  - **Selesai Dijadwal**: Konten berstatus *Scheduled* (Siap tayang).
* **Target Volume Publikasi Mingguan**:
  - **Fungsi**: Memantau konsistensi rilis konten Anda per platform.
  - **Cara Pakai**: Klik **Atur Target** ⚙️ untuk memasukkan target mingguan Anda untuk setiap sosial media (Instagram, YouTube, TikTok, dll). Bar kemajuan akan terisi secara otomatis seiring Anda mengubah status konten menjadi *Published*.
* **Grafik Status & Distribusi**:
  - **Status Distribusi (Bar Chart)**: Menampilkan sebaran status pengerjaan konten Anda saat ini.
  - **Distribusi Platform (Pie Chart)**: Menganalisis sosial media mana yang paling sering Anda sasar.
* **Pilar Konten (Content Pillar Balance Pie Chart)**:
  - **Fungsi**: Membantu Anda memantau pilar topik (*Edukasi, Hiburan, Promosi, Personal*) agar konten tetap seimbang dan bervariasi.
* **KPI Performa: Target vs. Hasil Aktual (Views Chart)**:
  - **Fungsi**: Menampilkan grafik batang ganda (*Recharts*) yang membandingkan estimasi **Target Views** dengan **Actual Views** dari konten yang telah terbit. Membantu Anda mengevaluasi konten mana yang berhasil melampaui target.

---

### 2. 📋 Kanban Board (Interactive Drag-and-Drop)
Papan Kanban memudahkan Anda mengelola alur kerja produksi dari ide mentah hingga konten benar-benar tayang.

* **Fungsi Utama**:
  - **Kolom Alur Kerja**: Terdiri dari 4 tahap: **Draft** ➡️ **In Progress** ➡️ **Scheduled** ➡️ **Published**.
  - **Drag-and-Drop**: Seret kartu rencana konten dari satu kolom ke kolom lain untuk memperbarui status pengerjaannya secara instan.
  - **Quick Add**: Klik tombol **+** di bagian atas setiap kolom untuk membuat konten baru yang otomatis terisi dengan status kolom tersebut.

---

### 📅 3. Calendar View (Visual Scheduler)
Kalender interaktif bulanan untuk merancang strategi rilis konten secara terstruktur dan teratur.

* **Fungsi Utama**:
  - **Quick Add Tanggal**: Klik sel tanggal kosong mana saja untuk langsung membuat rencana konten baru dengan tanggal rilis yang otomatis terkunci pada tanggal tersebut.
  - **Penjadwalan Ulang Cepat**: Seret (*drag*) kartu konten dari satu tanggal ke tanggal lainnya untuk merestrukturisasi kalender rilis Anda secara instan.
  - **Identitas Platform**: Setiap sel konten pada kalender memiliki warna khas sesuai ikon platformnya (Instagram = Pink, YouTube = Merah, TikTok = Biru Muda, dll).

---

### 🗂️ 4. Content List (Database & Backup Toolbar)
Daftar data lengkap dalam bentuk tabel tabular yang dilengkapi kendali penuh atas manajemen basis data Anda.

* **Fungsi Utama**:
  - **Pencarian Global**: Cari konten berdasarkan judul, deskripsi, atau tag tertentu melalui kolom pencarian di navbar.
  - **Penyaringan Lanjutan**: Saring konten secara presisi berdasarkan platform atau status tertentu.
  - **Pencadangan Data (Export JSON)**: Klik **Ekspor Cadangan** untuk mengunduh seluruh data rencana konten Anda menjadi satu file `.json`. Sangat berguna untuk mengamankan data Anda.
  - **Pemulihan Data (Import JSON)**: Klik **Impor Cadangan** untuk mengunggah file `.json` cadangan lama Anda. Aplikasi akan langsung mengimpor seluruh data ke database lokal tanpa menghapus data baru.

---

### 📝 5. Content Modal (Form Editor Rencana & Metrik Performa)
Jendela pop-up editor tempat Anda menggodok ide konten secara mendalam.

* **Pilar Konten**: Pilih kategori pilar konten untuk melacak variasi topik Anda.
* **Cover Thumbnail**: Klik **Pilih File** untuk mengunggah gambar sampul konten Anda (aplikasi otomatis mengompresi dan menyimpannya secara offline dalam format Base64).
* **Target vs Hasil Performa**:
  - Saat konten dalam tahap pengerjaan, masukkan perkiraan **Target Views** dan **Target Likes**.
  - Begitu konten Anda terbit di platform nyata, ubah status rencana menjadi **Published** dan isilah kolom **Actual Views** dan **Actual Likes** untuk memicu visualisasi grafik di Dashboard.
* **Kategori & Tags**: Ketik kata kunci (tag) lalu tekan **Enter** atau koma untuk mengelompokkan konten dengan tagar estetik.
* **Catatan/Ide Pendukung**: Textarea luas untuk mencatat referensi riset, tautan pendukung, script narasi video, dsb.

---

## 🌓 Mode Tampilan Adaptif (Light vs Dark Mode)
Aplikasi ini mendukung **Mode Terang** dan **Mode Gelap** premium dengan transisi warna selembut sutra:
* **Mode Gelap (Dark Mode)**: Tampilan futuristik gelap berbasis neon glow, mengurangi ketegangan mata di malam hari.
* **Mode Terang (Light Mode)**: Desain bersih, kontras tinggi yang menawan, sangat nyaman digunakan di siang hari atau lingkungan terang.
* **Cara Berpindah**: Tekan tombol ikon Matahari/Bulan di pojok kanan atas Navbar untuk beralih secara instan!

---

*Planner Hub - Didukung oleh Penyimpanan Offline Lokal Aman (IndexedDB). Data Anda 100% milik Anda.*
