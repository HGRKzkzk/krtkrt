// A voluntarily selected, deliberately coarse area, not a home coordinate.
// Each grid cell is roughly two kilometres across around Tilburg.
export type MapArea = { lon: number; lat: number };
const LON_STEP = 0.03;
const LAT_STEP = 0.018;
export const AREA_RADIUS_METERS = 1500;
export function snapArea(lon: number, lat: number): MapArea {
  return {
    lon: Number((Math.round(lon / LON_STEP) * LON_STEP).toFixed(3)),
    lat: Number((Math.round(lat / LAT_STEP) * LAT_STEP).toFixed(3))
  };
}
export function cleanMapArea(value: unknown): MapArea | null {
  if (!value || typeof value !== 'object') return null;
  const area = value as Partial<MapArea>;
  if (typeof area.lon !== 'number' || typeof area.lat !== 'number' || !Number.isFinite(area.lon) || !Number.isFinite(area.lat) || Math.abs(area.lon) > 180 || Math.abs(area.lat) > 85) return null;
  // Re-snap on load: never use a persisted unsnapped pinpoint.
  return snapArea(area.lon, area.lat);
}
