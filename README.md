# TabunganQu

Selamat datang di repo TabunganQu.  
Proyek ini adalah aplikasi pengelola keuangan pribadi berbasis web untuk membantu pengguna mencatat pemasukan, pengeluaran, dan target tabungan dengan lebih mudah dan terstruktur.

## Persyaratan
- Node.js v18 atau lebih baru
- MySQL v8 atau lebih baru
- NPM

## Langkah Instalasi

1. **Clone repository ini**:
   ```bash
   git clone https://github.com/G-breel/Capstone-projek.git
   cd Capstone-projek
   ```

2. **Setup Database**:
   Anda bisa menggunakan salah satu cara di bawah ini:

   **Cara A (Otomatis - Direkomendasikan):**
   ```bash
   cd backend
   npm run db:setup
   ```

   **Cara B (Manual CLI):**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

   **Cara C (Copy-Paste SQL):**
   Copy paste SQL berikut di terminal MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS tabunganqu_db;
   USE tabunganqu_db;
   -- (Sisanya ada di file database/schema.sql)
   ```

3. **Setup Backend**:
   ```bash
   cd backend
   npm install
   ```
   Buat file `.env` di folder `backend`:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=tabunganqu_db
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173
   GOOGLE_CLIENT_ID=your_google_client_id
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret
   ```
   > [!IMPORTANT]
   > Anda wajib mengisi `GOOGLE_CLIENT_ID` dan `RECAPTCHA_SECRET_KEY` dengan kunci asli agar fitur login & keamanan berjalan.

   **Jalankan backend:**
   ```bash
   npm run dev
   ```

4. **Setup Frontend**:
   Buka terminal baru, lalu:
   ```bash
   cd frontend
   npm install
   ```
   Buat file `.env` di folder `frontend`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   ```
   > [!IMPORTANT]
   > Pastikan `VITE_RECAPTCHA_SITE_KEY` sesuai dengan `RECAPTCHA_SECRET_KEY` di backend agar verifikasi captcha berhasil.

   **Jalankan frontend:**
   ```bash
   npm run dev
   ```

---



## 🎯 Fitur Unggulan

- **Autentikasi Ganda**: Login biasa atau menggunakan Google OAuth.
- **Keamanan**: Dilengkapi dengan Google reCAPTCHA v2.
- **Visualisasi Data**: Grafik interaktif menggunakan Recharts.
- **Responsive Design**: Tampilan premium yang nyaman di desktop maupun mobile.
- **Wishlist Tracking**: Sistem target tabungan dengan progress bar dinamis.

---

## 🔧 Troubleshooting

### Error: Database connection failed
- Pastikan MySQL server Anda sudah berjalan.
- Cek kredensial (host, user, password) di `.env` backend.

### Error: 'mysql' is not recognized
- Gunakan perintah `npm run db:setup` di folder backend sebagai alternatif.

### Error: Missing required parameters: sitekey
- Pastikan `VITE_RECAPTCHA_SITE_KEY` sudah terisi di `.env` frontend.

---

## 📁 Struktur Proyek

```
Capstone-projek/
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── config/        # Database & Migration config
│   │   ├── controllers/   # Business Logic
│   │   ├── routes/        # API Endpoints
│   │   └── models/        # Database Models
│   └── database/          # SQL Schema & Setup Script
├── frontend/              # React + Vite UI
│   ├── src/
│   │   ├── components/    # Reusable UI
│   │   ├── pages/         # Page Views
│   │   └── context/       # Auth & Toast State
└── README.md
```

---

## 👨‍💻 Developer

- **Team:** CC26-PS037
- **Project:** Capstone Project - Dicoding
- **Repo:** [G-breel/Capstone-projek](https://github.com/G-breel/Capstone-projek)

---

© 2026 TabunganQu. All rights reserved. 
