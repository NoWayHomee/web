import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// Giả định các pages nhóm sẽ tạo sau
// import Home from '../pages/Home';
// import SearchResults from '../pages/SearchResults';
// import Checkout from '../pages/Checkout';

const router = createBrowserRouter([
  {
    path: '/',
    // element: <MainLayout />, // Layout chứa Header & Footer
    children: [
      {
        index: true,
        element: <div>Trang chủ (Home) - Component tìm kiếm sẽ đặt ở đây</div>,
      },
      {
        path: 'search',
        element: <div>Trang Kết quả tìm kiếm & Bộ lọc</div>,
      },
      {
        path: 'property/:id',
        element: <div>Chi tiết Chỗ nghỉ (Hình ảnh, Tiện ích, Chọn phòng)</div>,
      },
      {
        path: 'checkout',
        element: <div>Trang Đặt phòng & Thanh toán (Yêu cầu đăng nhập)</div>,
      }
    ],
  },
  {
    path: '/login',
    element: <div>Trang Đăng nhập / Đăng ký</div>,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};