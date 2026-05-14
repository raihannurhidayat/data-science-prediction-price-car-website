# Product Requirements Document — Car Price Prediction Frontend

---

## 1. Executive Summary

**Problem Statement**
Backend API prediksi harga mobil sudah tersedia (Flask + Linear Regression) tetapi belum memiliki antarmuka visual. Pengguna (mahasiswa/akademik) tidak dapat mengakses dan mendemonstrasikan model secara interaktif tanpa menulis kode atau menggunakan tools seperti Postman/curl.

**Proposed Solution**
Aplikasi frontend berbasis **Next.js 15 (App Router)** dan **shadcn/ui** yang menyediakan antarmuka modern dan responsif untuk:
- Input 8 fitur teknis mobil secara interaktif
- Menampilkan hasil prediksi harga dalam USD secara real-time
- Visualisasi data dan wawasan dari dataset
- Riwayat prediksi yang tersimpan
- Informasi lengkap tentang project dan model ML

**Success Criteria**
1. Pengguna dapat menyelesaikan prediksi harga mobil dalam < 3 klik setelah mengisi form
2. Response time prediksi (end-to-end) < 2 detik dari submit hingga tampil hasil
3. Lighthouse Performance score >= 90, Accessibility >= 95
4. Semua halaman (Prediksi, Dashboard, Riwayat, About) dapat diakses dalam 4 navigasi
5. Riwayat prediksi tersimpan secara lokal (localStorage/indexedDB) dan dapat dilihat kembali

---

## 2. User Experience & Functionality

### User Personas

| Persona | Deskripsi | Kebutuhan |
|---------|-----------|-----------|
| **Raihan (Mahasiswa)** | Pembuat project, perlu demo untuk presentasi UAS | Menunjukkan input fitur → prediksi, dashboard insight, navigasi rapi |
| **Dosen Penguji** | Mengevaluasi project dari sisi teknis dan penyajian | Melihat kejelasan UI, informasi model, dan hasil prediksi |
| **Audience Kelas** | Teman sekelas yang melihat presentasi | Memahami cara kerja prediksi harga mobil secara visual |

### User Stories

#### US-01: Form Prediksi
- **Story:** Sebagai pengguna, saya ingin mengisi 8 fitur teknis mobil dan mendapatkan prediksi harga sehingga saya tahu perkiraan harga pasar mobil tersebut.
- **Acceptance Criteria:**
  - Form menampilkan 8 input field dengan label yang jelas: Engine Size, Horsepower, Wheelbase, Width, Length, Curb Weight, Fuel Capacity, Fuel Efficiency
  - Setiap input memiliki placeholder/value range yang informatif
  - Validasi client-side: semua field harus diisi dengan angka positif
  - Tombol "Prediksi Harga" dalam keadaan disabled jika form belum lengkap
  - Saat submit, menampilkan state loading (Spinner/Skeleton)
  - Hasil prediksi ditampilkan dalam Card dengan format mata uang USD, animasi masuk
  - Jika API error, menampilkan pesan error yang human-readable
  - Tombol "Reset" untuk mengosongkan form

#### US-02: Dashboard Statistik
- **Story:** Sebagai pengguna, saya ingin melihat visualisasi data dan performa model sehingga saya memahami insight dari dataset.
- **Acceptance Criteria:**
  - Menampilkan grafik distribusi harga mobil (histogram/Chart)
  - Menampilkan perbandingan fitur vs harga (scatter plot)
  - Menampilkan metrik model: R2 Score (0.7459) dan RMSE (7.39)
  - Menampilkan top 10 mobil terlaris dari dataset
  - Data diambil dari file statis (tidak perlu API call)

#### US-03: Riwayat Prediksi
- **Story:** Sebagai pengguna, saya ingin menyimpan dan melihat kembali hasil prediksi sebelumnya sehingga saya bisa membandingkan beberapa skenario.
- **Acceptance Criteria:**
  - Setiap prediksi berhasil otomatis tersimpan ke riwayat
  - Riwayat ditampilkan dalam tabel (Table component) dengan kolom: tanggal, fitur input, hasil prediksi
  - Pengguna dapat menghapus item riwayat satu per satu
  - Pengguna dapat menghapus semua riwayat (clear all) dengan konfirmasi
  - Data riwayat disimpan di localStorage (tidak perlu backend)

#### US-04: Halaman About
- **Story:** Sebagai dosen/audiens, saya ingin melihat informasi project secara lengkap sehingga saya memahami latar belakang dan metodologi yang digunakan.
- **Acceptance Criteria:**
  - Menampilkan judul project dan deskripsi singkat
  - Menampilkan informasi model: Linear Regression, 8 fitur, R2=0.7459, RMSE=7.39
  - Menampilkan metodologi CRISP-DM yang digunakan
  - Menampilkan informasi pembuat (nama, NPM, kelas)
  - Menampilkan tautan ke repository GitHub

### Non-Goals
- Autentikasi/login pengguna (tidak diperlukan untuk demo akademik)
- Penyimpanan riwayat di server/backend
- Perbandingan multiple models
- Export laporan PDF
- Realtime update dari API

---

## 3. AI/ML System Integration

### API Integration Points

| Endpoint | Method | Request | Response | Digunakan di Halaman |
|----------|--------|---------|----------|---------------------|
| `GET /` | GET | - | JSON metadata API, status, endpoints | About (info API) |
| `GET /health` | GET | - | `{status, model_loaded, features}` | Semua halaman (status badge) |
| `POST /predict` | POST | `{Engine_size, Horsepower, Wheelbase, Width, Length, Curb_weight, Fuel_capacity, Fuel_efficiency}` | `{predicted_price, currency, input_features}` | Form Prediksi |

### Error Handling Strategy
- API down (503): Tampilkan Alert dengan pesan "Model sedang tidak tersedia. Coba lagi nanti."
- Network error: Tampilkan Alert "Gagal terhubung ke server. Periksa koneksi Anda."
- Validation error (400): Tampilkan field error spesifik
- Timeout (>10 detik): Tampilkan Alert "Server tidak merespons. Coba lagi."

### Fallback Behavior
- Jika API tidak reachable, form prediksi menampilkan pesan error dengan tombol retry
- Riwayat dan dashboard tetap bisa diakses karena menggunakan data lokal/statis

---

## 4. Technical Specifications

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                 Vercel (Deployment)                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Next.js 15 App Router                   │   │
│  │                                                   │   │
│  │  / (Home/Prediction)   /dashboard   /history      │   │
│  │  /about                /api/health (proxy)         │   │
│  │                                                   │   │
│  │  Components: shadcn/ui + Tailwind CSS v4          │   │
│  │  State: React useState + useEffect                │   │
│  │  Storage: localStorage (riwayat)                  │   │
│  │  Charts: Recharts (via shadcn Chart)              │   │
│  └─────────────────────────────────────────────────┘   │
│                         │ HTTP POST /predict            │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Flask API (Vercel Serverless)             │   │
│  │  https://data-science-prediction-price-car-       │   │
│  │  system.vercel.app/predict                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Framework | Next.js 15 (App Router) | React server components, routing, optimal untuk Vercel |
| UI Components | shadcn/ui (base-nova style) | Komponen accessible, customizable, source-code based |
| Styling | Tailwind CSS v4 | Utility-first, integrasi sempurna dengan shadcn |
| Charts | Recharts (via `npx shadcn@latest add chart`) | Komponen chart deklaratif, React-native |
| Icons | lucide-react | Default icon library shadcn, ringan dan lengkap |
| Form | React Hook Form + Zod | Validasi form type-safe |
| HTTP Client | fetch (built-in) | Native, tanpa dependency tambahan |
| Deployment | Vercel | Serverless, CI/CD otomatis, gratis |
| Package Manager | pnpm | Cepat, efficient, workspace-ready |

### Pages & Routes

| Route | Page | Komponen Utama (shadcn) |
|-------|------|------------------------|
| `/` | Home — Form Prediksi | Card, Form (Input), Button, Slider, Spinner, Alert |
| `/dashboard` | Dashboard Statistik | Card, Chart (Recharts), Badge, Table |
| `/history` | Riwayat Prediksi | Table, Button (delete), AlertDialog (konfirmasi) |
| `/about` | About Project | Card, Badge, Separator, Accordion |

### Data Flow (Form Prediksi)

```
User Input (8 fields)
    │
    ▼
Client-side Validation (Zod)
    │
    ├── Invalid → Tampilkan error per field
    │
    ▼ Valid
Loading State (Spinner di Button)
    │
    ▼
POST /predict → JSON
    │
    ├── Error → Alert dengan pesan error + retry button
    │
    ▼ Success
Tampilkan hasil di Result Card
    │
    ▼
Simpan ke localStorage (riwayat)
    │
    ▼
Selesai
```

### Component Tree (per halaman)

**Home Page (`/`)**
```
Page
├── Header (Navigation Menu)
├── Main Content
│   ├── Card: "Prediksi Harga Mobil"
│   │   ├── Form
│   │   │   ├── InputGroup (Engine Size)
│   │   │   ├── InputGroup (Horsepower)
│   │   │   ├── InputGroup (Wheelbase)
│   │   │   ├── InputGroup (Width)
│   │   │   ├── InputGroup (Length)
│   │   │   ├── InputGroup (Curb Weight)
│   │   │   ├── InputGroup (Fuel Capacity)
│   │   │   ├── InputGroup (Fuel Efficiency)
│   │   │   ├── Button "Prediksi Harga" (with Spinner)
│   │   │   └── Button "Reset" (variant="outline")
│   │   └── Result Card (conditional)
│   │       ├── CardHeader: "Hasil Prediksi"
│   │       ├── CardContent: Harga dalam USD (large text)
│   │       └── CardFooter: Ringkasan input
│   └── Quick Stats Row (3x Badge)
└── Footer
```

**Dashboard Page (`/dashboard`)**
```
Page
├── Header
├── Main Content
│   ├── Stats Cards Row (R2, RMSE, Total Data)
│   ├── Card: "Distribusi Harga" → Chart (Histogram)
│   ├── Card: "Fitur vs Harga" → Chart (Scatter)
│   └── Card: "Top 10 Mobil Terlaris" → Table
└── Footer
```

### Security & Privacy
- Tidak ada data sensitif yang ditransmisikan
- CORS sudah dihandle oleh backend (`Access-Control-Allow-Origin: *`)
- Input divalidasi client-side sebelum dikirim ke API
- Riwayat prediksi hanya disimpan di localStorage pengguna

---

## 5. Risks & Roadmap

### Phased Rollout

#### MVP (Prioritas 1 — Wajib)
- [ ] Setup Next.js 15 + shadcn/ui (base-nova style)
- [ ] Halaman Home: Form Prediksi dengan 8 input + hasil
- [ ] Integrasi API `/predict`
- [ ] Halaman About: informasi project
- [ ] Status health check badge di header
- [ ] Error handling & loading states
- [ ] Deploy ke Vercel

#### Phase 2 (Prioritas 2 — Setelah MVP)
- [ ] Halaman Dashboard: grafik statistik
- [ ] Halaman Riwayat: tabel riwayat dengan localStorage
- [ ] Mode dark/light toggle
- [ ] Animasi transisi halaman (framer-motion)

#### Phase 3 (Nice to Have)
- [ ] Input dengan Slider (shadcn Slider) untuk pengalaman lebih interaktif
- [ ] Copy hasil prediksi ke clipboard
- [ ] Dataset Explorer dengan Search & Filter
- [ ] PWA support (offline access untuk dashboard)

### Technical Risks

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| API Flask di Vercel cold start lambat | Prediksi pertama > 5 detik | Tampilkan Skeleton, hit health endpoint di background saat landing |
| CORS mismatch domain | Request predict gagal | Pastikan backend CORS allow origin frontend domain |
| Dataset kecil (157 records) | Insight dashboard terbatas | Gunakan visualisasi yang informatif meski data sedikit |
| Browser localStorage terbatas (5-10MB) | Riwayat banyak hilang | Implementasi batas maksimal 100 riwayat, kompresi data |
| Perubahan struktur API response | Parsing gagal di frontend | Buat tipe TypeScript yang ketat, validasi response |

### Dependencies Setup

```bash
# Inisialisasi project
npx create-next-app@latest car-price-frontend --typescript --tailwind --app

# Setup shadcn/ui
npx shadcn@latest init --preset base-nova

# Tambah komponen yang diperlukan
npx shadcn@latest add button card input badge separator table alert dialog
npx shadcn@latest add chart       # untuk dashboard
npx shadcn@latest add navigation-menu  # atau sidebar

# Dependencies tambahan
pnpm add zod react-hook-form @hookform/resolvers
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=https://data-science-prediction-price-car-system.vercel.app
```

---

## 6. Referensi

- **Repository Backend:** `https://github.com/mraihannurhidayat/prediction-price-car-system`
- **API Base URL:** `https://data-science-prediction-price-car-system.vercel.app`
- **Dokumentasi shadcn/ui:** `https://ui.shadcn.com`
- **Next.js 15 App Router:** `https://nextjs.org/docs`
- **Dataset:** Car_sales.xls (157 records, 16 atribut) — sumber: Kaggle
- **Model:** Linear Regression, scikit-learn, R2 = 0.7459, RMSE = 7.39

---

*Dokumen PRD ini disusun untuk project UAS Mata Kuliah Sains Data — Semester 6*
*Oleh: Research & Analysis Agent — berdasarkan analisis repository `prediction-price-car-system`*
