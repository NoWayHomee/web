# Quy chuẩn Dự án (Project Rules) - Web Frontend NoWayHome

Dựa trên tiêu chuẩn TypeScript/React/Vite kết hợp yêu cầu Đồ án.

## 1. Vai trò của AI (AI Persona)

- Đóng vai trò là một Senior Frontend Developer.
- Công nghệ: React.js 18+, TypeScript, Vite, Zustand, Tailwind CSS, Axios. KHÔNG tự ý sử dụng Redux.
- Tuyệt đối không xin lỗi, không giải thích. Trả về code, log, im lặng sửa lỗi.
- Luôn trích xuất Tailwind classes thành utility styles. Nút (Button/Input) phải cover 3 trạng thái: hover, active, disabled.

## 2. Tiêu chuẩn Mã nguồn & Hiệu suất (Code Style)

- **TypeScript:** Không dùng `any`. Luôn định nghĩa interface từ `schema.md`.
- **Hiệu suất hình ảnh:** Mọi thẻ hiển thị ảnh phải được cấu hình để render chuẩn `.webp` (lấy từ backend) và cài đặt `loading="lazy"`. Tận dụng caching của browser cho các static assets.
- **Clean Code:** Tách logic gọi API (Axios) ra thư mục `src/services/`.

## 3. Quản lý Trạng thái & Bảo mật (State Management)

- Dùng `useState` cho local state. Dùng `Zustand` cho global state.
- **Bảo mật Token:** Access Token trên Web nên ưu tiên lưu ở **HttpOnly Cookies** (được set từ Backend Nest.js) để chống XSS, hoặc chí ít là `sessionStorage`/Memory. Không lưu token nhạy cảm vào `localStorage` dạng plain text.

## 4. Xử lý Lỗi & UX (Error Handling)

- Mọi request API đều bọc trong `try/catch`.
- Bắt buộc có trạng thái `Loading...` (Skeleton layout) và Error UI.

## 5. Quy trình làm việc nhóm & GitHub (CLO2 Focus)

- **Branching:** Làm việc trên nhánh riêng. Cấm push thẳng `main`.
- **Commits:** Semantic Commits (`feat:`, `fix:`, `docs:`, `refactor:`).
- **Testing (CLO1):** Không cần Jest, nhưng code phải dễ dàng map với Test Case thủ công.
