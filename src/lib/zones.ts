export const LOME_ZONES = [
  "Tout Lomé",
  "Campus Sud",
  "Campus Nord",
  "Kégué",
  "Adidogomé",
  "Tokoin",
  "Hédzranawoé",
  "Agoë",
  "Bè",
  "Assivito",
] as const;

export type LomeZone = (typeof LOME_ZONES)[number];

export const ZONE_COORDINATES: Record<Exclude<LomeZone, "Tout Lomé">, { lat: number, lng: number }> = {
  "Campus Sud": { lat: 6.1764, lng: 1.2132 },
  "Campus Nord": { lat: 6.2023, lng: 1.2145 },
  "Kégué": { lat: 6.1912, lng: 1.2526 },
  "Adidogomé": { lat: 6.1834, lng: 1.1623 },
  "Tokoin": { lat: 6.1523, lng: 1.2145 },
  "Hédzranawoé": { lat: 6.1745, lng: 1.2567 },
  "Agoë": { lat: 6.2345, lng: 1.2234 },
  "Bè": { lat: 6.1289, lng: 1.2345 },
  "Assivito": { lat: 6.1212, lng: 1.2134 },
};

export function findNearestZone(lat: number, lng: number): LomeZone {
  let nearestZone: LomeZone = "Tout Lomé";
  let minDistance = Infinity;

  for (const [zone, coords] of Object.entries(ZONE_COORDINATES)) {
    const distance = Math.sqrt(
      Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestZone = zone as LomeZone;
    }
  }

  return nearestZone;
}
