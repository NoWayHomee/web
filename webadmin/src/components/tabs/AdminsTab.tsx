import { useState, useEffect } from "react";
import { api } from "../../api/client";

export function AdminsTab({ currentUserId }: { currentUserId: number }) {
  const [list, setList] = useState<{ id: number; email: string; fullName: string; createdAt: string }[]>([]);
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<{ id: number; email: string; fullName: string; password: string } | null>(null);
  const [editErr, setEditErr] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  async function load() {
    try {
      const result = await api("/admin/admins");
      setList(result.admins);
    } catch (error: any) {
      setErr(error.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      await api("/admin/admins", { method: "POST", body: JSON.stringify(form) });
      setMsg("Da tao admin thanh cong");
      setForm({ email: "", password: "", fullName: "" });
      await load();
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setEditErr("");
    setSavingEdit(true);
    try {
      const body: any = { email: editing.email, fullName: editing.fullName };
      if (editing.password) body.password = editing.password;
      await api(`/admin/admins/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) });
      setEditing(null);
      await load();
    } catch (error: any) {
      setEditErr(error.message);
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeAdmin(id: number) {
    if (!confirm("Xoa quan tri vien nay?")) return;
    try {
      await api(`/admin/admins/${id}`, { method: "DELETE" });
      await load();
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <form onSubmit={submit} className="bg-card border rounded-lg p-5 space-y-3 h-fit">
        <h3 className="font-semibold">Tao tai khoan admin moi</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Ho ten</label>
          <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mat khau</label>
          <input type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        {err && <div className="text-sm text-destructive">{err}</div>}
        {msg && <div className="text-sm text-green-600">{msg}</div>}
        <button disabled={loading} className="w-full py-2 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50">
          {loading ? "Dang tao..." : "Tao admin"}
        </button>
      </form>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Danh sach admin ({list.length})</div>
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-3 py-2">Ho ten</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Ngay tao</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((admin) => (
              <tr key={admin.id} className="border-t">
                <td className="px-3 py-2">{admin.fullName}{admin.id === currentUserId && <span className="ml-2 text-xs text-primary">(ban)</span>}</td>
                <td className="px-3 py-2">{admin.email}</td>
                <td className="px-3 py-2">{new Date(admin.createdAt).toLocaleString("vi-VN")}</td>
                <td className="px-3 py-2 space-x-2 whitespace-nowrap text-right">
                  <button onClick={() => setEditing({ id: admin.id, email: admin.email, fullName: admin.fullName, password: "" })} className="px-2 py-1 text-xs rounded border hover:bg-accent">
                    Sua
                  </button>
                  {admin.id !== currentUserId && (
                    <button onClick={() => removeAdmin(admin.id)} className="px-2 py-1 text-xs rounded bg-destructive text-destructive-foreground">
                      Xoa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 pt-10 z-50 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-card border rounded-lg p-5 w-full max-w-md space-y-3" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-semibold">Sua quan tri vien</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Ho ten</label>
              <input value={editing.fullName} onChange={(event) => setEditing({ ...editing, fullName: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mat khau moi <span className="text-xs text-muted-foreground">(de trong neu khong doi)</span></label>
              <input type="password" value={editing.password} onChange={(event) => setEditing({ ...editing, password: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
            </div>
            {editErr && <div className="text-sm text-destructive">{editErr}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-md border">Huy</button>
              <button onClick={saveEdit} disabled={savingEdit} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50">
                {savingEdit ? "Dang luu..." : "Luu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
