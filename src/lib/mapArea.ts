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

// A PC4 polygon can overlap several municipal neighbourhoods. Therefore show
// a place/area label, never assert that a PC4 is a single official 'wijk'.
const placeCache = new Map<string, Promise<string>>();
export function displayAreaName(pc4: string): Promise<string> {
  if (!validPc4(pc4)) return Promise.resolve('Onbekend gebied');
  const cached = placeCache.get(pc4);
  if (cached) return cached;
  const params = new URLSearchParams({ q: pc4, rows: '15', fq: 'type:postcode' });
  const task = fetch('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?' + params, {mode:'cors'})
    .then(async (response) => {
      if (!response.ok) throw new Error('PDOK niet beschikbaar');
      const data: unknown = await response.json();
      const docs = (data as {response?: {docs?: Array<{postcode?:string;woonplaatsnaam?:string}>}})?.response?.docs;
      if (!Array.isArray(docs)) throw new Error('Onleesbare gebiedsnaam');
      // Never use a nearby postcode search result as proof of a place name.
      const places = [...new Set(docs.filter((d) => d.postcode?.replace(/\s/g,'').startsWith(pc4))
        .map((d) => d.woonplaatsnaam?.trim()).filter((v):v is string=>!!v))];
      return places.length === 1 ? places[0] + ' · gebied ' + pc4 : 'Gebied ' + pc4;
    }).catch(() => 'Gebied ' + pc4);
  placeCache.set(pc4,task);
  return task;
}
