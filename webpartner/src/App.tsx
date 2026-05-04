import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { api } from "./api/client";
import { User, Room } from "./types";
import { PartnerLayout } from "./layouts/PartnerLayout";
import { RoomsTab } from "./components/tabs/RoomsTab";
import { BookingsTab } from "./components/tabs/BookingsTab";
import { NotificationsTab } from "./components/tabs/NotificationsTab";
import { RoomEditorForm } from "./components/RoomEditorForm";
import { RoomDetailModal } from "./components/modals/RoomDetailModal";
import { Login } from "./components/Login";

function PartnerDashboard() {
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  
  return (
    <PartnerLayout>
      <RoomsTab onDetail={setViewingRoom} />
      {viewingRoom && (
        <RoomDetailModal room={viewingRoom} onClose={() => setViewingRoom(null)} />
      )}
    </PartnerLayout>
  );
}

function CreateRoomPage() {
  const navigate = useNavigate();
  return (
    <PartnerLayout>
      <RoomEditorForm 
        mode="create" 
        onDone={(msg) => {
          navigate("/", { state: { message: msg } });
        }}
        onCancel={() => navigate("/")}
      />
    </PartnerLayout>
  );
}

function EditRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api(`/rooms/${id}`);
        setRoom(res.room);
      } catch (err: any) {
        // Error handled by !room check below
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <PartnerLayout><div className="text-center py-10 text-gray-500">Dang tai du lieu phong...</div></PartnerLayout>;
  if (!room) return <PartnerLayout><div className="text-center py-10 text-red-600 font-bold">Khong tim thay phong!</div></PartnerLayout>;

  return (
    <PartnerLayout>
      <RoomEditorForm 
        mode="edit" 
        room={room}
        onDone={(msg) => {
          navigate("/", { state: { message: msg } });
        }}
        onCancel={() => navigate("/")}
      />
    </PartnerLayout>
  );
}

function NotificationsPage() {
  return (
    <PartnerLayout>
      <NotificationsTab />
    </PartnerLayout>
  );
}

function BookingsPage() {
  return (
    <PartnerLayout>
      <BookingsTab />
    </PartnerLayout>
  );
}

function Root() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  async function check() {
    try {
      const result = await api("/auth/me");
      if (result.user.role === "partner") {
        setUser(result.user);
      }
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    check();
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

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={(u) => { setUser(u); navigate("/"); }} />} />
      <Route path="/" element={user ? <PartnerDashboard /> : <Navigate to="/login" />} />
      <Route path="/bookings" element={user ? <BookingsPage /> : <Navigate to="/login" />} />
      <Route path="/create" element={user ? <CreateRoomPage /> : <Navigate to="/login" />} />
      <Route path="/edit/:id" element={user ? <EditRoomPage /> : <Navigate to="/login" />} />
      <Route path="/notifications" element={user ? <NotificationsPage /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
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
