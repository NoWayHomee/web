import { useState } from "react";
import { api } from "../api/client";
import { User } from "../types";

export function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const result = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      if (result.user.role !== "admin") throw new Error("Tai khoan nay khong phai admin");
      onLogin(result.user);
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-card border rounded-xl p-8 shadow-sm space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-foreground">Quan tri vien</h1>
          <p className="text-sm text-muted-foreground mt-1">Dang nhap he thong quan ly dat phong</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mat khau</label>
          <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        {err && <div className="text-sm text-destructive">{err}</div>}
        <button disabled={loading} className="w-full py-2 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50">
          {loading ? "Dang dang nhap..." : "Dang nhap"}
        </button>
      </form>
    </div>
  );
}
