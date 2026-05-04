import { Link, Outlet, useLocation } from "react-router-dom";
import { User } from "../types";

export function AdminLayout({ user, onLogout, notificationCount }: { user: User; onLogout: () => void, notificationCount: number }) {
  const location = useLocation();
  
  const navItems = [
    { path: "/partners", label: "Doi tac", count: 0 },
    { path: "/customers", label: "Khach hang", count: 0 },
    { path: "/bookings", label: "Dat phong", count: 0 },
    { path: "/rooms", label: "Khach san", count: 0 },
    { path: "/admins", label: "Quan tri vien", count: 0 },
    { path: "/notifications", label: "Thong bao", count: notificationCount },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Quan tri he thong</h1>
            <p className="text-xs text-muted-foreground">Xin chao, {user.fullName}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLogout} className="text-sm px-3 py-1.5 border rounded-md hover:bg-accent">Dang xuat</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-3 text-sm font-medium transition-all border-b-2 relative text-center whitespace-nowrap ${
                location.pathname === item.path ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {item.path === "/notifications" && item.count > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-destructive text-white text-[10px] font-bold rounded-full leading-none">
                  {item.count > 9 ? "9+" : item.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
