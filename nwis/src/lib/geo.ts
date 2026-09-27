const R = 6371; // km

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearingDeg(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
export function compass(deg: number) {
  return DIRS[Math.round(deg / 45) % 8];
}

/** Offset a point by distance (m) along azimuth (deg). */
export function offsetPoint(lat: number, lng: number, distM: number, azDeg: number): [number, number] {
  const az = (azDeg * Math.PI) / 180;
  const dLat = (distM * Math.cos(az)) / 111_320;
  const dLng = (distM * Math.sin(az)) / (111_320 * Math.cos((lat * Math.PI) / 180));
  return [lng + dLng, lat + dLat];
}

/** Polygon ring approximating a circle (for map rings). */
export function circleRing(lat: number, lng: number, radiusKm: number, steps = 96): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) pts.push(offsetPoint(lat, lng, radiusKm * 1000, (i / steps) * 360));
  return pts;
}
