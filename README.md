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
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. **Install dependencies untuk Backend**:
   ```bash
   cd backend
   npm install
   ```

4. **Install dependencies untuk Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```

5. **Konfigurasi Environment**:
   - Copy `.env.example` ke `.env` di folder `backend`
   - Isi konfigurasi database dan JWT
   - Hubungi tim jika ada kendala

## Struktur Proyek
```
Capstone-projek/
├── backend/               # Kode sumber backend (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Konfigurasi database
│   │   ├── controllers/   # Logika bisnis
│   │   ├── middleware/    # Auth & validasi
│   │   ├── models/        # Model database
│   │   └── routes/        # Endpoint API
│   └── .env
├── frontend/              # Kode sumber frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Komponen reusable
│   │   ├── context/       # State management
│   │   ├── pages/         # Halaman aplikasi
│   │   ├── services/      # API services
│   │   └── utils/         # Helper functions
│   └── .env
├── database/              # File SQL database
│   └── schema.sql
└── README.md
```

## Cara Menjalankan

### Menjalankan Backend
1. **Masuk ke folder backend**:
   ```bash
   cd backend
   ```
2. **Jalankan server**:
   ```bash
   npm run dev
   ```
   Server akan berjalan di `http://localhost:5000`

### Menjalankan Frontend
1. **Masuk ke folder frontend**:
   ```bash
   cd frontend
   ```
2. **Jalankan aplikasi**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`