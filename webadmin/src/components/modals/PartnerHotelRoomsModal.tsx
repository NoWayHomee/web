import { useState, useEffect, useRef } from "react";
import { api } from "../../api/client";
import { Room, RoomChangeRequest } from "../../types";
import { RoomEditModal } from "./RoomEditModal";

function fmtVnd(value: number) {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

function RequestPayloadPreview({ request }: { request: RoomChangeRequest | null }) {
  if (!request) return null;
  if (request.action === "delete") {
    return (
      <div className="mt-4 border rounded-lg p-4 bg-amber-50 border-amber-200 text-sm text-amber-800">
        Doi tac da gui yeu cau xoa phong nay.
      </div>
    );
  }

  const payload = request.payload || {};
  const prices = Array.isArray(payload.prices) ? payload.prices : [];
  const amenities = Array.isArray(payload.amenities) ? payload.amenities : [];
  const nearbyPlaces = Array.isArray(payload.nearbyPlaces) ? payload.nearbyPlaces : [];

  return (
    <div className="mt-4 border rounded-lg p-4 space-y-3">
      <div className="font-semibold">Noi dung doi tac gui de duyet</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-muted-foreground">Ten:</span> {payload.name || "-"}</div>
        <div><span className="text-muted-foreground">Loai:</span> {payload.roomType || "-"}</div>
        <div><span className="text-muted-foreground">Suc chua:</span> {payload.capacity || "-"}</div>
        <div><span className="text-muted-foreground">Dien tich:</span> {payload.area ?? "-"} m²</div>
        <div><span className="text-muted-foreground">Phi nen tang:</span> {payload.platformFeePct ?? "-"}%</div>
        <div><span className="text-muted-foreground">Khuyen mai:</span> {payload.promotionPct ?? "-"}%</div>
        <div className="col-span-2"><span className="text-muted-foreground">Dia chi:</span> {payload.address || "-"}</div>
      </div>
      {payload.description && <div className="text-sm text-muted-foreground">{payload.description}</div>}
      <div>
        <div className="text-sm font-medium mb-1">Danh sach phong moi</div>
        <div className="space-y-3">
          {prices.length === 0 && <div className="text-sm text-muted-foreground">Khong co du lieu phong</div>}
          {prices.map((price: any, index: number) => (
            <div key={index} className="border rounded-md p-3 bg-muted/10">
              <div className="flex justify-between font-medium text-sm">
                <span>{price.label}</span>
                <span className="text-primary font-bold">{fmtVnd(Number(price.pricePerNight) || 0)}/dem</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground mt-2 border-t pt-2">
                <div>• Dien tich: {price.area || "-"} m2</div>
                <div>• Suc chua: {price.capacity || "-"} nguoi</div>
                {price.amenities && <div className="col-span-2 italic">• Tien ich: {price.amenities}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-1">Tien ich</div>
        <div className="flex flex-wrap gap-1">
          {amenities.length === 0 && <span className="text-sm text-muted-foreground">Khong co</span>}
          {amenities.map((item: string, index: number) => <span key={index} className="text-xs px-2 py-0.5 rounded bg-secondary">{item}</span>)}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-1">Dia diem lan can ({nearbyPlaces.length})</div>
        <ul className="text-xs space-y-0.5 max-h-40 overflow-y-auto">
          {nearbyPlaces.map((place: any, index: number) => (
            <li key={index}>• {place.name} <span className="text-muted-foreground">({place.type}, {place.distanceM}m)</span></li>
          ))}
        </ul>
      </div>
      <div>
        <div className="text-sm font-medium mb-1">Diem noi bat</div>
        <div className="flex flex-wrap gap-1">
          {(payload.highlights || []).length === 0 && <span className="text-sm text-muted-foreground">Khong co</span>}
          {(payload.highlights || []).map((item: string, index: number) => <span key={index} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{item}</span>)}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-1">Ket noi giao thong</div>
        <ul className="text-xs space-y-1">
          {(payload.transportConnections || []).length === 0 && <li className="text-muted-foreground">Khong co du lieu</li>}
          {(payload.transportConnections || []).map((tc: any, index: number) => (
            <li key={index}>• <span className="font-medium">{tc.name}</span>: {tc.distance} {tc.note && <span className="text-muted-foreground italic">({tc.note})</span>}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PartnerHotelRoomsModal({ partner, onClose }: { partner: any; onClose: () => void }) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [detail, setDetail] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const result = await api(`/admin/partners/${partner.id}/rooms`);
      setList(result.rooms);
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeRoom(room: any) {
    if (!confirm(`Xoa khach san "${room.name}"?`)) return;
    try {
      await api(`/admin/rooms/${room.id}`, { method: "DELETE" });
      await load();
      setDetail(null);
    } catch (error: any) {
      alert(error.message);
    }
  }

  useEffect(() => {
    load();
  }, [partner]);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 pt-10 z-50 overflow-y-auto" onClick={onClose}>
        <div className="bg-card border rounded-lg p-6 w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Khach san cua {partner.fullName}</h3>
            <button onClick={onClose} className="px-3 py-1.5 rounded-md border">Dong</button>
          </div>
          {err && <div className="text-sm text-destructive mb-2">{err}</div>}
          {loading ? (
            <div className="text-muted-foreground">Dang tai...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-3 py-2">Khach san</th>
                  <th className="px-3 py-2">Hang sao</th>
                  <th className="px-3 py-2">Trang thai</th>
                  <th className="px-3 py-2">Gia thap nhat</th>
                  <th className="px-3 py-2">Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">Khong co du lieu</td></tr>
                )}
                {list.map(room => {
                  const minPrice = room.prices.length ? Math.min(...room.prices.map((p: any) => p.pricePerNight)) : 0;
                  return (
                    <tr key={room.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{room.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{room.roomType.includes("sao") ? room.roomType : `${room.roomType} sao`}</td>
                      <td className="px-3 py-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{room.status}</span>
                      </td>
                      <td className="px-3 py-2">{fmtVnd(minPrice)}</td>
                      <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                        <button onClick={() => { setDetail(room); }} className="px-2 py-1 text-xs rounded border hover:bg-accent">Chi tiet</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 pt-10 z-[60] overflow-y-auto" onClick={() => setDetail(null)}>
          <div className="bg-card border rounded-lg w-full max-w-3xl my-8 flex flex-col h-[85vh] overflow-hidden shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="p-6 border-b shrink-0 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-primary">{detail.name}</h3>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <span>{detail.city || detail.partnerHotelName}</span>
                  <span>•</span>
                  <span>{detail.roomType.includes("sao") ? detail.roomType : `${detail.roomType} sao`}</span>
                </div>
              </div>
              <div className="flex gap-3">
                {!detail.pendingRequest && (
                  <>
                    <button onClick={() => { setEditing(detail); setDetail(null); }} className="px-3 py-1.5 rounded-md border text-sm hover:bg-accent">Sua</button>
                    <button onClick={() => removeRoom(detail)} className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-sm">Xoa</button>
                  </>
                )}
                <button onClick={() => setDetail(null)} className="p-2 hover:bg-accent rounded-full">
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
            </div>

            <div className="flex border-b overflow-x-auto no-scrollbar bg-card shrink-0 px-2 items-center justify-between">
              <div className="flex">
                {[
                  { id: "overview", label: "Tong quan" },
                  { id: "rooms", label: "Phong nghi" },
                  { id: "facilities", label: "Co so vat chat" },
                  { id: "location", label: "Vi tri" },
                  { id: "policy", label: "Chinh sach" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const el = document.getElementById(`modal-sec-${tab.id}`);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="px-5 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                Ve dau trang ^
              </button>
            </div>

            <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-12 scroll-smooth">
              <section id="modal-sec-overview" className="space-y-6">
                <h4 className="text-lg font-bold border-b pb-2 text-primary">Tong quan</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-muted/10 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Doi tac</div>
                    <div className="font-bold text-primary truncate">{detail.partnerEmail}</div>
                  </div>
                  <div className="p-4 rounded-xl border bg-muted/10 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Trang thai</div>
                    <div className="font-bold text-primary">{detail.pendingRequest ? "Dang co yeu cau" : detail.status}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-semibold text-sm">Mo ta khach san</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{detail.description || "Chua co mo ta"}</p>
                </div>

                {detail.highlights && detail.highlights.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-semibold text-sm">Diem noi bat</h5>
                    <div className="flex flex-wrap gap-2">
                      {detail.highlights.map((item: string, index: number) => (
                        <span key={index} className="text-xs px-3 py-1.5 rounded-full border bg-card shadow-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h5 className="font-semibold text-sm">Anh khach san ({detail.images?.length || 0})</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {detail.images.map((img: any, index: number) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden border group relative">
                        <img src={img.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-[10px] text-white bg-black/40 px-2 py-0.5 rounded">{img.category || "Khac"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {detail.pendingRequest && (
                  <div className="border-t pt-4">
                    <div className="text-sm font-bold mb-2">Du kien thay doi (Yeu cau moi):</div>
                    <RequestPayloadPreview request={detail.pendingRequest} />
                  </div>
                )}
              </section>

              <section id="modal-sec-rooms" className="space-y-6">
                <h4 className="text-lg font-bold border-b pb-2 text-primary">Phong nghi</h4>
                <div className="grid gap-4">
                  {detail.prices.map((price: any, index: number) => (
                    <div key={index} className="border rounded-xl overflow-hidden hover:border-primary transition-all shadow-sm bg-card flex flex-col md:flex-row group">
                      {(price.imageUrls?.length > 0 || price.imageUrl) && (
                        <div className="md:w-64 aspect-video md:aspect-square shrink-0 border-b md:border-b-0 md:border-r overflow-hidden bg-muted/10 relative">
                          <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar">
                            {(price.imageUrls?.length > 0 ? price.imageUrls : [price.imageUrl]).map((url: string, uIdx: number) => (
                              <img key={uIdx} src={url} alt={price.label} className="w-full h-full object-cover shrink-0 snap-start transition-transform duration-500 group-hover:scale-105" />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-bold text-lg group-hover:text-primary transition-colors">{price.label}</h5>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">Dien tich: {price.area || "-"} m2</span>
                                <span className="flex items-center gap-1">Toi da: {price.capacity || "-"} nguoi</span>
                                {price.bedInfo && <span className="text-primary font-medium flex items-center gap-1">Giuong: {price.bedInfo}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-primary font-bold text-lg">{fmtVnd(price.pricePerNight)}</div>
                              <div className="text-[10px] text-muted-foreground">/ dem</div>
                            </div>
                          </div>
                          {price.amenities && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {price.amenities.split(",").map((a: string, i: number) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                  {a.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="modal-sec-facilities" className="space-y-6">
                <h4 className="text-lg font-bold border-b pb-2 text-primary">Co so vat chat</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {detail.amenities.map((item: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-4 rounded-xl border bg-muted/10 shadow-sm hover:border-primary/20 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section id="modal-sec-location" className="space-y-8">
                <h4 className="text-lg font-bold border-b pb-2 text-primary">Vi tri</h4>
                <div className="space-y-4">
                  <h5 className="font-bold text-xl">{detail.city || "Vi tri khach san"}</h5>
                  <p className="text-muted-foreground text-sm">{detail.address}</p>
                  <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                    <div className="px-3 py-1 rounded border">Lat: {detail.latitude}</div>
                    <div className="px-3 py-1 rounded border">Long: {detail.longitude}</div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-xl text-foreground">Di dau gan day</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <h6 className="font-bold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 border-b pb-2">Giao thong & Tien ich</h6>
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {detail.nearbyPlaces.filter((p: any) => ["San bay", "Ga tau", "Ben xe", "Y te", "Nha thuoc", "Ngan hang", "ATM", "Cay xang", "Cho", "TTTM", "Sieu thi", "Tien loi"].includes(p.type)).map((place: any, idx: number) => (
                          <div key={idx} className="flex gap-3">
                            <div>
                              <div className="text-sm font-medium leading-tight">{place.name}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-tighter opacity-60">{place.type} · {place.distanceM >= 1000 ? `${(place.distanceM / 1000).toFixed(1)} km` : `${place.distanceM} m`}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h6 className="font-bold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 border-b pb-2">Dia danh noi tieng</h6>
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {detail.nearbyPlaces.filter((p: any) => p.type === "Du lich").map((place: any, idx: number) => (
                          <div key={idx} className="flex gap-3">
                            <div>
                              <div className="text-sm font-medium leading-tight">{place.name}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-tighter opacity-60">{place.distanceM >= 1000 ? `${(place.distanceM / 1000).toFixed(1)} km` : `${place.distanceM} m`}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h6 className="font-bold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 border-b pb-2">Dia danh gan day</h6>
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {detail.nearbyPlaces.filter((p: any) => !["San bay", "Ga tau", "Ben xe", "Y te", "Nha thuoc", "Ngan hang", "ATM", "Cay xang", "Cho", "TTTM", "Sieu thi", "Tien loi", "Du lich"].includes(p.type)).map((place: any, idx: number) => (
                          <div key={idx} className="flex gap-3">
                            <div>
                              <div className="text-sm font-medium leading-tight">{place.name}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-tighter opacity-60">{place.type} · {place.distanceM >= 1000 ? `${(place.distanceM / 1000).toFixed(1)} km` : `${place.distanceM} m`}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="modal-sec-policy" className="space-y-6 pb-10">
                <h4 className="text-lg font-bold border-b pb-2 text-primary">Chinh sach</h4>
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-muted/10">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Gio nhan phong</div>
                      <div className="font-medium">{detail.policy.checkInTime || "--:--"}</div>
                    </div>
                    <div className="p-4 rounded-xl border bg-muted/10">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Gio tra phong</div>
                      <div className="font-medium">{detail.policy.checkOutTime || "--:--"}</div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 rounded-xl border flex items-center justify-between">
                      <span className="font-medium">Hoan tien</span>
                      <span className={`text-xs font-bold ${detail.policy.refundable ? "text-green-600" : "text-destructive"}`}>
                        {detail.policy.refundable ? "CO" : "KHONG"}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border flex items-center justify-between">
                      <span className="font-medium">Vat nuoi</span>
                      <span className={`text-xs font-bold ${detail.policy.petAllowed ? "text-green-600" : "text-destructive"}`}>
                        {detail.policy.petAllowed ? "CHO PHEP" : "KHONG"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <RoomEditModal
          room={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { await load(); }}
        />
      )}
    </>
  );
}
