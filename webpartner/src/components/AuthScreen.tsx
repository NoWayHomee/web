import React, { useState } from "react";
import { api } from "../api/client";
import { User } from "../types";
import { Input } from "./common/Input";

export function AuthScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", fullName: "", phone: "", hotelName: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<{ email: string; hotelName: string } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") {
        const result = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        if (result.user.role !== "partner") throw new Error("Tai khoan nay khong phai doi tac");
        onLogin(result.user);
      } else {
        await api("/auth/register", { method: "POST", body: JSON.stringify(form) });
        setPending({ email: form.email, hotelName: form.hotelName });
      }
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (pending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md bg-white border rounded-xl p-8 shadow-sm text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Dang cho xet duyet</h1>
          <p className="text-sm text-muted-foreground">
            Tai khoan doi tac <span className="font-medium text-foreground">{pending.email}</span> cua co so
            <span className="font-medium text-foreground"> {pending.hotelName}</span> da duoc gui len he thong.
          </p>
          <p className="text-sm text-muted-foreground">
            Quan tri vien se kiem tra va xet duyet som nhat. Ban co the dang nhap ngay sau khi duoc duyet.
          </p>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                setPending(null);
                setMode("login");
                setForm({ email: pending.email, password: "", fullName: "", phone: "", hotelName: "" });
              }}
              className="w-full py-2 rounded-md bg-blue-600 text-blue-600-foreground font-medium"
            >
              Ve trang dang nhap
            </button>
            <button
              onClick={() => {
                setPending(null);
                setMode("register");
                setForm({ email: "", password: "", fullName: "", phone: "", hotelName: "" });
              }}
              className="w-full py-2 rounded-md border font-medium"
            >
              Dang ky tai khoan khac
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white border rounded-xl p-8 shadow-sm space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Cong doi tac</h1>
          <p className="text-sm text-muted-foreground mt-1">Quan ly khach san va dich vu luu tru</p>
        </div>
        <div className="flex gap-2 p-1 bg-muted rounded-md">
          <button
            type="button"
            onClick={() => { setMode("login"); setErr(""); }}
            className={`flex-1 py-1.5 text-sm rounded ${mode === "login" ? "bg-white shadow-sm font-medium" : "text-muted-foreground"}`}
          >
            Dang nhap
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setErr(""); }}
            className={`flex-1 py-1.5 text-sm rounded ${mode === "register" ? "bg-white shadow-sm font-medium" : "text-muted-foreground"}`}
          >
            Dang ky
          </button>
        </div>
        {mode === "register" && (
          <>
            <Input label="Ho va ten" value={form.fullName} onChange={(value) => setForm({ ...form, fullName: value })} required />
            <Input label="Ten khach san / co so" value={form.hotelName} onChange={(value) => setForm({ ...form, hotelName: value })} required />
            <Input label="So dien thoai" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
          </>
        )}
        <Input label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
        <Input label="Mat khau" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} required />
        {err && <div className="text-sm text-destructive">{err}</div>}
        <button disabled={loading} className="w-full py-2 rounded-md bg-blue-600 text-blue-600-foreground font-medium disabled:opacity-50">
          {loading ? "Dang xu ly..." : mode === "login" ? "Dang nhap" : "Dang ky"}
        </button>
        {mode === "register" && (
          <p className="text-xs text-muted-foreground text-center">Tai khoan can duoc quan tri vien duyet truoc khi dang nhap.</p>
        )}
      </form>
    </div>
  );
}
