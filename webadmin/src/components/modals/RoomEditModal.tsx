import { useState } from "react";
import { api } from "../../api/client";
import { Room, ROOM_TYPES, IMAGE_LABELS } from "../../types";

function buildEditableRoom(room: Room) {
  return {
    id: room.id,
    name: room.name,
    description: room.description || "",
    roomType: room.roomType,
    address: room.address,
    city: room.city || "",
    latitude: String(room.latitude),
    longitude: String(room.longitude),
    area: room.area == null ? "" : String(room.area),
    capacity: String(room.capacity),
    platformFeePct: String(room.platformFeePct),
    promotionPct: String(room.promotionPct),
    amenities: room.amenities.join(", "),
    prices: room.prices.length
      ? room.prices.map((p: any) => ({
        label: p.label,
        pricePerNight: p.pricePerNight.toString(),
        area: (p.area || "").toString(),
        capacity: (p.capacity || "").toString(),
        amenities: p.amenities || "",
        imageUrls: p.imageUrls || (p.imageUrl ? [p.imageUrl] : []),
        bedInfo: p.bedInfo || "",
      }))
      : [{ label: "", pricePerNight: "", area: "", capacity: "", amenities: "", imageUrls: [], bedInfo: "" }],
    nearbyPlaces: room.nearbyPlaces.length
      ? room.nearbyPlaces.map((item) => ({
        name: item.name,
        type: item.type,
        distanceM: String(item.distanceM),
        lat: String(item.lat),
        lon: String(item.lon),
      }))
      : [{ name: "", type: "", distanceM: "", lat: "", lon: "" }],
    images: (() => {
      const requiredKeys = ["hotel_front", "lobby", "room_overview", "common_area", "exterior"];
      const currentImages = (room.images || []).filter(img => img.url.trim());

      const result = requiredKeys.map(key => {
        const existing = currentImages.find(img => img.category === key);
        return { category: key, url: existing?.url || "", caption: existing?.caption || "" };
      });

      currentImages.forEach(img => {
        if (!requiredKeys.includes(img.category)) {
          result.push({ category: img.category, url: img.url, caption: img.caption || "" });
        }
      });
      return result;
    })(),
    policy: {
      checkInTime: room.policy?.checkInTime || "14:00",
      checkOutTime: room.policy?.checkOutTime || "12:00",
      childrenFreeAge: String(room.policy?.childrenFreeAge ?? 6),
      refundable: room.policy?.refundable ?? true,
      freeCancelHours: String(room.policy?.freeCancelHours ?? 24),
      cancellationNote: room.policy?.cancellationNote || "",
      petAllowed: room.policy?.petAllowed ?? false,
      smokingAllowed: room.policy?.smokingAllowed ?? false,
      otherRules: room.policy?.otherRules || "",
    },
    highlights: room.highlights.join(", "),
    transportConnections: room.transportConnections.length
      ? room.transportConnections.map(tc => ({ name: tc.name, distance: tc.distance, note: tc.note || "" }))
      : [{ name: "", distance: "", note: "" }]
  };
}

function buildRoomPayload(form: ReturnType<typeof buildEditableRoom>) {
  return {
    name: form.name,
    description: form.description,
    roomType: form.roomType,
    address: form.address,
    city: form.city,
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    area: form.area ? Number(form.area) : null,
    capacity: Number(form.capacity),
    amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
    prices: form.prices
      .filter((item) => item.label.trim() && Number(item.pricePerNight) > 0)
      .map((item) => ({
        label: item.label.trim(),
        pricePerNight: Number(item.pricePerNight),
        area: item.area ? Number(item.area) : null,
        capacity: Number(item.capacity) || 0,
        amenities: item.amenities.trim(),
        bedInfo: item.bedInfo?.trim() || undefined,
        imageUrls: item.imageUrls.map((u: string) => u.trim()).filter(Boolean),
      })),
    nearbyPlaces: form.nearbyPlaces
      .filter((item) => item.name.trim())
      .map((item) => ({
        name: item.name.trim(),
        type: item.type.trim() || "place",
        distanceM: Number(item.distanceM) || 0,
        lat: Number(item.lat) || 0,
        lon: Number(item.lon) || 0,
      })),
    platformFeePct: Number(form.platformFeePct),
    promotionPct: Number(form.promotionPct),
    images: form.images.filter(img => img.url.trim()),
    policy: {
      ...form.policy,
      childrenFreeAge: Number(form.policy.childrenFreeAge),
      freeCancelHours: form.policy.refundable ? Number(form.policy.freeCancelHours) : null,
    },
    highlights: form.highlights.split(",").map(h => h.trim()).filter(Boolean),
    transportConnections: form.transportConnections
      .filter(tc => tc.name.trim() && tc.distance.trim())
      .map(tc => ({ name: tc.name.trim(), distance: tc.distance.trim(), note: tc.note?.trim() || null })),
  };
}

export function RoomEditModal({
  room,
  onClose,
  onSaved,
}: {
  room: Room;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState(buildEditableRoom(room));
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  function updatePrice(index: number, key: keyof typeof form.prices[0], value: string) {
    const next = [...form.prices];
    next[index] = { ...next[index], [key]: value } as any;
    setForm({ ...form, prices: next });
  }

  function updateNearby(index: number, key: "name" | "type" | "distanceM" | "lat" | "lon", value: string) {
    const next = [...form.nearbyPlaces];
    next[index] = { ...next[index], [key]: value };
    setForm({ ...form, nearbyPlaces: next });
  }

  function updateHotelImage(index: number, key: "url" | "category" | "caption", value: string) {
    const next = [...form.images];
    next[index] = { ...next[index], [key]: value };
    setForm({ ...form, images: next });
  }

  async function save() {
    setErr("");
    setSaving(true);
    try {
      await api(`/admin/rooms/${room.id}`, { method: "PATCH", body: JSON.stringify(buildRoomPayload(form)) });
      await onSaved();
      onClose();
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 pt-10 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-card border rounded-lg p-5 w-full max-w-4xl space-y-4 my-8" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Sua khach san</h3>
            <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">v2</span>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-md border text-sm">Dong</button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm">
            <div className="font-medium mb-1">Ten khach san</div>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
          <label className="text-sm">
            <div className="font-medium mb-1">Hang sao</div>
            <select
              value={form.roomType}
              onChange={(event) => setForm({ ...form, roomType: event.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              {ROOM_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            <div className="font-medium mb-1">Mo ta</div>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
          <label className="text-sm md:col-span-2">
            <div className="font-medium mb-1">Dia chi</div>
            <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
          <label className="text-sm">
            <div className="font-medium mb-1">Thanh pho</div>
            <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
          <label className="text-sm">
            <div className="font-medium mb-1">Suc chua</div>
            <input type="number" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
          <label className="text-sm">
            <div className="font-medium mb-1">Dien tich</div>
            <input type="number" value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
          <label className="text-sm">
            <div className="font-medium mb-1">Phi nen tang (%)</div>
            <input type="number" value={form.platformFeePct} onChange={(event) => setForm({ ...form, platformFeePct: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
          <label className="text-sm">
            <div className="font-medium mb-1">Khuyen mai (%)</div>
            <input type="number" value={form.promotionPct} onChange={(event) => setForm({ ...form, promotionPct: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
          <label className="text-sm">
            <div className="font-medium mb-1">Lat</div>
            <input type="number" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
          <label className="text-sm">
            <div className="font-medium mb-1">Lon</div>
            <input type="number" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
          <label className="text-sm md:col-span-2">
            <div className="font-medium mb-1">Tien ich (tach bang dau phay)</div>
            <input value={form.amenities} onChange={(event) => setForm({ ...form, amenities: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
          <label className="text-sm md:col-span-2">
            <div className="font-medium mb-1">Diem noi bat (highlights) (tach bang dau phay)</div>
            <input value={form.highlights} onChange={(event) => setForm({ ...form, highlights: event.target.value })} className="w-full px-3 py-2 border rounded-md bg-background" />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
          <div className="space-y-4">
            <div className="font-medium">Chinh sach & Thoi gian</div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Nhan phong (HH:mm)</div>
                <input value={form.policy.checkInTime} onChange={e => setForm({ ...form, policy: { ...form.policy, checkInTime: e.target.value } })} className="w-full px-3 py-2 border rounded bg-background" placeholder="14:00" />
              </label>
              <label className="text-sm">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Tra phong (HH:mm)</div>
                <input value={form.policy.checkOutTime} onChange={e => setForm({ ...form, policy: { ...form.policy, checkOutTime: e.target.value } })} className="w-full px-3 py-2 border rounded bg-background" placeholder="12:00" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Tuoi o mien phi</div>
                <input type="number" value={form.policy.childrenFreeAge} onChange={e => setForm({ ...form, policy: { ...form.policy, childrenFreeAge: e.target.value } })} className="w-full px-3 py-2 border rounded bg-background" />
              </label>
              <label className="text-sm">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Huy phong (gio)</div>
                <input type="number" disabled={!form.policy.refundable} value={form.policy.freeCancelHours} onChange={e => setForm({ ...form, policy: { ...form.policy, freeCancelHours: e.target.value } })} className="w-full px-3 py-2 border rounded bg-background disabled:opacity-50" />
              </label>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={form.policy.refundable} onChange={e => setForm({ ...form, policy: { ...form.policy, refundable: e.target.checked } })} />
                Hoan tien
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={form.policy.petAllowed} onChange={e => setForm({ ...form, policy: { ...form.policy, petAllowed: e.target.checked } })} />
                Vat nuoi
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={form.policy.smokingAllowed} onChange={e => setForm({ ...form, policy: { ...form.policy, smokingAllowed: e.target.checked } })} />
                Hut thuoc
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <div className="font-medium opacity-0">...</div>
            <label className="text-sm block">
              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Ghi chu huy phong</div>
              <textarea value={form.policy.cancellationNote} onChange={e => setForm({ ...form, policy: { ...form.policy, cancellationNote: e.target.value } })} rows={2} className="w-full px-3 py-2 border rounded bg-background" />
            </label>
            <label className="text-sm block">
              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Quy dinh khac</div>
              <textarea value={form.policy.otherRules} onChange={e => setForm({ ...form, policy: { ...form.policy, otherRules: e.target.value } })} rows={2} className="w-full px-3 py-2 border rounded bg-background" />
            </label>
          </div>
        </div>

        <div>
          <div className="font-medium mb-2">Danh sach cac phong (Hang phong)</div>
          <div className="space-y-4">
            {form.prices.map((price, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/5 relative space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Ten loai phong</label>
                    <input value={price.label} onChange={(event) => updatePrice(index, "label", event.target.value)} placeholder="VD: Deluxe King" className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">URL anh phong ({price.imageUrls.length})</label>
                      <button type="button" onClick={() => { const next = [...form.prices]; next[index].imageUrls.push(""); setForm({ ...form, prices: next }); }} className="text-[10px] text-primary font-bold hover:underline">+ Them URL</button>
                    </div>
                    <div className="space-y-2">
                      {price.imageUrls.map((url: string, uIdx: number) => (
                        <div key={uIdx} className="flex gap-2">
                          <input value={url} onChange={(event) => { const next = [...form.prices]; next[index].imageUrls[uIdx] = event.target.value; setForm({ ...form, prices: next }); }} placeholder="https://..." className="flex-1 px-3 py-1.5 border rounded-md bg-background text-xs" />
                          <button type="button" onClick={() => { const next = [...form.prices]; next[index].imageUrls.splice(uIdx, 1); setForm({ ...form, prices: next }); }} className="px-2 text-destructive">X</button>
                        </div>
                      ))}
                    </div>
                    {price.imageUrls.filter((u: string) => u.trim()).length > 0 && (
                      <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                        {price.imageUrls.filter((u: string) => u.trim()).map((url: string, uIdx: number) => (
                          <img key={uIdx} src={url} alt="" className="h-16 aspect-video rounded border object-cover shrink-0" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Thong tin giuong</label>
                    <input value={price.bedInfo} onChange={(event) => updatePrice(index, "bedInfo", event.target.value)} placeholder="VD: 1 giuong doi King" className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Gia moi dem</label>
                    <input type="number" value={price.pricePerNight} onChange={(event) => updatePrice(index, "pricePerNight", event.target.value)} placeholder="₫" className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Dien tich (m2)</label>
                    <input type="number" value={price.area} onChange={(event) => updatePrice(index, "area", event.target.value)} placeholder="30" className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Suc chua (nguoi)</label>
                    <input type="number" value={price.capacity} onChange={(event) => updatePrice(index, "capacity", event.target.value)} placeholder="2" className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Tien ich rieng</label>
                    <textarea value={price.amenities} onChange={(event) => updatePrice(index, "amenities", event.target.value)} placeholder="VD: Ban cong, Bon tam..." className="w-full px-3 py-2 border rounded-md bg-background text-sm" rows={2} />
                  </div>
                </div>

                {form.prices.length > 1 && (
                  <button onClick={() => setForm({ ...form, prices: form.prices.filter((_, itemIndex) => itemIndex !== index) })} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                    ×
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setForm({ ...form, prices: [...form.prices, { label: "", pricePerNight: "", area: "", capacity: "", amenities: "", imageUrls: [], bedInfo: "" }] })} className="w-full py-2 border-2 border-dashed rounded-lg text-sm text-primary hover:bg-primary/5 transition-colors font-medium">
              + Them phong nghi moi
            </button>
          </div>
        </div>

        <div>
          <div className="font-medium mb-2">Hinh anh khach san (Chung)</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {form.images.map((img, index) => {
              const isRequired = ["hotel_front", "lobby", "room_overview", "common_area", "exterior"].includes(img.category);
              return (
                <div key={index} className={`p-3 border rounded-lg space-y-2 relative ${isRequired ? "border-primary/20 bg-primary/5" : "bg-muted/5"}`}>
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] uppercase font-bold text-primary">
                      {IMAGE_LABELS[img.category] || img.category}
                      {isRequired && <span className="text-destructive ml-1">*</span>}
                    </div>
                  </div>
                  <input value={img.url} onChange={(e) => updateHotelImage(index, "url", e.target.value)} placeholder="URL anh (https://...)" className="w-full px-2 py-1 border rounded bg-background text-xs" />
                  {img.url && <img src={img.url} className="w-full h-20 object-cover rounded border shadow-sm" alt="" />}
                  {!isRequired && (
                    <button onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== index) })} className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full text-[10px] flex items-center justify-center shadow-sm">×</button>
                  )}
                </div>
              );
            })}
            <button onClick={() => setForm({ ...form, images: [...form.images, { category: "other", url: "", caption: "" }] })} className="border-2 border-dashed rounded-lg p-3 text-xs text-primary hover:bg-primary/5">
              + Them anh khac
            </button>
          </div>
        </div>

        <div>
          <div className="font-medium mb-2">Ket noi giao thong</div>
          <div className="space-y-2">
            {form.transportConnections.map((tc, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 items-center">
                <input value={tc.name} onChange={(e) => {
                  const next = [...form.transportConnections];
                  next[index].name = e.target.value;
                  setForm({ ...form, transportConnections: next });
                }} placeholder="Ten ket noi" className="px-3 py-2 border rounded-md bg-background text-sm" />
                <input value={tc.distance} onChange={(e) => {
                  const next = [...form.transportConnections];
                  next[index].distance = e.target.value;
                  setForm({ ...form, transportConnections: next });
                }} placeholder="Khoang cach" className="px-3 py-2 border rounded-md bg-background text-sm" />
                <div className="flex gap-2">
                  <input value={tc.note} onChange={(e) => {
                    const next = [...form.transportConnections];
                    next[index].note = e.target.value;
                    setForm({ ...form, transportConnections: next });
                  }} placeholder="Ghi chu" className="flex-1 px-3 py-2 border rounded-md bg-background text-sm" />
                  <button onClick={() => setForm({ ...form, transportConnections: form.transportConnections.filter((_, i) => i !== index) })} className="px-2 text-destructive">×</button>
                </div>
              </div>
            ))}
            <button onClick={() => setForm({ ...form, transportConnections: [...form.transportConnections, { name: "", distance: "", note: "" }] })} className="text-sm text-primary">
              + Them ket noi
            </button>
          </div>
        </div>

        <div>
          <div className="font-medium mb-2">Dia diem gan day</div>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[800px] space-y-2">
              {form.nearbyPlaces.map((place, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-center">
                  <input value={place.name} onChange={(event) => updateNearby(index, "name", event.target.value)} placeholder="Ten dia diem" className="px-3 py-2 border rounded-md bg-background text-sm" />
                  <input value={place.type} onChange={(event) => updateNearby(index, "type", event.target.value)} placeholder="Loai" className="px-3 py-2 border rounded-md bg-background text-sm" />
                  <input type="number" value={place.distanceM} onChange={(event) => updateNearby(index, "distanceM", event.target.value)} placeholder="Khoang cach" className="px-3 py-2 border rounded-md bg-background text-sm" />
                  <input type="number" value={place.lat} onChange={(event) => updateNearby(index, "lat", event.target.value)} placeholder="Lat" className="px-3 py-2 border rounded-md bg-background text-sm" />
                  <div className="flex gap-2">
                    <input type="number" value={place.lon} onChange={(event) => updateNearby(index, "lon", event.target.value)} placeholder="Lon" className="flex-1 px-3 py-2 border rounded-md bg-background text-sm" />
                    {form.nearbyPlaces.length > 1 && (
                      <button onClick={() => setForm({ ...form, nearbyPlaces: form.nearbyPlaces.filter((_, itemIndex) => itemIndex !== index) })} className="px-2 text-destructive">
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setForm({ ...form, nearbyPlaces: [...form.nearbyPlaces, { name: "", type: "", distanceM: "", lat: "", lon: "" }] })} className="text-sm text-primary mt-2">
            + Them dia diem
          </button>
        </div>

        {err && <div className="text-sm text-destructive">{err}</div>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-md border">Huy</button>
          <button onClick={save} disabled={saving} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50">
            {saving ? "Dang luu..." : "Luu"}
          </button>
        </div>
      </div>
    </div>
  );
}
