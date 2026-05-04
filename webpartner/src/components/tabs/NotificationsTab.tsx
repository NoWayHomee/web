import { useState, useEffect } from "react";
import { api } from "../../api/client";
import { PartnerNotification } from "../../types";
import { useNavigate } from "react-router-dom";

export function NotificationsTab() {
  const [list, setList] = useState<PartnerNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const result = await api("/notifications");
      setList(result.notifications || []);
    } catch { }
    finally { setLoading(false); }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: number) {
    try {
      await api(`/notifications/${id}/read`, { method: "POST" });
      setList(list.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { }
  }

  async function remove(id: number) {
    if (!confirm("Xoa thong bao nay?")) return;
    try {
      await api(`/notifications/${id}`, { method: "DELETE" });
      setList(list.filter(n => n.id !== id));
    } catch { }
  }

  async function markReadAll() {
    try {
      await api("/notifications/read-all", { method: "POST" });
      setList(list.map(n => ({ ...n, isRead: true })));
    } catch { }
  }

  function handleClick(n: PartnerNotification) {
    markRead(n.id);
    navigate("/"); // Quay lai danh sach khach san de xem thay doi
  }

  if (loading && list.length === 0) return <div className="text-center py-20 text-gray-500 animate-pulse">Dang tai thong bao...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Trung tam thong bao</h2>
          <p className="text-sm text-muted-foreground">Theo doi cac phan hoi tu quan tri vien</p>
        </div>

        {list.length > 0 && (
          <button
            onClick={markReadAll}
            className="text-xs px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-full transition-all font-medium"
          >
            Danh dau da doc tat ca
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="py-20 text-center border rounded-2xl bg-muted/20 border-dashed">
          <div className="text-muted-foreground italic text-sm">Chưa có thông báo nào</div>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm divide-y">
          {list.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className={`p-5 hover:bg-accent cursor-pointer transition-colors flex gap-4 items-start relative group ${!item.isRead ? "bg-primary/5 border-l-4 border-l-primary" : "opacity-80"}`}
            >
              <div className={`w-1.5 h-1.5 mt-2 rounded-full shrink-0 ${!item.isRead ? "bg-primary animate-pulse" : "bg-transparent"}`} />
              <div className="flex-1 min-w-0 text-left pr-8">
                <div className="flex justify-between items-start mb-1">
                  <div className={`font-bold text-sm ${!item.isRead ? "text-foreground" : "text-muted-foreground"}`}>{item.title}</div>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                {item.body && <div className="text-xs text-muted-foreground leading-relaxed">{item.body}</div>}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-muted rounded text-muted-foreground">
                    {item.type.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); remove(item.id); }}
                className="absolute right-5 top-5 w-6 h-6 flex items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                title="Xoa"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
