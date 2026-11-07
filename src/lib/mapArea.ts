// PC4: postcodegebieden van vier cijfers, geen woonadressen en geen zelfgekozen pinnen.
// Bron: Esri Nederland, Postcodevlakken PC4 (januari 2026), op BAG/open data gebaseerd.
// De polygonen worden alleen voor het gekozen PC4-gebied opgehaald.
export type MapArea = { pc4: string };
export function cleanMapArea(value: unknown): MapArea | null {
  if (!value || typeof value !== 'object') return null;
  const pc4 = (value as { pc4?: unknown }).pc4;
  return typeof pc4 === 'string' && /^[1-9][0-9]{3}$/.test(pc4) ? { pc4 } : null;
}
export function validPc4(value: string): boolean { return /^[1-9][0-9]{3}$/.test(value); }

/** Accept a four-digit PC4 or a complete Dutch postcode, storing only PC4. */
export function parsePostcode(value: string): string | null {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, '');
  if (/^[1-9][0-9]{3}$/.test(normalized)) return normalized;
  if (/^[1-9][0-9]{3}[A-Z]{2}$/.test(normalized)) return normalized.slice(0, 4);
  return null;
}

export type GeoFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{ type: 'Feature'; geometry: { type: string; coordinates: unknown }; properties: Record<string, unknown> }>;
};
const endpoint = 'https://services.arcgis.com/nSZVuSZjHpEZZbRo/arcgis/rest/services/Postcodevlakken_PC4/FeatureServer/0/query';
const cache = new Map<string, Promise<GeoFeatureCollection>>();

export function postcodeGeometry(pc4: string): Promise<GeoFeatureCollection> {
  if (!validPc4(pc4)) return Promise.reject(new Error('Voer vier cijfers in.'));
  const cached = cache.get(pc4);
  if (cached) return cached;
  const params = new URLSearchParams({
    where: "PC4='" + pc4 + "'",
    outFields: 'PC4',
    returnGeometry: 'true',
    outSR: '4326',
    f: 'geojson'
  });
  const task = fetch(endpoint + '?' + params.toString(), { mode: 'cors' })
    .then(async (response) => {
      if (!response.ok) throw new Error('De postcodekaart is niet bereikbaar.');
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || !('type' in data) || (data as { type: unknown }).type !== 'FeatureCollection') throw new Error('De postcodekaart kon niet worden gelezen.');
      const collection = data as GeoFeatureCollection;
      if (!Array.isArray(collection.features) || collection.features.length === 0) throw new Error('Geen gebied gevonden voor deze postcode.');
      return collection;
    });
  cache.set(pc4, task);
  task.catch(() => { if (cache.get(pc4) === task) cache.delete(pc4); });
  return task;
}
