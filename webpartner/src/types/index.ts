export type User = { id: number; email: string; fullName: string; role: string; status: string };

export type Price = {
  label: string;
  pricePerNight: number;
  totalInventory: number | null;
  area: number | null;
  capacity: number | null;
  bedInfo: string | null;
  amenities: string | null;
  imageUrls: string[];
};

export type NearbyPlace = { name: string; type: string; distanceM: number; lat: number; lon: number };

export type RoomImage = { category: string; url: string; caption: string | null };

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

export type Room = {
  id: number;
  name: string;
  description: string | null;
  roomType: string;
  address: string;
  city: string | null;
  latitude: number;
  longitude: number;
  area: number | null;
  capacity: number;
  amenities: string[];
  highlights: string[];
  transportConnections: TransportConnection[];
  nearbyPlaces: NearbyPlace[];
  images: RoomImage[];
  policy: RoomPolicy;
  prices: Price[];
  platformFeePct: number;
  promotionPct: number;
  status: string;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  pendingRequest: RoomChangeRequest | null;
  bookingStats?: {
    isActiveHotel: boolean;
    hasCurrentGuest: boolean;
    activeBookingCount: number;
    totalBookings: number;
    grossRevenue: number;
    partnerRevenue: number;
  };
};

export type PartnerNotification = {
  id: number;
  title: string;
  body: string | null;
  type: string;
  createdAt: string;
  isRead: boolean;
};

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
