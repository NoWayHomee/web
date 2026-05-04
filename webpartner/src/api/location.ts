import { NearbyPlace } from "../types";
import { NEARBY_CATS } from "./client";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
];

const OVERPASS_FILTERS: Record<string, string[]> = {
  tourism: [
    '["tourism"~"attraction|museum|viewpoint|theme_park|zoo|aquarium"]',
    '["historic"~"monument|memorial|ruins|castle|fort|archaeological_site"]',
    '["amenity"="place_of_worship"]',
    '["leisure"~"park|garden|nature_reserve"]',
  ],
  restaurant: ['["amenity"="restaurant"]'],
  cafe: ['["amenity"="cafe"]'],
  supermarket: ['["shop"="supermarket"]'],
  mall: ['["shop"~"mall|department_store"]'],
  convenience: ['["shop"="convenience"]'],
  marketplace: ['["amenity"="marketplace"]'],
  hospital: ['["amenity"="hospital"]', '["amenity"="clinic"]'],
  pharmacy: ['["amenity"="pharmacy"]'],
  school: ['["amenity"~"school|university|college"]'],
  bank: ['["amenity"="bank"]'],
  atm: ['["amenity"="atm"]'],
  fuel: ['["amenity"="fuel"]'],
  cinema: ['["amenity"="cinema"]'],
  bus_station: ['["amenity"~"bus_station|bus_stop"]'],
  railway: ['["railway"~"station|halt|subway_entrance"]'],
  airport: ['["aeroway"~"aerodrome|terminal"]'],
};

const NO_NAME_RE = /^(unnamed|noname|no name|n\/a|\?)$/i;

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function hasMeaningfulName(name: string) {
  return !!name.trim() && !NO_NAME_RE.test(name.trim());
}

export function getNearbyLabel(key: string) {
  return NEARBY_CATS.find((item) => item.key === key)?.label || key;
}

export function detectNearbyCategory(tags: Record<string, string | undefined>) {
  if (tags.amenity === "restaurant") return "restaurant";
  if (tags.amenity === "cafe") return "cafe";
  if (tags.shop === "supermarket") return "supermarket";
  if (tags.shop === "mall" || tags.shop === "department_store") return "mall";
  if (tags.shop === "convenience") return "convenience";
  if (tags.amenity === "marketplace") return "marketplace";
  if (tags.amenity === "hospital" || tags.amenity === "clinic") return "hospital";
  if (tags.amenity === "pharmacy") return "pharmacy";
  if (tags.amenity === "school" || tags.amenity === "university" || tags.amenity === "college") return "school";
  if (tags.amenity === "bank") return "bank";
  if (tags.amenity === "atm") return "atm";
  if (tags.amenity === "fuel") return "fuel";
  if (tags.amenity === "cinema") return "cinema";
  if (tags.amenity === "bus_station" || tags.amenity === "bus_stop") return "bus_station";
  if (tags.railway) return "railway";
  if (tags.aeroway) return "airport";
  if (
    tags.tourism
    || tags.historic
    || tags.amenity === "place_of_worship"
    || tags.leisure === "park"
    || tags.leisure === "garden"
    || tags.leisure === "nature_reserve"
  ) return "tourism";
  return null;
}

export function buildNearbyQuery(lat: number, lon: number, radius: number, cats: string[]) {
  const activeCats = cats.length ? cats : Object.keys(OVERPASS_FILTERS);
  const statements = activeCats
    .flatMap((cat) => (OVERPASS_FILTERS[cat] || []).flatMap((filter) => (
      ["node", "way", "relation"].map((kind) => `${kind}${filter}(around:${radius},${lat},${lon});`)
    )))
    .join("\n");
  return `[out:json][timeout:25];\n(\n${statements}\n);\nout center tags;`;
}

export async function fetchNearbyDirect(lat: number, lon: number, radius: number, cats: string[]) {
  const query = buildNearbyQuery(lat, lon, radius, cats);

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
      });
      if (!response.ok) continue;

      const data = await response.json();
      const seen = new Set<string>();
      const results = (data.elements || [])
        .map((element: any) => {
          const tags = (element.tags || {}) as Record<string, string | undefined>;
          const pointLat = element.type === "node" ? Number(element.lat) : Number(element.center?.lat);
          const pointLon = element.type === "node" ? Number(element.lon) : Number(element.center?.lon);
          const name = tags["name:vi"] || tags.name || tags["name:en"] || "";
          const category = detectNearbyCategory(tags);

          if (!Number.isFinite(pointLat) || !Number.isFinite(pointLon) || !hasMeaningfulName(name) || !category) {
            return null;
          }

          const dedupeKey = `${name}|${pointLat.toFixed(5)}|${pointLon.toFixed(5)}`;
          if (seen.has(dedupeKey)) return null;
          seen.add(dedupeKey);

          return {
            name,
            type: getNearbyLabel(category),
            distanceM: Math.round(haversine(lat, lon, pointLat, pointLon)),
            lat: pointLat,
            lon: pointLon,
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.distanceM - b.distanceM)
        .slice(0, 50);

      return results as NearbyPlace[];
    } catch {
      continue;
    }
  }

  return null;
}

export function nearbyKey(place: Pick<NearbyPlace, "name" | "lat" | "lon">) {
  return `${place.name}|${place.lat}|${place.lon}`;
}

export function inferCityFromAddress(label: string) {
  const parts = label.split(",").map((part) => part.trim()).filter(Boolean);
  const ignored = new Set(["vietnam", "viet nam", "viet nam"]);
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const normalized = parts[i].toLowerCase();
    if (!ignored.has(normalized) && !/^\d+$/.test(parts[i])) return parts[i];
  }
  return "";
}
