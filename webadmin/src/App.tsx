import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "./api/client";
import { User } from "./types";
import { Login } from "./components/Login";
import { AdminLayout } from "./layouts/AdminLayout";
import { PartnersTab } from "./components/tabs/PartnersTab";
import { CustomersTab } from "./components/tabs/CustomersTab";
import { BookingsTab } from "./components/tabs/BookingsTab";
import { RoomsTab } from "./components/tabs/RoomsTab";
import { AdminsTab } from "./components/tabs/AdminsTab";
import { NotificationsTab } from "./components/tabs/NotificationsTab";

function Root() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  async function check() {
    try {
      const result = await api("/auth/me");
      if (result.user.role === "admin") {
        setUser(result.user);
        loadUnread();
      }
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }

  async function loadUnread() {
    try {
      const result = await api("/notifications/unread-count");
      setUnreadCount(result.count || 0);
    } catch { }
  }

  useEffect(() => {
    check();
    const timer = setInterval(loadUnread, 30000);
    return () => clearInterval(timer);
  }, []);

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
      navigate("/login");
    } catch (error: any) {
      alert(error.message);
    }
  }

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Dang tai...</div>;

  const handleNavigate = (path: string, filter: string) => {
    navigate(`${path}?filter=${filter}`);
  };

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/partners" /> : <Login onLogin={(u) => { setUser(u); navigate("/partners"); }} />} />
      <Route path="/" element={user ? <AdminLayout user={user} onLogout={logout} notificationCount={unreadCount} /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/partners" />} />
        <Route path="partners" element={<PartnersTab initialFilter={searchParams.get("filter") || "pending"} />} />
        <Route path="customers" element={<CustomersTab />} />
        <Route path="bookings" element={<BookingsTab />} />
        <Route path="rooms" element={<RoomsTab initialFilter={searchParams.get("filter") || "pending"} />} />
        <Route path="admins" element={<AdminsTab currentUserId={user?.id || 0} />} />
        <Route path="notifications" element={<NotificationsTab onNavigate={(tab, filter) => handleNavigate(`/${tab}`, filter)} onRefreshCount={loadUnread} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  );
}
