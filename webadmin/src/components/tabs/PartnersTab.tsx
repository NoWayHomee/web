import { useState, useEffect, useMemo } from "react";
import { api } from "../../api/client";
import { Partner } from "../../types";
import { PartnerEditModal } from "../modals/PartnerEditModal";
import { PartnerHotelRoomsModal } from "../modals/PartnerHotelRoomsModal";

function fmtVnd(value: number) {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

export function PartnersTab({ initialFilter = "pending" }: { initialFilter?: string }) {
  const [filter, setFilter] = useState(initialFilter);
  const [list, setList] = useState<Partner[]>([]);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [reject, setReject] = useState<{ id: number; reason: string } | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: "asc" | "desc" } | null>(null);
  const itemsPerPage = 10;

  const filteredList = useMemo(() => {
    let result = [...list];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.email.toLowerCase().includes(q) || p.fullName.toLowerCase().includes(q));
    }
    if (sortConfig) {
      result.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof Partner];
        let bVal: any = b[sortConfig.key as keyof Partner];
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [list, search, sortConfig]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const currentItems = filteredList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  function requestSort(key: string) {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  }

  function SortIcon({ columnKey }: { columnKey: string }) {
    if (sortConfig?.key !== columnKey) return null;
    return <span className="ml-1 text-primary text-[10px]">{sortConfig.direction === "asc" ? "(Tang)" : "(Giam)"}</span>;
  }

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const result = await api(`/admin/partners?status=${filter}`);
      setList(result.partners);
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function approve(id: number) {
    try {
      await api(`/admin/partners/${id}/approve`, { method: "POST" });
      await load();
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function doReject() {
    if (!reject) return;
    try {
      await api(`/admin/partners/${reject.id}/reject`, { method: "POST", body: JSON.stringify({ reason: reject.reason }) });
      setReject(null);
      await load();
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function removePartner(partner: Partner) {
    if (!confirm(`Xoa doi tac "${partner.fullName}" (${partner.email})?\nThao tac nay se xoa toan bo khach san va du lieu cua doi tac.`)) return;
    try {
      await api(`/admin/partners/${partner.id}`, { method: "DELETE" });
      await load();
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="flex gap-2">
          {[["pending", "Cho duyet"], ["approved", "Da duyet"], ["rejected", "Da tu choi"]].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-md text-sm border ${filter === key ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"}`}>
              {label}
            </button>
          ))}
        </div>
        <input
          placeholder="Tim doi tac (Email, Ten)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 border rounded-md text-sm w-full sm:w-64 bg-card"
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
                <th className="px-3 py-2 cursor-pointer hover:bg-accent select-none" onClick={() => requestSort('email')}>Email <SortIcon columnKey="email" /></th>
                <th className="px-3 py-2 cursor-pointer hover:bg-accent select-none" onClick={() => requestSort('fullName')}>Ho ten <SortIcon columnKey="fullName" /></th>
                <th className="px-3 py-2 cursor-pointer hover:bg-accent select-none" onClick={() => requestSort('roomCount')}>So khach san <SortIcon columnKey="roomCount" /></th>
                <th className="px-3 py-2">Quan ly khach san</th>
                <th className="px-3 py-2 cursor-pointer hover:bg-accent select-none" onClick={() => requestSort('phone')}>SDT <SortIcon columnKey="phone" /></th>
                <th className="px-3 py-2 cursor-pointer hover:bg-accent select-none" onClick={() => requestSort('createdAt')}>Ngay DK <SortIcon columnKey="createdAt" /></th>
                <th className="px-3 py-2">Trang thai</th>
                <th className="px-3 py-2">Hanh dong</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">Khong co du lieu</td>
                </tr>
              )}
              {currentItems.map((partner) => (
                <tr key={partner.id} className="border-t">
                  <td className="px-3 py-2">{partner.email}</td>
                  <td className="px-3 py-2">{partner.fullName}</td>
                  <td className="px-3 py-2">{partner.roomCount ?? 0} KS</td>
                  <td className="px-3 py-2">
                    <button onClick={() => setSelectedPartner(partner)} className="px-2 py-1 text-xs rounded border bg-primary text-primary-foreground">Xem KS</button>
                  </td>
                  <td className="px-3 py-2">{partner.phone || "-"}</td>
                  <td className="px-3 py-2">{new Date(partner.createdAt).toLocaleString("vi-VN")}</td>
                  <td className="px-3 py-2">
                    {partner.status === "pending" ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Cho duyet</span>
                    ) : partner.status === "approved" ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Da duyet</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600" title={partner.rejectReason || ""}>Da tu choi</span>
                    )}
                  </td>
                  <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                    {partner.status === "pending" && (
                      <>
                        <button onClick={() => approve(partner.id)} className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground">Duyet</button>
                        <button onClick={() => setReject({ id: partner.id, reason: "" })} className="px-2 py-1 text-xs rounded bg-destructive text-destructive-foreground">Tu choi</button>
                      </>
                    )}
                    <button onClick={() => setEditingPartner(partner)} className="px-2 py-1 text-xs rounded border hover:bg-accent">Sua</button>
                    <button onClick={() => removePartner(partner)} className="px-2 py-1 text-xs rounded bg-destructive text-destructive-foreground">Xoa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {reject && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 pt-10 z-50 overflow-y-auto" onClick={() => setReject(null)}>
          <div className="bg-card border rounded-lg p-5 w-full max-w-md" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-semibold mb-2">Ly do tu choi</h3>
            <textarea className="w-full border rounded-md p-2 bg-background" rows={4} value={reject.reason} onChange={(event) => setReject({ ...reject, reason: event.target.value })} />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setReject(null)} className="px-3 py-1.5 rounded-md border">Huy</button>
              <button onClick={doReject} className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground">Xac nhan tu choi</button>
            </div>
          </div>
        </div>
      )}
      {editingPartner && (
        <PartnerEditModal
          partner={editingPartner}
          onClose={() => setEditingPartner(null)}
          onSaved={async () => { await load(); }}
        />
      )}
      {selectedPartner && <PartnerHotelRoomsModal partner={selectedPartner} onClose={() => setSelectedPartner(null)} />}
    </div>
  );
}
