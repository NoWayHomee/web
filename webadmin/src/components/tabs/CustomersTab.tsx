import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Customer } from "../../types";

function fmtDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
}

export function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const result = await api(`/admin/customers?${params.toString()}`);
      setCustomers(result.customers || []);
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      load().catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">Khach hang</h2>
          <p className="text-sm text-muted-foreground">Quan ly cac tai khoan khach hang da duoc tao.</p>
        </div>
        <input
          placeholder="Tim ten, email, so dien thoai..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="px-3 py-1.5 border rounded-md text-sm w-full sm:w-72 bg-card"
        />
      </div>

      {err && <div className="text-sm text-destructive">{err}</div>}
      {loading ? (
        <div className="text-muted-foreground">Dang tai...</div>
      ) : (
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-3 py-2">Khach hang</th>
                <th className="px-3 py-2">Lien he</th>
                <th className="px-3 py-2">Trang thai</th>
                <th className="px-3 py-2">Ngay tao</th>
                <th className="px-3 py-2">Dang nhap cuoi</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">Khong co khach hang</td>
                </tr>
              )}
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{customer.fullName}</div>
                    <div className="text-[10px] text-muted-foreground">ID: {customer.id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div>{customer.email}</div>
                    <div className="text-[10px] text-muted-foreground">{customer.phone || "-"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${customer.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{fmtDate(customer.createdAt)}</td>
                  <td className="px-3 py-2">{fmtDate(customer.lastLoginAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
