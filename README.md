# 🎌 KanaDrill — Japanese Kana Speed & Accuracy Reading Drill

Aplikasi web modern untuk melatih refleks membaca cepat dan akurat huruf **Hiragana** dan **Katakana** bahasa Jepang tanpa proses mengeja yang lambat.

---

## ✨ Fitur Utama

- **⚡ 4 Preset Latihan Siap Pakai**:
  - **Hiragana Dasar**: 46 huruf Gojuuon dasar untuk pemula.
  - **JLPT N5 Core**: Gojuuon, Dakuon, dan Handakuon dengan kosakata nyata.
  - **Katakana Serapan**: Katakana, Chouon, dan Tokushuon serapan asing modern.
  - **Master Speed Drill**: Kombinasi lengkap seluruh aksara dan 7 kategori kana.
- **🎯 3 Mode Peracikan Soal**:
  - *Campuran (Hybrid)*: Kombinasi kosakata riil dan kombinasi huruf acak.
  - *Kosakata Nyata (Vocab)*: Kosakata 2-4 kana dari kamus bahasa Jepang.
  - *Huruf Acak (Random)*: Melatih murni pengenalan refleks karakter.
- **⏱️ Stopwatch Presisi per Soal**: Pengukuran waktu independen per soal (10 soal × 10 token = 100 token/sesi).
- **🔥 Combo Streak & Efek Suara**: Gamifikasi live streak dengan audio synthesizer bawaan (*Web Audio API*).
- **📊 Layar Hasil & Analisis Kecepatan**:
  - Dynamic Performance Rank (**S+ Divine Reflex**, **S**, **A**, **B**, **C**).
  - Grafik batang visual perbandingan kecepatan 10 soal.
  - Tinjauan kesalahan dengan fitur **1-Klik Latih Token Salah** (*Targeted Drill*).
  - Tombol **Salin Skor** untuk berbagi hasil ke media sosial.
- **📈 Riwayat & Statistik Seumur Hidup**: Tersimpan otomatis di LocalStorage (Total sesi, Total waktu, Best CPM, Rata-rata akurasi).
- **🌓 Dark & Light Mode**: Desain modern minimalist dengan glassmorphism dan tema yang nyaman di mata.

---

## ⌨️ Pintasan Keyboard (*Keyboard Shortcuts*)

| Tombol | Fungsi |
| :--- | :--- |
| `Spasi` / `Enter` | Submit token aktif & pindah ke token berikutnya |
| `Ctrl + Enter` (Win/Linux) / `⌘ + Enter` (Mac) | Langsung pindah ke soal selanjutnya / selesai |
| `Tab` | Pindah fokus antar 10 token |
| `Esc` | Jeda (*Pause*) / Lanjutkan sesi |

---

## 🚀 Memulai (Instalasi & Menjalankan Lokal)

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (v18+) atau [Bun](https://bun.sh/).

```bash
# 1. Clone repositori
git clone https://github.com/anggihnurh/japanese.git
cd japanese

# 2. Instal dependensi
npm install
# atau menggunakan bun:
# bun install

# 3. Jalankan server pengembangan lokal
npm run dev
# atau:
# bun run dev
```

Buka browser dan akses **`http://localhost:5173`**.

---

## 🛠️ Tech Stack

- **Framework**: React 18 & TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Effects**: canvas-confetti (Dynamic Code-Split)
- **Audio**: Web Audio API (Zero external assets)
- **Arsitektur**: Vercel React Best Practices & Vercel Composition Patterns

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan belajar dan latihan mandiri. Bebas digunakan dan dikembangkan lebih lanjut.
