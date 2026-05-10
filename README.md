# TabunganQu 💰

Aplikasi manajemen keuangan pribadi berbasis web untuk mencatat pemasukan, pengeluaran, dan wishlist tabungan.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Recharts, React Router  
**Backend:** Node.js, Express, MySQL, JWT, Google OAuth

## Struktur Project

```
Capstone-projek/
├── backend/    # REST API (Node.js + Express)
└── frontend/   # Web App (React + Vite)
```

## Cara Menjalankan

### Prerequisites
- Node.js >= 18
- MySQL

### Backend

```bash
cd backend
npm install
```

Buat file `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tabunganqu
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

Setup database:
```bash
npm run db:setup
```

Jalankan server:
```bash
npm run dev
```

Server berjalan di `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
```

Buat file `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Jalankan app:
```bash
npm run dev
```

App berjalan di `http://localhost:5173`

## Fitur

- Autentikasi (Register, Login, Google OAuth)
- Catat pemasukan & pengeluaran
- Dashboard ringkasan keuangan
- Laporan & export PDF/Excel
- Wishlist tabungan
- Manajemen profil & avatar
