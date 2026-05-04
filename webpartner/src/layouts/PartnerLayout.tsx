import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { User, PartnerNotification } from "../types";

export function PartnerLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<PartnerNotification[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    api("/auth/me")
      .then((result) => {
        if (result.user && result.user.role === "partner") {
          setUser(result.user);
        } else {
          navigate("/login");
        }
      })
      .catch(() => {
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (user) {
      api("/notifications").then(result => {
        setNotifications(result.notifications || []);
      }).catch(() => {});
    }
  }, [user, location]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const logout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {}
    navigate("/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Dang tai...</div>;
  if (!user) return null;

  const tabs = [
    { id: "rooms", label: "Khach san", path: "/" },
    { id: "bookings", label: "Dat phong", path: "/bookings" },
    { id: "create", label: "Tao moi", path: "/create" },
    { id: "notifications", label: "Thong bao", path: "/notifications", badge: unreadCount },
  ];

  const currentTab = tabs.find(t => t.path === location.pathname)?.id || "rooms";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Cong doi tac</h1>
            <p className="text-xs text-muted-foreground">{user.fullName}</p>
          </div>
          <button onClick={logout} className="text-sm px-3 py-1.5 border rounded-md hover:bg-accent">Dang xuat</button>
        </div>
        <div className="max-w-6xl mx-auto px-4 flex gap-1 flex-wrap overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`px-4 py-2 text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${currentTab === tab.id ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
              {tab.badge && tab.badge > 0 ? (
                <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full font-bold">
                  {tab.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
