# Attendance API (Node.js + Express + SQLite)

1. Salin .env.example -> .env dan sesuaikan SECRET_KEY jika perlu.
2. Install:
   npm install
3. Buat admin:
   npm run create-admin
4. Jalankan server:
   npm start
   atau untuk dev:
   npm run dev
5. API tersedia di http://localhost:8000

Contoh login:
POST /api/auth/login
{ "username": "admin", "password": "Admin123!" }

Gunakan token dari login di header:
Authorization: Bearer <token>

Endpoints:
- POST /api/auth/login
- POST /api/users        (admin)
- PUT /api/users/:id
- GET /api/users/:id
- GET /api/users         (admin)
- POST /api/attendance
- GET /api/attendance/history/:user_id
- GET /api/attendance/summary/:user_id?month=MM-YYYY
- POST /api/attendance/analysis
