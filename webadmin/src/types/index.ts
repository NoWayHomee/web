export const ROOM_TYPES = ["1 sao", "2 sao", "3 sao", "4 sao", "5 sao", "Boutique", "Resort", "Homestay"];
export const COMMON_AMENITIES = [
  "Wifi mien phi",
  "Dieu hoa",
  "Tivi",
  "Tu lanh",
  "May nuoc nong",
  "Bon tam",
  "Ket sat",
  "Bai do xe",
  "Ho boi",
  "Le tan 24h",
  "Bua sang",
  "Cho phep thu cung",
  "Cho phep hut thuoc",
];
export const IMAGE_LABELS: Record<string, string> = {
  hotel_front: "Mat tien khach san",
  lobby: "Sanh / Le tan",
  room_overview: "Phong mau",
  common_area: "Khu vuc chung",
  exterior: "Khuon vien / Ngoai canh",
  other: "Anh khac"
};

export type AppNotification = {
  id: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type User = { id: number; email: string; fullName: string; role: string; status: string };

export type Partner = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  hotelName: string | null;
  status: string;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  roomCount?: number;
};

export type Customer = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  status: string;
  loyaltyTier: string | null;
  loyaltyPoints: number;
  bookingCount: number;
  activeBookingCount: number;
  totalSpent: number;
  createdAt: string;
  lastLoginAt: string | null;
};

export type Price = { label: string; pricePerNight: number; area?: number | null; capacity?: number; bedInfo?: string; amenities?: string; imageUrls?: string[] };
export type NearbyPlace = { name: string; type: string; distanceM: number; lat: number; lon: number };
export type TransportConnection = { name: string; distance: string; note: string | null };

export type RoomPolicy = {
  checkInTime: string;
  checkOutTime: string;
  childrenFreeAge: number | null;
  refundable: boolean;
  freeCancelHours: number | null;
  cancellationNote: string | null;
  petAllowed: boolean;
  smokingAllowed: boolean;
  otherRules: string | null;
};

export type RoomChangeRequest = {
  id: number;
  action: "update" | "delete" | "create";
  status: string;
  note: string | null;
  createdAt: string;
  reviewedAt: string | null;
  payload?: any;
};

export type RoomImage = { category: string; url: string; caption: string | null };

export type Room = {
  id: number;
  name: string;
  description: string | null;
  roomType: string;
  address: string;
  city: string | null;
  latitude: number;
  longitude: number;
  capacity: number;
  area: number | null;
  amenities: string[];
  highlights: string[];
  transportConnections: TransportConnection[];
  nearbyPlaces: NearbyPlace[];
  policy: RoomPolicy;
  prices: Price[];
  images: RoomImage[];
  platformFeePct: number;
  promotionPct: number;
  status: string;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  pendingRequest?: RoomChangeRequest;
  partnerHotelName?: string;
  partnerEmail?: string;
  bookingStats?: {
    isActiveHotel: boolean;
    hasCurrentGuest: boolean;
    activeBookingCount: number;
    totalBookings: number;
    grossRevenue: number;
    partnerRevenue: number;
  };
};
