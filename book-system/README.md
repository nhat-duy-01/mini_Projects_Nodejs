# Book Review System

## Cấu trúc
- `backend/` — Express + MongoDB (API + EJS tùy chọn)
- `frontend/` — React (Vite) SPA

## Chạy Backend
```bash
cd backend
npm install
node seedAdmin.js   # tạo admin: admin / admin123
npm start           # http://localhost:5000
```

## Chạy Frontend
```bash
cd frontend
npm install
npm start           # http://localhost:5173
```

## API chính (đã đồng bộ)

### Auth
- POST `/api/auth/register` — { username, email, password, zipCode, mobileNumber }
- POST `/api/auth/login` — { username, password }
- POST `/api/auth/forget-password` — { username, zipCode, mobileNumber, newPassword }
- PUT  `/api/auth/change-password` — { oldPassword, newPassword } (Bearer)

### User
- GET  `/api/user/books`
- GET  `/api/user/search?query=`
- GET  `/api/user/books/:id`
- POST `/api/user/reviews` — { bookId, comment }
- POST `/api/user/ratings` — { bookId, score }
- POST `/api/user/feedback` — { subject, message }
- GET  `/api/user/feedback`

### Publisher (role: publisher)
- GET/POST `/api/publisher/books`
- PUT/DELETE `/api/publisher/books/:id`
- GET `/api/publisher/books/:bookId/reviews`

### Admin (role: admin)
- GET `/api/admin/users`
- GET/POST `/api/admin/publishers`
- DELETE `/api/admin/users/:id`
- GET/DELETE `/api/admin/books`
- GET/DELETE `/api/admin/reviews`
- GET/PATCH `/api/admin/feedback`

Token lưu localStorage key: `accessToken`
