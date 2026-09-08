# Software Requirements Specification (SRS)
## Aplikasi Reading Drill Hiragana & Katakana (KanaDrill)

---

### Informasi Dokumen
- **Judul Proyek**: KanaDrill - Japanese Kana Speed & Accuracy Reading Drill
- **Versi**: 1.1.0
- **Status**: Selesai Diimplementasikan & Terverifikasi (Production Ready)
- **Target Platform**: Web (Desktop & Mobile Responsive)
- **Tema Utama**: Modern Japanese Minimalist & Glassmorphism (Dark Mode & Light Mode)
- **Arsitektur**: Vercel React Best Practices & Vercel Composition Patterns (Compound Components)
- **Bahasa Dokumen**: Bahasa Indonesia

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen *Software Requirements Specification* (SRS) ini mendefinisikan seluruh kebutuhan fungsional, kebutuhan non-fungsional, spesifikasi data, arsitektur teknis berbasis pola komposisi modern, dan antarmuka pengguna untuk aplikasi **KanaDrill**. Dokumen ini telah diselaraskan dengan seluruh fitur nyata yang telah aktif diimplementasikan pada basis kode.

### 1.2 Ruang Lingkup Produk & Goals
Tujuan utama aplikasi ini adalah:
1. **Reflex Recognition (Otomatisasi Membaca)**: Melatih pengguna membaca huruf Hiragana dan Katakana secara instan dan tepat sehingga ketika melihat kombinasi karakter kana, pengguna langsung membacanya secara refleks tanpa proses mengeja yang lambat.
2. **Pengukuran Objektif**: Mengukur kecepatan dan akurasi membaca per soal melalui stopwatch independen presisi milidetik, CPM (*Characters Per Minute*), WPM (*Words Per Minute*), dan persentase akurasi.
3. **Variasi Pola Latihan**: Menyediakan kombinasi suku kata acak (*pseudo-words*) untuk melatih pengenalan karakter murni, serta kosakata bahasa Jepang riil (*vocabulary*) 2-4 kana untuk melatih ritme dan konteks kata.
4. **Gamifikasi & Umpan Balik Instan**: Menyediakan sistem combo streak, audio cues real-time, evaluasi rank performa (S+ s.d. C), visualisasi grafik kecepatan per soal, dan latihan terarah (*targeted mistake drill*).

### 1.3 Definisi, Akronim, dan Singkatan
| Istilah / Akronim | Definisi |
| :--- | :--- |
| **Gojuuon (五十音)** | 46 karakter dasar Hiragana dan Katakana (a, i, u, e, o s.d. n). |
| **Dakuon (濁音)** | Huruf kana dengan tanda tenten `゛` (suara g, z, d, b). |
| **Handakuon (半濁音)** | Huruf kana dengan tanda maru `゜` (suara p). |
| **Youon (拗音)** | Kombinasi kana konsonan dengan ya, yu, yo kecil (contoh: きゃ/kya, しゅ/shu, ちょ/cho). |
| **Sokuon (促音)** | Karakter tsu kecil `っ` / `ッ` yang menandai konsonan ganda (*geminate consonant*). |
| **Chouon (長音)** | Vokal panjang, ditandai tanda strip `ー` pada Katakana atau vokal rangkap pada Hiragana. |
| **Tokushuon (特殊音)** | Kombinasi kana khusus Katakana untuk fonem serapan asing (contoh: ティ/ti, ファ/fa, ヴェ/ve). |
| **Romaji** | Transliterasi alfabet Latin dari aksara Jepang (mendukung Hepburn, Kunrei-shiki, dan variasinya). |
| **Token / Kelompok** | Satu unit bacaan yang terdiri dari 2 hingga 4 karakter kana (misal: "ねこ", "きょうと", "コンピュータ"). |
| **Soal (Question/Page)** | Satu layar pengerjaan yang berisi kumpulan 10 token/kelompok kana. |
| **Sesi (Session)** | Satu putaran latihan lengkap yang terdiri dari tepat 10 soal (total 100 token/kelompok). |
| **CPM / WPM** | *Characters Per Minute* / *Words Per Minute*. |
| **Combo Streak** | Jumlah jawaban benar berturut-turut tanpa kesalahan dalam satu sesi. |

---

## 2. Deskripsi Umum Sistem

### 2.1 Arsitektur Sistem
KanaDrill adalah aplikasi web *Single-Page Application* (SPA) mandiri berbasis client-side (*zero backend dependency*). Seluruh proses peracikan soal, validasi ortografi, perhitungan waktu 60 FPS, dan persistensi data berjalan di sisi peramban (*browser*) dengan struktur modular:

```
+-------------------------------------------------------------------------+
|                              Browser Client                             |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |         UI & Compound Component Layer (React 18 + Tailwind)     |   |
|   |   - Setup Compound (Presets, Script, Mode, Category Matrix)     |   |
|   |   - Drill Compound (Header, Decoupled Timer, Grid, InputBar)    |   |
|   |   - Result Compound (Rank Banner, Metrics, Speed Chart, Review) |   |
|   |   - History Modal (Lifetime Stats & Session Records)            |   |
|   +--------------------------------+--------------------------------+   |
|                                    |                                    |
|   +--------------------------------v--------------------------------+   |
|   |            State & Context Layer (Zustand + Context DI)         |   |
|   |   - useDrillStore (Session Engine, Streak, Input Evaluation)    |   |
|   |   - useHistoryStore (Lifetime Analytics, O(N) Reducers)         |   |
|   |   - useThemeStore (Dark / Light Mode Controller)                |   |
|   +--------------------------------+--------------------------------+   |
|                                    |                                    |
|   +--------------------------------v--------------------------------+   |
|   |                 Core Engine & Audio Utilities                   |   |
|   |   - drillGenerator (O(1) Indexed Pools, Fisher-Yates Shuffle)   |   |
|   |   - romajiValidator (Cached Regex & Flexible Multi-Orthography) |   |
|   |   - soundEffects (Web Audio API Synthesizer)                    |   |
|   |   - useStopwatch (High-Precision performance.now() Tracker)     |   |
|   +--------------------------------+--------------------------------+   |
|                                    |                                    |
|   +--------------------------------v--------------------------------+   |
|   |                      Storage & Data Layer                       |   |
|   |   - Static Master Databases (kanaDatabase & vocabDatabase)      |   |
|   |   - Web LocalStorage (Session Records & Lifetime Stats)         |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
```

### 2.2 Batasan dan Asumsi
- **Client-Side Only**: Tidak memerlukan registrasi akun pengguna atau server database eksternal. Seluruh data tersimpan pada `window.localStorage`.
- **Keyboard-First & Touch Ergonomics**: Mendukung navigasi keyboard penuh (desktop) dan tata letak sticky input bar di atas virtual keyboard (mobile).
- **Tema Fleksibel**: Mendukung Dark Mode (default beraksen neon modern) dan Light Mode dengan transisi halus.

---

## 3. Kebutuhan Fungsional (Functional Requirements)

### 3.1 Halaman Pengaturan (Setup Screen)
- **FR-01 (Struktur Sesi Standar)**: Setiap sesi terdiri dari tepat **10 soal berturut-turut**, masing-masing soal berisi **10 token kana** (total 100 token per sesi).
- **FR-02 (4 Preset Latihan Cepat)**: Menyediakan tombol 1-klik untuk memilih preset latihan instan:
  1. *Hiragana Dasar*: Skrip Hiragana, mode Campuran, kategori Gojuuon (46 huruf dasar).
  2. *JLPT N5 Core*: Skrip Hiragana, mode Kosakata Nyata, kategori Gojuuon + Dakuon + Handakuon.
  3. *Katakana Serapan*: Skrip Katakana, mode Campuran, kategori Gojuuon + Dakuon + Handakuon + Chouon + Tokushuon.
  4. *Master Speed Drill*: Skrip Campuran (Both), mode Campuran, seluruh 7 kategori aktif.
- **FR-03 (Pilihan Aksara)**: Pengguna dapat memilih cakupan aksara: Hiragana saja, Katakana saja, atau Campuran keduanya.
- **FR-04 (Pilihan Sumber Soal / Mode)**:
  1. *Campuran (Hybrid)*: Kombinasi acak antara kosakata riil dan kombinasi huruf acak.
  2. *Kosakata Nyata (Vocab)*: Kosakata bermakna 2-4 kana dari kamus bahasa Jepang.
  3. *Huruf Acak (Random)*: Kombinasi suku kata acak valid untuk melatih refleks murni.
- **FR-05 (Matriks 7 Kategori Kana Interaktif)**: Pengguna dapat memilih kombinasi kategori kana dengan pratinjau chip sampel karakter asli:
  - Gojuuon (Dasar `あいう` / `アイウ`)
  - Dakuon (Tenten `がざだ` / `ガザダ`)
  - Handakuon (Maru `ぱぴぷ` / `パピプ`)
  - Youon (Kombinasi `きゃしゅ` / `キャシュ`)
  - Sokuon (Konsonan Ganda `っ` / `ッ`)
  - Chouon (Vokal Panjang `おう` / `ー`)
  - Tokushuon (Serapan Asing `ファティヴェ`)
- **FR-06 (Kontrol Efek Suara & Tester)**: Pengguna dapat mengaktifkan/menonaktifkan efek suara audio dengan tombol toggle yang memicu audio preview langsung.
- **FR-07 (Ringkasan Statistik Cepat)**: Menampilkan badge jumlah total sesi selesai dan rekor CPM terbaik pada header jika pengguna sudah pernah bermain.

### 3.2 Tampilan Pengerjaan Soal (Drill Screen)
- **FR-08 (Tata Letak Grid 10 Token)**: Menyajikan 10 kotak token dalam grid responsif (2 kolom pada mobile, 5 kolom pada desktop) dengan nomor urut `#1` s.d. `#10`.
- **FR-09 (Status Visual Token yang Jelas)**:
  - *Unvisited*: Bersih, border lembut, menampilkan jumlah kana.
  - *Active*: Glowing border ring indigo, sedikit membesar (`scale-103`), penunjuk target fokus.
  - *Correct*: Background hijau lembut, badge centang (✓), jawaban romaji tersimpan.
  - *Wrong*: Background merah lembut, badge silang (✗), teks dicoret dan kunci jawaban romaji benar ditampilkan.
- **FR-10 (Floating Smart Input Bar)**: Area input terapung di bagian bawah layar yang menampilkan:
  - Pratinjau karakter kana target aktif berukuran besar dan arti kata (jika ada).
  - Kolom input teks Romaji berfont monospace dengan fokus otomatis (*autofocus*).
  - Tombol Submit (Enter) dan tombol Selanjutnya (*Next Question*).
- **FR-11 (Validasi Romaji Fleksibel & Cepat)**:
  - Mendukung ortografi Hepburn, Kunrei-shiki, dan Nihon-shiki (misal `shi`/`si`, `tsu`/`tu`, `chi`/`ti`, `fu`/`hu`, `ji`/`zi`, `kya`/`cya`).
  - Mendukung berbagai format vokal panjang dan chouon (misal `ko-hi-`, `koohii`, `gakkou`, `gakkoo`, `gakkō`).
  - Menerima masukan langsung karakter kana jika pengguna menggunakan keyboard IME Jepang.
- **FR-12 (Keyboard Shortcuts Lengkap)**:
  - `Spasi` atau `Enter`: Submit token aktif dan otomatis pindah ke token berikutnya yang belum dijawab.
  - `Ctrl + Enter` (Windows/Linux) atau `⌘ + Enter` (macOS): Pindah langsung ke soal berikutnya (menyimpan durasi soal dan mengevaluasi token yang sedang diketik).
  - `Tab`: Berpindah fokus antar 10 token secara berurutan.
  - `Esc`: Mengaktifkan / melanjutkan sesi jeda (*Pause/Resume*).
- **FR-13 (Live Combo Streak & Gamifikasi)**:
  - Menghitung jumlah jawaban benar berturut-turut (*streak*).
  - Menampilkan badge animasi "🔥 Xx Combo!" saat streak mencapai 3 atau lebih.
  - Memainkan suara combo chime khusus pada streak kelipatan 3.
- **FR-14 (Sistem Stopwatch Independen per Soal)**:
  - Stopwatch berpresisi milidetik berjalan otomatis begitu soal baru muncul di layar.
  - Menampilkan format `mm:ss.SS` secara live pada header.
  - Dihentikan saat soal disubmit dan di-reset ke 0 untuk soal berikutnya.
  - Opsi *Pause* yang menghentikan waktu dan menampilkan overlay jeda.

### 3.3 Layar Hasil & Analisis Sesi (Result Screen)
- **FR-15 (Dynamic Performance Rank)**: Menghitung dan menampilkan grade performa berdasarkan CPM dan akurasi:
  - 👑 **S+ Divine Reflex (神レベル)**: CPM ≥ 200 & Akurasi ≥ 95%
  - ⚡ **S Kana Master (達人)**: CPM ≥ 150 & Akurasi ≥ 90%
  - 🎯 **A Fluent Reader (上級)**: CPM ≥ 100 & Akurasi ≥ 80%
  - 🚀 **B Steady Learner (中級)**: CPM ≥ 65
  - 🌱 **C Beginner Cadet (初級)**: CPM < 65
- **FR-16 (4 Kartu Ringkasan Metrik)**:
  1. *Akurasi*: Persentase dan perbandingan token benar dari 100 token.
  2. *Total Waktu*: Format `mm:ss.SS` dan rata-rata waktu per soal.
  3. *Kecepatan CPM*: Jumlah karakter kana yang dibaca per menit.
  4. *Kecepatan WPM*: Jumlah token yang diselesaikan per menit.
- **FR-17 (Visual Speed Breakdown Timeline Chart)**:
  - Menampilkan grafik batang horizontal 10 soal yang membandingkan durasi pengerjaan soal 1 s.d. 10.
  - Color-coding status kecepatan dan akurasi (Hijau = 10/10 benar, Kuning = 8-9 benar, Merah = <8 benar).
  - Baris soal dapat diklik (*expandable*) untuk melihat rincian 10 token dan jawaban pengguna.
- **FR-18 (Evaluasi Kesalahan / Mistakes Review)**:
  - Menampilkan daftar seluruh token yang salah dijawab lengkap dengan jawaban pengguna dan kunci jawaban yang benar.
  - Tombol **"Latih Token Ini Saja" (Targeted Practice)**: 1-klik untuk memulai sesi baru yang khusus meracik 10 soal dari kumpulan token yang salah tersebut.
- **FR-19 (Salin Skor & Berbagi Hasil)**:
  - Tombol **"Salin Skor"** untuk menyalin ringkasan performa terformat ke *clipboard*.
- **FR-20 (Efek Selebrasi)**: Memunculkan partikel *confetti* dan suara fanfare kemenangan saat sesi selesai.

### 3.4 Modal Riwayat & Statistik Seumur Hidup (History Modal)
- **FR-21 (Penyimpanan Lokal Otomatis)**: Setiap sesi yang selesai otomatis disimpan ke `localStorage` (maksimal 50 sesi terakhir).
- **FR-22 (Lifetime Analytics Summary)**:
  - Total Sesi Terselesaikan.
  - Total Waktu Latihan Seumur Hidup.
  - Rekor CPM Terbaik (All-time Best).
  - Rata-rata Akurasi Keseluruhan.
- **FR-23 (Filter & Manajemen Riwayat)**:
  - Filter riwayat berdasarkan skrip: Semua, Hiragana, Katakana, Campuran.
  - Opsi *Hapus Riwayat* dengan dialog konfirmasi aman.

---

## 4. Spesifikasi Data & Database

### 4.1 Taksonomi Kana Master DB (`src/data/kanaDatabase.ts`)
Memuat 137 entri karakter kana:
- Gojuuon (46 Hiragana + 46 Katakana)
- Dakuon (20 Hiragana + 20 Katakana)
- Handakuon (5 Hiragana + 5 Katakana)
- Youon (36 Hiragana + 36 Katakana)
- Sokuon (`っ` / `ッ`)
- Chouon (`ー`)
- Tokushuon (22 kombinasi serapan Katakana modern)

### 4.2 Skema Database Kosakata (`src/data/vocabDatabase.ts`)
Memuat ratusan kosakata 2 hingga 4 kana dengan arti bahasa Indonesia dan daftar seluruh variasi Romaji yang valid.

### 4.3 Skema Sesi Latihan di LocalStorage (`kana_drill_history_v1`)
```typescript
interface SessionRecord {
  sessionId: string;
  timestamp: string; // ISO 8601
  config: {
    script: 'hiragana' | 'katakana' | 'both';
    mode: 'random' | 'vocab' | 'hybrid';
    categories: KanaCategory[];
    soundEnabled: boolean;
  };
  summary: {
    totalDurationMs: number;
    averageDurationPerQuestionMs: number;
    totalTokens: number;
    correctTokens: number;
    accuracyPercentage: number;
    cpm: number;
    wpm: number;
  };
  questions: QuestionRecord[];
}
```

---

## 5. Arsitektur Teknis & Standar Rekayasa

### 5.1 Tech Stack
- **Framework & Runtime**: React 18+ dengan Vite
- **Bahasa**: TypeScript 5.7+ (Strict Mode)
- **Styling**: Tailwind CSS 3.4+ dengan custom animations & glassmorphism
- **State Management**: Zustand 5.0+
- **Audio**: Web Audio API (Zero external audio file assets)
- **Effects**: canvas-confetti (Dynamic code-split)
- **Icons**: Lucide React

### 5.2 Pola Komposisi (Vercel Composition Patterns)
Komponen dipecah menjadi **Compound Components** dengan antarmuka generic `{ state, actions, meta }`:
- `Drill`: `Drill.Root`, `Drill.Header`, `Drill.TokenGrid`, `Drill.TokenCard`, `Drill.InputBar`, `Drill.PauseOverlay`.
- `Setup`: `Setup.Root`, `Setup.Hero`, `Setup.Presets`, `Setup.ScriptSelector`, `Setup.ModeSelector`, `Setup.CategoryMatrix`, `Setup.SessionOverview`.
- `Result`: `Result.Root`, `Result.RankBanner`, `Result.MetricsGrid`, `Result.TimelineChart`, `Result.MistakesReview`, `Result.Actions`.

### 5.3 Optimasi Kinerja (Vercel React Best Practices)
1. **Memoization (`rerender-memo`)**: `TokenCard` dibungkus dengan `React.memo` sehingga pengetikan pada input tidak menyebabkan re-render pada 10 kartu token.
2. **Decoupled Live Timer (`rerender-defer-reads`)**: `LiveTimer` mengisolasi update 50ms (20 FPS) sehingga parent `DrillScreen` dan token grid bebas dari re-render konstan.
3. **Single-Pass Reducers (`js-min-max-loop` & `js-combine-iterations`)**: Menggantikan `sort` O(N log N) dengan O(N) single-pass accumulator pada perhitungan best record dan metrik sesi.
4. **Dynamic Imports (`bundle-dynamic-imports`)**: `canvas-confetti` dimuat secara on-demand saat sesi selesai.
5. **Precomputed Lookups & Cached Regex (`js-set-map-lookups` & `js-hoist-regexp`)**: Variasi ortografi Romaji di-cache menggunakan module-level `Map` untuk kecepatan validasi O(1).

---

## 6. Kebutuhan Non-Fungsional (Non-Functional Requirements)

### 6.1 Kinerja (Performance)
- **Zero Keystroke Latency**: Waktu pemrosesan input < 5ms tanpa blocking frame (60–120 FPS).
- **Bundle Size**: Total JavaScript production bundle ter-gzipped < 110 KB.
- **Fast Startup**: First Contentful Paint (FCP) < 0.5 detik.

### 6.2 Aksesibilitas & Ergonomi Keyboard
- Sesi drill dapat diselesaikan 100% menggunakan keyboard:
  - `Spasi` / `Enter`: Submit token
  - `Ctrl + Enter` / `⌘ + Enter`: Pindah soal
  - `Tab`: Pindah token
  - `Esc`: Jeda / Lanjut
- Rasio kontras teks Jepang memenuhi standar WCAG 2.1 AA (minimal 4.5:1).

---

## 7. Matriks Pengujian & Verifikasi

| ID | Skenario Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- |
| **TC-01** | Inisialisasi Preset | Memilih salah satu dari 4 preset langsung memperbarui script, mode, dan kategori secara tepat. | PASS |
| **TC-02** | Generator 10 Soal × 10 Token | Tepat 10 soal dibuat dengan 10 token (panjang 2-4 kana) per soal. | PASS |
| **TC-03** | Validasi Romaji & Alternatif | Menerima variasi Hepburn/Kunrei-shiki (`shi`/`si`, `tsu`/`tu`, `chouon`, `sokuon`). | PASS |
| **TC-04** | Shortcut Pindah Soal | Menekan `Ctrl+Enter` (Win) atau `⌘+Enter` (Mac) langsung menyimpan waktu soal dan berpindah ke soal berikutnya. | PASS |
| **TC-05** | Combo Streak & Audio Cues | Jawaban benar beruntun menambah combo streak dan memicu suara synthesizer interaktif. | PASS |
| **TC-06** | Decoupled Stopwatch | Stopwatch berjalan lancar tanpa memicu re-render pada kartu token saat mengetik. | PASS |
| **TC-07** | Kalkulasi Rank & Speed Chart | Layar hasil menampilkan grade S+/S/A/B/C yang akurat beserta grafik batang perbandingan 10 soal. | PASS |
| **TC-08** | Latih Ulang Token Salah | Tombol "Latih Token Ini Saja" membuat sesi 10 soal baru khusus dari token yang salah. | PASS |
| **TC-09** | Persistensi & Lifetime Stats | Sesi tersimpan ke LocalStorage dan statistik seumur hidup teragregasi dengan benar. | PASS |
| **TC-10** | Responsivitas Mobile | Input bar berada sticky di atas virtual keyboard dan navigasi berjalan lancar pada perangkat sentuh. | PASS |

---

## 8. Status Akhir Proyek
Aplikasi **KanaDrill v1.1.0** telah selesai dibangun, diuji, dan memenuhi seluruh spesifikasi kebutuhan perangkat lunak di atas dengan arsitektur modern yang skalabel dan performa optimal.
