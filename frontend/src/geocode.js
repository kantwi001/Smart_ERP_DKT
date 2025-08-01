// Reverse geocoding using OpenStreetMap Nominatim API
// Usage: await reverseGeocode(lat, lng)
export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'erp-frontend/1.0' } });
  if (!res.ok) throw new Error('Failed to fetch address');
  const data = await res.json();
  return data.display_name || '';
}
