/**
 * Haversine formula to calculate the distance between two points on Earth in kilometers.
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Approximate coordinates for Lomé zones to use as fallback
 * when user's precise GPS is not available.
 */
export const ZONE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Université de Lomé": { lat: 6.1751, lng: 1.2132 },
  "Kégué": { lat: 6.1954, lng: 1.2334 },
  "Tokoin": { lat: 6.1558, lng: 1.2185 },
  "Adidogomé": { lat: 6.1825, lng: 1.1578 },
  "Bè": { lat: 6.1352, lng: 1.2385 },
  "Agoè": { lat: 6.2225, lng: 1.1985 },
  "Hedzranawoé": { lat: 6.1785, lng: 1.2355 },
  "Akodesséwa": { lat: 6.1455, lng: 1.2655 },
  "Nukafu": { lat: 6.1685, lng: 1.2255 },
  "Bagida": { lat: 6.1585, lng: 1.3055 },
};

export function getZoneFallbackCoords(zone: string) {
  return ZONE_COORDINATES[zone] || ZONE_COORDINATES["Université de Lomé"];
}
