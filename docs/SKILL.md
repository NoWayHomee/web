---
name: web-frontend-coding-standards
description: Thực thi các tiêu chuẩn lập trình web frontend của dự án cho TypeScript, React, Zustand, và Axios. Sử dụng khi AI triển khai, tối ưu (refactor), đánh giá (review), hoặc kiểm tra (validate) code frontend trong repo này và bắt buộc phải tuân thủ các quy tắc nội bộ về kiểu dữ liệu nghiêm ngặt, cấu trúc component, xử lý API, và quản lý trạng thái (state).
---

# Tiêu chuẩn Lập trình Web Frontend

Bắt buộc tuân thủ các quy tắc sau khi chỉnh sửa code frontend trong repository này.

## Ưu tiên cốt lõi (Priorities)

- Giữ cho code luôn ổn định và an toàn khi chạy demo (demo-safe).
- Đảm bảo tính chặt chẽ của kiểu dữ liệu (strong type safety).
- Ưu tiên cấu trúc React rõ ràng, dễ bảo trì hơn là các cách viết code tắt/rút gọn phức tạp.

## TypeScript

- Tuyệt đối KHÔNG sử dụng `any`.
- Định nghĩa mọi dữ liệu trả về từ API (response) bằng `interface` hoặc `type` tường minh, khớp tuyệt đối với schema của dự án.
- Ưu tiên dùng `type` cho các kiểu Union và Intersection.
- Ưu tiên dùng `interface` cho các cấu trúc dữ liệu dạng Object.

## React

- Sử dụng Functional Components với Arrow Functions.
- Ưu tiên khai báo theo chuẩn `const Component: React.FC<Props> = () => {}` khi thêm mới hoặc chỉnh sửa components.
- Phân rã (Destructure) `props` ngay tại danh sách tham số đầu vào của hàm.
- Tránh logic render lồng ghép quá sâu (deeply nested); hãy tách thành các component nhỏ hơn khi cấu trúc JSX trở nên khó đọc.

## Gọi API & Quản lý State (Data Fetching And State)

- Bắt buộc sử dụng `async/await` cho các lời gọi API.
- KHÔNG sử dụng cấu trúc chuỗi `.then().catch()` để xử lý luồng request.
- Bọc mọi lời gọi API trong khối `try/catch`.
- Trong khối `catch`, phải phân tích (parse) lỗi từ Axios và hiển thị thông báo dạng Toast cho người dùng (để tránh crash app).
- Chỉ sử dụng **Zustand** cho Global State (như thông tin session đăng nhập, giỏ hàng).
- Tuyệt đối KHÔNG dùng Zustand cho Local State của Form (như input text), trừ khi có yêu cầu bắt buộc phải chia sẻ dữ liệu form đó xuyên suốt nhiều màn hình.

## Triết lý Thực chiến (Sinh tồn khi Bảo vệ Đồ án)

- **Viết code tường minh, dễ hiểu (Explicit):** Tuyệt đối không sử dụng các thủ thuật viết tắt (One-liners) hoặc logic lồng ghép phức tạp. Mọi đoạn code sinh ra phải đủ đơn giản để một sinh viên đại học có thể đọc hiểu và giải thích trôi chảy trước hội đồng bảo vệ.
- **Không trừu tượng hóa sớm (No Premature Abstraction):** Chỉ tạo các class/component dùng chung (Base/Generic) khi đoạn code đó bị lặp lại từ 3 lần trở lên (Quy tắc DRY thực tế). Tập trung vào việc code chạy đúng chức năng thay vì vẽ ra kiến trúc quá phức tạp.
- **Đóng gói UI Component (Self-contained):** Giữ cho các UI Component có tính đóng gói cao. Cấm chia nhỏ Component quá mức (Micro-components) trừ khi nó chắc chắn được tái sử dụng ở nhiều màn hình khác nhau. Tránh việc file rác tràn ngập dự án.
