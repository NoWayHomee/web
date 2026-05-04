import { useState, useEffect } from "react";
import { api } from "../../api/client";
import { Room } from "../../types";
import { useNavigate, useLocation } from "react-router-dom";

function fmtVnd(value: number) {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

function statusLabel(status: string) {
  if (status === "approved") return "Da duyet";
  if (status === "rejected") return "Da tu choi";
  return "Cho duyet";
}

function requestLabel(request: any) {
  if (!request) return "";
  return request.action === "delete"
    ? "Dang cho admin duyet yeu cau xoa khach san"
    : "Dang cho admin duyet yeu cau sua thong tin";
}

export function RoomsTab({ onDetail }: { onDetail: (room: Room) => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message || "");
  const navigate = useNavigate();

  async function loadRooms() {
    setLoading(true);
    try {
      const result = await api("/rooms/mine");
      setRooms(result.rooms);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRooms().catch(() => {});
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  async function requestDelete(room: Room) {
    if (!confirm(`Gui yeu cau xoa phong "${room.name}"?`)) return;
    try {
      await api(`/rooms/${room.id}/request-delete`, { method: "DELETE" });
      setMessage(`Da gui yeu cau xoa khach san "${room.name}" cho admin duyet.`);
      await loadRooms();
    } catch (error: any) {
      alert(error.message);
    }
  }

  if (loading) return <div className="text-muted-foreground">Dang tai...</div>;

  return (
    <div className="space-y-4">
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {message}
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-3">Ban chua co khach san nao.</p>
          <button onClick={() => navigate("/create")} className="px-4 py-2 rounded-md bg-primary text-primary-foreground">
            Tao khach san dau tien
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {rooms.map((room) => {
            const minPrice = room.prices.length ? Math.min(...room.prices.map((item) => item.pricePerNight)) : 0;
            const hasPendingRequest = !!room.pendingRequest;
            return (
              <div key={room.id} className={`bg-card border rounded-lg p-4 ${room.pendingRequest?.action === "delete" ? "opacity-85" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold">
                      {room.name} <span className="text-xs text-muted-foreground">· {room.roomType}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{room.address}</div>
                    <div className="text-sm mt-1">
                      Tu <b>{fmtVnd(minPrice)}</b>/dem
                    </div>
                    <div className="flex gap-2 flex-wrap mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${room.status === "approved" ? "bg-green-100 text-green-700" :
                        room.status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                        {statusLabel(room.status)}
                      </span>
                      {room.pendingRequest && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                          {requestLabel(room.pendingRequest)}
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {room.images.length} anh
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {room.highlights.slice(0, 3).map((item) => (
                        <span key={item} className="text-[11px] px-2 py-1 rounded-full border bg-background">
                          {item}
                        </span>
                      ))}
                    </div>
                    {room.status === "rejected" && room.rejectReason && (
                      <div className="text-xs text-destructive mt-2">Ly do tu choi: {room.rejectReason}</div>
                    )}
                    {room.pendingRequest?.note && (
                      <div className="text-xs text-destructive mt-2">Ghi chu admin: {room.pendingRequest.note}</div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    <button
                      onClick={() => onDetail(room)}
                      className="px-3 py-1.5 text-xs rounded border hover:bg-accent"
                    >
                      Chi tiet
                    </button>
                    <button
                      onClick={() => navigate(`/edit/${room.id}`)}
                      disabled={hasPendingRequest}
                      className="px-3 py-1.5 text-xs rounded border disabled:opacity-50"
                    >
                      Sua
                    </button>
                    <button
                      onClick={() => requestDelete(room)}
                      disabled={hasPendingRequest}
                      className="px-3 py-1.5 text-xs rounded bg-destructive text-destructive-foreground disabled:opacity-50"
                    >
                      Yeu cau xoa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
