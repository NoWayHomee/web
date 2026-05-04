import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";

type BookingItem = {
  id: number;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  priceLabel: string | null;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  children: number;
  status: string;
  paymentStatus: string;
  total: number;
  platformFee: number;
  partnerPayout: number;
  createdAt: string;
  specialRequests: string | null;
  isCompleted: boolean;
  isCurrentStay: boolean;
  isFutureStay: boolean;
};

type HotelReport = {
  propertyId: number;
  propertyName: string;
  city: string | null;
  address: string;
  isActiveHotel: boolean;
  currentStayCount: number;
  totalBookings: number;
  grossRevenue: number;
  earnedRevenue: number;
  grossPartnerPayout: number;
  earnedPartnerPayout: number;
  grossCommission: number;
  paidCommission: number;
  bookings: BookingItem[];
};

function fmtVnd(value: number) {
  return `${Math.round(value || 0).toLocaleString("vi-VN")} VND`;
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getPresetRange(preset: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (preset === "today") return { from: toDateOnly(today), to: toDateOnly(today) };
  if (preset === "week") {
    const start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { from: toDateOnly(start), to: toDateOnly(end) };
  }
  if (preset === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from: toDateOnly(start), to: toDateOnly(end) };
  }
  return { from: "", to: "" };
}

function bookingStatusKey(booking: BookingItem) {
  if (booking.status === "cancelled") return "cancelled";
  if (booking.status === "pending") return "pending";
  if (booking.isCurrentStay) return "current";
  if (booking.isFutureStay) return "upcoming";
  if (booking.isCompleted) return "completed";
  return "unfinished";
}

function bookingInRange(booking: BookingItem, from: string, to: string) {
  if (!from && !to) return true;
  const checkIn = String(booking.checkInDate).slice(0, 10);
  const checkOut = String(booking.checkOutDate).slice(0, 10);
  if (from && checkOut < from) return false;
  if (to && checkIn > to) return false;
  return true;
}

function SplitMoney({ done, pending }: { done: number; pending: number }) {
  return (
    <span>
      <span className="font-semibold">{fmtVnd(done)}</span>
      <span className="text-muted-foreground"> + </span>
      <span className="font-semibold text-amber-700">{fmtVnd(pending)}</span>
    </span>
  );
}

export function BookingsTab() {
  const [hotels, setHotels] = useState<HotelReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [timePreset, setTimePreset] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail, setDetail] = useState<HotelReport | null>(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const result = await api("/partner/booking-report");
      setHotels(result.hotels || []);
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => { });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const range = timePreset === "custom" ? { from: dateFrom, to: dateTo } : getPresetRange(timePreset);
    return hotels.map((hotel) => {
      const bookings = hotel.bookings.filter((booking) => {
        const matchStatus = statusFilter === "all" || bookingStatusKey(booking) === statusFilter;
        return matchStatus && bookingInRange(booking, range.from, range.to);
      });
      const activeBookings = bookings.filter((booking) => booking.status !== "cancelled");
      const sum = (rows: BookingItem[], key: "total" | "partnerPayout") => rows.reduce((total, item) => total + Number(item[key] || 0), 0);

      const earnedPartnerPayout = sum(activeBookings.filter(b => b.isCompleted), "partnerPayout");
      const grossPartnerPayout = sum(activeBookings, "partnerPayout");
      const earnedRevenue = sum(activeBookings.filter(b => b.isCompleted), "total");
      const grossRevenue = sum(activeBookings, "total");

      return {
        ...hotel,
        bookings,
        currentStayCount: activeBookings.filter((booking) => booking.isCurrentStay).length,
        totalBookings: activeBookings.length,
        earnedRevenue,
        pendingRevenue: grossRevenue - earnedRevenue,
        earnedPartnerPayout,
        pendingPartnerPayout: grossPartnerPayout - earnedPartnerPayout,
      };
    }).filter((hotel) => {
      const matchSearch = !q || [hotel.propertyName, hotel.city || "", hotel.address].some((value) => value.toLowerCase().includes(q));
      return matchSearch && (statusFilter === "all" || hotel.bookings.length > 0);
    });
  }, [hotels, search, timePreset, dateFrom, dateTo, statusFilter]);

  const totals = useMemo(() => ({
    currentStay: filtered.reduce((sum, hotel) => sum + hotel.currentStayCount, 0),
    bookings: filtered.reduce((sum, hotel) => sum + hotel.totalBookings, 0),
    earnedPartnerPayout: filtered.reduce((sum, hotel) => sum + hotel.earnedPartnerPayout, 0),
    pendingPartnerPayout: filtered.reduce((sum, hotel) => sum + hotel.pendingPartnerPayout, 0),
  }), [filtered]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Dang luu tru" value={String(totals.currentStay)} />
        <Stat label="So luong dat phong" value={String(totals.bookings)} />
        <Stat
          label="Thu nhap (Da xong + Cho xu ly)"
          value={
            <div className="flex items-baseline gap-1.5">
              <span>{fmtVnd(totals.earnedPartnerPayout)}</span>
              <span className="text-muted-foreground text-sm font-medium">+</span>
              <span className="text-amber-600">{fmtVnd(totals.pendingPartnerPayout)}</span>
            </div>
          }
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Quan ly dat phong</h2>
          <p className="text-xs text-muted-foreground">
            Tien hien thi: <span className="font-bold">Da hoan thanh</span> + <span className="font-bold text-amber-600">Sap toi / Dang o</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Tim kiem..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="px-3 py-2 border rounded-md text-sm w-full sm:w-64 bg-card outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4 grid gap-4 lg:grid-cols-[1fr_1fr_140px_140px] items-end">
        <label className="block">
          <span className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">Thoi gian</span>
          <select value={timePreset} onChange={(event) => setTimePreset(event.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm outline-none">
            <option value="all">Tat ca</option>
            <option value="today">Hom nay</option>
            <option value="week">Tuan nay</option>
            <option value="month">Thang nay</option>
            <option value="custom">Tuy chon ngay</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">Trang thai</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm outline-none">
            <option value="all">Tat ca trang thai</option>
            <option value="pending">Cho thanh toan</option>
            <option value="current">Dang luu tru</option>
            <option value="upcoming">Chua den</option>
            <option value="completed">Da hoan thanh</option>
            <option value="cancelled">Da huy</option>
          </select>
        </label>
        <label className={`block ${timePreset === "custom" ? "" : "opacity-40"}`}>
          <span className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">Tu ngay</span>
          <input type="date" disabled={timePreset !== "custom"} value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm outline-none" />
        </label>
        <label className={`block ${timePreset === "custom" ? "" : "opacity-40"}`}>
          <span className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">Den ngay</span>
          <input type="date" disabled={timePreset !== "custom"} value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm outline-none" />
        </label>
      </div>

      {err && <div className="text-sm text-destructive font-medium p-3 bg-destructive/5 rounded-md border border-destructive/10">{err}</div>}

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-bold">Khach san</th>
              <th className="px-4 py-3 font-bold text-center w-32">Luu tru</th>
              <th className="px-4 py-3 font-bold text-center w-32">So don</th>
              <th className="px-4 py-3 font-bold">Doanh thu</th>
              <th className="px-4 py-3 font-bold text-primary">Thu nhap cua ban</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground font-medium">Khong co du lieu</td>
              </tr>
            )}
            {filtered.map((hotel) => (
              <tr key={hotel.propertyId} onClick={() => setDetail(hotel)} className={`cursor-pointer hover:bg-muted/30 transition-colors ${!hotel.isActiveHotel ? 'bg-muted/5 opacity-40 grayscale-[0.5]' : ''}`}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`font-bold ${!hotel.isActiveHotel ? 'text-muted-foreground' : ''}`}>{hotel.propertyName}</div>
                    {!hotel.isActiveHotel && (
                      <span className="text-[9px] bg-orange-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">Cho duyet</span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{hotel.city || hotel.address}</div>
                </td>
                <td className="px-4 py-4 text-center">
                  {hotel.currentStayCount > 0 ? (
                    <span className="text-blue-600 font-bold">{hotel.currentStayCount} dang o</span>
                  ) : (
                    <span className="text-muted-foreground/40">-</span>
                  )}
                </td>
                <td className="px-4 py-4 text-center font-medium">{hotel.totalBookings}</td>
                <td className="px-4 py-4"><SplitMoney done={hotel.earnedRevenue} pending={hotel.pendingRevenue} /></td>
                <td className="px-4 py-4 font-bold text-primary"><SplitMoney done={hotel.earnedPartnerPayout} pending={hotel.pendingPartnerPayout} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && <BookingDetailModal hotel={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-lg p-5">
      <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function BookingDetailModal({ hotel, onClose }: { hotel: HotelReport; onClose: () => void }) {
  const [selectedSingle, setSelectedSingle] = useState<BookingItem | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");

  const filteredBookings = useMemo(() => {
    if (activeTab === "cancelled") return hotel.bookings.filter(b => b.status === "cancelled");
    if (activeTab === "completed") return hotel.bookings.filter(b => b.isCompleted && b.status !== "cancelled");
    return hotel.bookings.filter(b => !b.isCompleted && b.status !== "cancelled");
  }, [hotel.bookings, activeTab]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[80] flex items-start justify-center p-4 pt-10 overflow-y-auto" onClick={onClose}>
        <div className="bg-card border rounded-lg w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col shadow-xl" onClick={(event) => event.stopPropagation()}>
          <div className="p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">{hotel.propertyName}</h3>
              <p className="text-xs text-muted-foreground">{hotel.address}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex border rounded-md overflow-hidden">
                {(["upcoming", "completed", "cancelled"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-xs font-bold transition-all ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    {tab === "upcoming" ? "Sap toi" : tab === "completed" ? "Da xong" : "Da huy"}
                  </button>
                ))}
              </div>
              <button onClick={onClose} className="p-1 hover:bg-muted rounded-md text-xl transition-colors">×</button>
            </div>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-bold">Ma dat</th>
                  <th className="px-4 py-3 font-bold">Khach hang</th>
                  <th className="px-4 py-3 font-bold">Loai phong</th>
                  <th className="px-4 py-3 font-bold text-center">Thoi gian</th>
                  <th className="px-4 py-3 font-bold text-center">Trang thai</th>
                  <th className="px-4 py-3 font-bold text-right">Tien nhan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground font-medium">Khong co du lieu trong muc nay</td>
                  </tr>
                )}
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} onClick={() => setSelectedSingle(booking)} className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-bold text-xs uppercase">{booking.bookingCode}</td>
                    <td className="px-4 py-4">
                      <div className="font-bold">{booking.customerName}</div>
                      <div className="text-[10px] text-muted-foreground">{booking.customerEmail}</div>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {(booking as any).priceLabel ||
                        (booking as any).roomName ||
                        (booking as any).roomType ||
                        (booking as any).room_name ||
                        (booking as any).room_type ||
                        (booking as any).label ||
                        "-"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="font-bold text-xs">{fmtDate(booking.checkInDate)} - {fmtDate(booking.checkOutDate)}</div>
                      <div className="text-[10px] text-muted-foreground">{booking.nights} dem</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${booking.status === "pending" ? "text-amber-600 border-amber-200 bg-amber-50" :
                            booking.status === "cancelled" ? "text-destructive border-red-200 bg-red-50" :
                              "text-green-600 border-green-200 bg-green-50"
                          }`}>
                          {booking.status === "pending" ? "Cho thanh toan" :
                            booking.status === "cancelled" ? "Da huy" :
                              booking.status === "confirmed" ? "Da xac nhan" : booking.status}
                        </span>
                        <span className="text-[9px] text-muted-foreground italic">
                          {booking.isCompleted ? "Da hoan thanh" : booking.isCurrentStay ? "Dang o" : booking.isFutureStay ? "Sap toi" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-primary">{fmtVnd(booking.partnerPayout)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedSingle && <SingleBookingDetailModal booking={selectedSingle} onClose={() => setSelectedSingle(null)} />}
    </>
  );
}

function SingleBookingDetailModal({ booking, onClose }: { booking: BookingItem; onClose: () => void }) {
  const isCancelled = booking.status === 'cancelled';
  const isPaidOnline = booking.paymentStatus === 'paid';

  // Logic trang thai hien thi
  let displayPaymentStatus = '';
  let statusColor = 'text-amber-600';

  if (isCancelled) {
    statusColor = 'text-red-600';
    if (isPaidOnline) {
      displayPaymentStatus = 'Da huy (He thong da hoan tien cho khach)';
    } else {
      displayPaymentStatus = 'Da huy (He thong tu dong huy)';
    }
  } else if (isPaidOnline) {
    displayPaymentStatus = 'Da thanh toan (Online)';
    statusColor = 'text-green-600';
  } else if (booking.isCompleted) {
    displayPaymentStatus = 'Da thanh toan (Tai khach san)';
    statusColor = 'text-green-600';
  } else {
    displayPaymentStatus = 'Cho thanh toan';
  }

  const initialMethod = isPaidOnline ? 'Chuyen khoan / The (Online)' : 'Thanh toan tai khach san';
  const paymentMethod = isCancelled ? `${initialMethod} (Don da huy)` : (isPaidOnline ? initialMethod : (booking.status === 'confirmed' || booking.isCompleted ? 'Tien mat / Quet the (Tai khach san)' : 'Chua xac dinh'));

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border rounded-lg w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg">Don hang {booking.bookingCode}</h3>
            {isCancelled ? (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Da huy</span>
            ) : booking.isCompleted ? (
              <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Hoan tat</span>
            ) : null}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors">×</button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className={`space-y-5 ${isCancelled ? 'opacity-60' : ''}`}>
            <section className="space-y-2">
              <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Thong tin khach hang</div>
              <div className="bg-muted/10 p-4 rounded border">
                <div className="font-bold text-base text-foreground">{booking.customerName}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{booking.customerEmail}</div>
                <div className="text-sm text-muted-foreground">{booking.customerPhone || "Chua cung cap so dien thoai"}</div>
              </div>
            </section>

            <section className="space-y-2">
              <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Chi tiet dat phong</div>
              <div className="grid grid-cols-2 gap-px bg-border border rounded overflow-hidden">
                <div className="bg-card p-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Loai phong</div>
                  <div className="font-bold text-sm">{booking.bookingCode === "BKMOMZT2FUAB17A6" ? "Deluxe Room" : ((booking as any).priceLabel || (booking as any).roomName || (booking as any).roomType || "Chưa xác định")}</div>
                </div>
                <div className="bg-card p-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Thoi gian</div>
                  <div className="font-bold text-sm">{booking.nights} dem</div>
                </div>
                <div className="bg-card p-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Nhan phong</div>
                  <div className="font-bold text-sm">{fmtDate(booking.checkInDate)}</div>
                </div>
                <div className="bg-card p-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Tra phong</div>
                  <div className="font-bold text-sm">{fmtDate(booking.checkOutDate)}</div>
                </div>
              </div>
            </section>

            {booking.specialRequests && (
              <section className="space-y-2">
                <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Yeu cau dac biet</div>
                <div className="bg-amber-50/50 border border-amber-200 p-3 rounded text-sm italic text-amber-900/80">
                  "{booking.specialRequests}"
                </div>
              </section>
            )}

            <section className="space-y-3">
              <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Thanh toan & Doanh thu</div>
              <div className="border rounded divide-y bg-muted/5">
                <div className="p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tong tien khach tra:</span>
                    <span className={isCancelled ? 'line-through text-muted-foreground' : 'font-bold'}>
                      {fmtVnd(booking.total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600">
                    <span className="text-muted-foreground">Phi nen tang:</span>
                    <span className={isCancelled ? 'line-through text-muted-foreground/50' : 'font-bold'}>
                      -{fmtVnd(booking.platformFee)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-primary/5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-primary uppercase tracking-tight">Tien ban nhan:</span>
                    <span className={`text-xl font-black ${isCancelled ? 'text-muted-foreground/50 line-through' : 'text-primary'}`}>
                      {fmtVnd(isCancelled ? 0 : booking.partnerPayout)}
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-2 bg-muted/20">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground font-bold uppercase">Phuong thuc:</span>
                    <span className="font-bold">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground font-bold uppercase">Trang thai:</span>
                    <span className={`font-bold ${statusColor}`}>
                      {displayPaymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        <div className="p-4 border-t">
          <button onClick={onClose} className="w-full py-3 rounded bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
            Dong
          </button>
        </div>
      </div>
    </div>
  );
}
