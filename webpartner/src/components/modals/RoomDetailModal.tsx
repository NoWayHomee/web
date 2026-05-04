import { useState } from "react";
import { Room, Price, RoomChangeRequest } from "../../types";

function fmtVnd(value: number) {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

function statusLabel(status: string) {
  if (status === "approved") return "Da duyet";
  if (status === "rejected") return "Da tu choi";
  return "Cho duyet";
}

export function RoomDetailModal({ room, onClose }: { room: Room; onClose: () => void }) {
  const [selectedRoomPrice, setSelectedRoomPrice] = useState<Price | null>(null);
  const hotelFront = room.images.find(img => img.category === "hotel_front")?.url || room.images[0]?.url;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-10 z-[60] overflow-y-auto animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden mb-12 animate-in zoom-in-95 duration-300 flex flex-col" onClick={(event) => event.stopPropagation()}>
        {/* Banner Section */}
        <div className="relative h-64 md:h-80 shrink-0">
          <img src={hotelFront} alt={room.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded tracking-wider">{room.roomType}</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wider ${room.status === "approved" ? "bg-green-500" :
                room.status === "rejected" ? "bg-red-500" :
                  "bg-amber-500"
                }`}>
                {statusLabel(room.status)}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold">{room.name}</h3>
            <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {room.address}
            </p>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/60 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content Tabs / Sections */}
        <div className="p-6 md:p-8 space-y-10 overflow-y-auto">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-muted/50 border text-center">
              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Toi da</div>
              <div className="font-bold">{room.capacity} khach</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border text-center">
              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Dien tich</div>
              <div className="font-bold">{room.area || "-"} m²</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border text-center">
              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Phi nen tang</div>
              <div className="font-bold">{room.platformFeePct}%</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border text-center">
              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Khuyen mai</div>
              <div className="font-bold text-primary">-{room.promotionPct}%</div>
            </div>
          </div>

          {/* Description */}
          {room.description && (
            <div className="space-y-3">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                Gioi thieu
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line bg-muted/20 p-4 rounded-xl border border-dashed italic">
                "{room.description}"
              </p>
            </div>
          )}

          {/* Room Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Cac loai phong ({room.prices.length})
            </h4>
            <div className="grid gap-4">
              {room.prices.map((price, index) => (
                <div key={index} onClick={() => setSelectedRoomPrice(price)} className="group border rounded-2xl overflow-hidden hover:border-primary cursor-pointer transition-all shadow-sm bg-muted/5 flex flex-col md:flex-row">
                  {(price.imageUrls?.length > 0) && (
                    <div className="md:w-56 aspect-video md:aspect-square shrink-0 border-b md:border-b-0 md:border-r overflow-hidden bg-muted relative">
                      <img src={price.imageUrls[0]} alt={price.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      {price.imageUrls.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded backdrop-blur-sm">
                          +{price.imageUrls.length - 1} anh
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-lg group-hover:text-primary transition-colors">{price.label}</h5>
                        <div className="text-right">
                          <div className="text-primary font-bold text-lg">{fmtVnd(price.pricePerNight)}</div>
                          <div className="text-[10px] text-muted-foreground">/ dem</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">📏 {price.area || "-"} m²</span>
                        <span className="flex items-center gap-1">👥 {price.capacity || "-"} nguoi</span>
                        {price.bedInfo && <span className="flex items-center gap-1">🛏️ {price.bedInfo}</span>}
                      </div>
                      {price.amenities && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {price.amenities.split(",").slice(0, 4).map((a, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {a.trim()}
                            </span>
                          ))}
                          {price.amenities.split(",").length > 4 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                              +{price.amenities.split(",").length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Xem chi tiet hang phong
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights & Amenities */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                Tien ich chung
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {room.amenities.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 text-xs">
                    <span className="text-primary text-lg">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                Diem noi bat
              </h4>
              <div className="flex flex-wrap gap-2">
                {room.highlights.map((item, index) => (
                  <span key={index} className="text-xs px-3 py-1.5 rounded-full border bg-background shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Location & Nearby */}
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xl font-bold text-foreground">Di dau gan day</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Cot 1: Giao thong & Tien ich */}
              <div className="space-y-4">
                <h6 className="font-bold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>
                  Giao thong & Tien ich
                </h6>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {room.nearbyPlaces.filter(p => ["San bay", "Ga tau", "Ben xe", "Y te", "Nha thuoc", "Ngan hang", "ATM", "Cay xang", "Cho", "TTTM", "Sieu thi", "Tien loi"].includes(p.type)).length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">Khong co du lieu</div>
                  ) : (
                    room.nearbyPlaces.filter(p => ["San bay", "Ga tau", "Ben xe", "Y te", "Nha thuoc", "Ngan hang", "ATM", "Cay xang", "Cho", "TTTM", "Sieu thi", "Tien loi"].includes(p.type)).map((place, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="mt-1 text-primary shrink-0 opacity-70">
                          {place.type.includes("San bay") ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>
                          ) : place.type.includes("Ga") || place.type.includes("Ben") ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M9 18h6" /><path d="M8 14h.01" /><path d="M16 14h.01" /><path d="M4 10h16" /></svg>
                          ) : place.type.includes("Y te") || place.type.includes("Nha thuoc") ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2h2v20h-2z" /><path d="M2 11h20v2z" /></svg>
                          ) : place.type.includes("Ngan hang") || place.type.includes("ATM") ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 6l7-3 7 3" /><path d="M4 10v11" /><path d="M20 10v11" /><path d="M8 14v3" /><path d="M12 14v3" /><path d="M16 14v3" /></svg>
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="2" /><circle cx="17" cy="19" r="2" /><path d="M17 17H6V3H4" /><path d="M6 5h15l-1.5 9H6" /></svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium leading-tight">{place.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-tighter opacity-60">{place.type} · {place.distanceM >= 1000 ? `${(place.distanceM / 1000).toFixed(1)} km` : `${place.distanceM} m`}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cot 2: Dia danh noi tieng */}
              <div className="space-y-4">
                <h6 className="font-bold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  Dia danh noi tieng
                </h6>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {room.nearbyPlaces.filter(p => p.type === "Du lich").length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">Khong co du lieu</div>
                  ) : (
                    room.nearbyPlaces.filter(p => p.type === "Du lich").map((place, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="mt-1 text-primary shrink-0 opacity-70">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium leading-tight">{place.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-tighter opacity-60">{place.distanceM >= 1000 ? `${(place.distanceM / 1000).toFixed(1)} km` : `${place.distanceM} m`}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cot 3: Dia danh gan day */}
              <div className="space-y-4">
                <h6 className="font-bold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                  Dia danh gan day
                </h6>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {room.nearbyPlaces.filter(p => !["San bay", "Ga tau", "Ben xe", "Y te", "Nha thuoc", "Ngan hang", "ATM", "Cay xang", "Cho", "TTTM", "Sieu thi", "Tien loi", "Du lich"].includes(p.type)).length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">Khong co du lieu</div>
                  ) : (
                    room.nearbyPlaces.filter(p => !["San bay", "Ga tau", "Ben xe", "Y te", "Nha thuoc", "Ngan hang", "ATM", "Cay xang", "Cho", "TTTM", "Sieu thi", "Tien loi", "Du lich"].includes(p.type)).map((place, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="mt-1 text-primary shrink-0 opacity-70">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium leading-tight">{place.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-tighter opacity-60">{place.type} · {place.distanceM >= 1000 ? `${(place.distanceM / 1000).toFixed(1)} km` : `${place.distanceM} m`}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Policy */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Chinh sach & Quy dinh
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border bg-muted/50 space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Check-in / Check-out</div>
                <div className="font-bold text-sm">{room.policy.checkInTime} — {room.policy.checkOutTime}</div>
              </div>
              <div className="p-4 rounded-2xl border bg-muted/50 space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Huy phong</div>
                <div className="font-bold text-sm text-primary">{room.policy.refundable ? `Hoan tien (${room.policy.freeCancelHours}h)` : "Khong hoan tien"}</div>
              </div>
              <div className="p-4 rounded-2xl border bg-muted/50 space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Vat nuoi / Hut thuoc</div>
                <div className="font-bold text-sm">
                  {room.policy.petAllowed ? "Duoc phep" : "Khong"} / {room.policy.smokingAllowed ? "Duoc phep" : "Khong"}
                </div>
              </div>
            </div>
            {room.policy.otherRules && (
              <div className="p-5 rounded-2xl border border-dashed bg-muted/20">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Luu y quan trong</div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{room.policy.otherRules}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/50 flex justify-between items-center px-8 shrink-0">
          <div className="text-xs text-muted-foreground italic">
            Doi tac co the sua thong tin bang nut Chinh sua o danh sach.
          </div>
          <button onClick={onClose} className="px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">
            Dong
          </button>
        </div>
      </div>

      {/* Selected Room Category Detail Overlay */}
      {selectedRoomPrice && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedRoomPrice(null)}>
          <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="relative h-64 md:h-80 bg-muted shrink-0">
              <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
                {selectedRoomPrice.imageUrls.map((url, idx) => (
                  <img key={idx} src={url} alt="" className="w-full h-full object-cover shrink-0 snap-start" />
                ))}
              </div>
              <button onClick={() => setSelectedRoomPrice(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/60 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {selectedRoomPrice.imageUrls.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/50 text-white text-[10px] font-bold rounded-full backdrop-blur-md border border-white/20">
                  Cuon ngang de xem {selectedRoomPrice.imageUrls.length} anh
                </div>
              )}
            </div>
            <div className="p-8 overflow-y-auto space-y-8">
              <div>
                <h3 className="text-3xl font-bold mb-2">{selectedRoomPrice.label}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{fmtVnd(selectedRoomPrice.pricePerNight)}</span>
                  <span className="text-sm text-muted-foreground font-medium">/ dem</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-y">
                <div className="text-center">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Dien tich</div>
                  <div className="font-bold text-lg">{selectedRoomPrice.area || "-"} m²</div>
                </div>
                <div className="text-center border-x">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Suc chua</div>
                  <div className="font-bold text-lg">{selectedRoomPrice.capacity || "-"} khach</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Giuong</div>
                  <div className="font-bold text-lg">{selectedRoomPrice.bedInfo || "-"}</div>
                </div>
              </div>

              {selectedRoomPrice.amenities && (
                <div className="space-y-4">
                  <div className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Tien ich phong nghi</div>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedRoomPrice.amenities.split(",").map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm p-3 rounded-xl border bg-muted/10">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
                        <span className="font-medium">{item.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-muted/20 flex justify-end shrink-0">
              <button onClick={() => setSelectedRoomPrice(null)} className="px-10 py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:shadow-xl hover:shadow-primary/30 transition-all">Dong</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
