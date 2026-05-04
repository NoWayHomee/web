# Hotel Booking Platform — Local (MySQL)

Cấu trúc:
```
main/
├── backend-api/    # Node.js + Express + MySQL
├── database/
│   ├── 3.8.sql       # SCHEMA CHÍNH — không sửa trực tiếp
└── web/
    ├── webadmin/   # React + Vite
    └── webpartner/ # React + Vite
```

## 2. Backend
```bash
cd backend-api
cp .env       
npm install
npm start
```

## 3. Web Admin
```bash
cd web/webadmin
npm install
npm run dev
```
Mở `http://localhost:5173`.

## Tương tự còn lại



khi chạy để 2 file start-all.bat và stop-all.bat bên ngoài cùng tầng với web và backend-api 