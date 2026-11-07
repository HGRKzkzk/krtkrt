<script lang="ts">
  import { onMount } from 'svelte';
  import Map from 'ol/Map.js';
  import View from 'ol/View.js';
  import TileLayer from 'ol/layer/Tile.js';
  import VectorLayer from 'ol/layer/Vector.js';
  import VectorSource from 'ol/source/Vector.js';
  import OSM from 'ol/source/OSM.js';
  import GeoJSON from 'ol/format/GeoJSON.js';
  import { fromLonLat } from 'ol/proj.js';
  import { Fill, Stroke, Style } from 'ol/style.js';
  import { postcodeGeometry, parsePostcode } from '$lib/mapArea';
  import type { MapArea } from '$lib/mapArea';

  export let area: MapArea | null = null;
  export let onChange: (area: MapArea | null) => void = () => {};
  let pc4 = '';
  let target: HTMLDivElement;
  let map: Map;
  let message = '';
  let checking = false;
  let requestId = 0;
  const source = new VectorSource();
  const geojson = new GeoJSON();

  onMount(() => {
    pc4 = area?.pc4 || '';
    map = new Map({
      target,
      layers: [new TileLayer({ source: new OSM() }), new VectorLayer({ source, style: new Style({ fill: new Fill({ color: 'rgba(44,105,71,.20)' }), stroke: new Stroke({ color: '#346d4b', width: 2 }) }) })],
      view: new View({ center: fromLonLat([5.087, 51.556]), zoom: 12 })
    });
    if (area) void showArea(area.pc4, false);
    return () => { requestId++; map.setTarget(undefined); };
  });

  async function showArea(code: string, save: boolean) {
    const postcode = parsePostcode(code);
    if (!postcode) { message = 'Vul vier cijfers of een volledige Nederlandse postcode in, bijvoorbeeld 5038 AB.'; return; }
    const id = ++requestId;
    checking = true; message = '';
    try {
      const collection = await postcodeGeometry(postcode);
      if (id !== requestId || !map) return;
      const features = geojson.readFeatures(collection, { featureProjection: 'EPSG:3857' });
      if (!features.length) throw new Error('Geen postcodegebied gevonden.');
      source.clear();
      source.addFeatures(features);
      const extent = source.getExtent();
      if (extent) map.getView().fit(extent, { padding: [24, 24, 24, 24], maxZoom: 13, duration: 200 });
      if (save) { pc4 = postcode; onChange({ pc4: postcode }); }
      message = 'Postcodegebied ' + postcode + ' geselecteerd.';
    } catch (error) {
      if (id !== requestId) return;
      message = error instanceof Error ? error.message : 'Postcodegebied kon niet worden geladen.';
    } finally { if (id === requestId) checking = false; }
  }
  function clear() { requestId++; source.clear(); pc4 = ''; message = ''; checking = false; onChange(null); }
</script>

<div class="picker">
  <form class="entry" onsubmit={(e) => { e.preventDefault(); void showArea(pc4.trim(), true); }}>
    <label for="area-pc4">Postcode of postcodegebied</label>
    <div class="controls">
      <input id="area-pc4" inputmode="text" maxlength="7" title="Vier cijfers of volledige Nederlandse postcode, bijvoorbeeld 5038 AB" placeholder="5038 AB" autocomplete="off" bind:value={pc4} />
      <button type="submit" disabled={checking}>{checking ? 'Zoeken…' : 'Toon gebied'}</button>
      {#if area}<button type="button" class="remove" onclick={clear}>Wissen</button>{/if}
    </div>
  </form>
  <div bind:this={target} class="map" aria-label="Kaart waarop de grens van het gekozen viercijferige postcodegebied verschijnt"></div>
  {#if message}<p class="message" role="status">{message}</p>{/if}
  <p class="hint">Je kunt de volledige postcode invullen; alleen de eerste vier cijfers worden bewaard en getoond. Geen straat, huisnummer of postcodeletters. De kaart toont een <em>gebied</em>, geen woonpunt. Bron postcodevlakken: Esri Nederland (2026).</p>
</div>
<style>
  .picker{border:1px solid #d7ddd6;background:#fff}
  .entry{padding:12px;display:flex;flex-direction:column;gap:7px}
  .controls{display:flex;gap:7px;flex-wrap:wrap}
  input{font:inherit;max-width:120px;border:1px solid #c9cec8;border-radius:2px;padding:8px}
  button{font:inherit;border:0;background:#273a2e;color:#fff;padding:8px 10px;cursor:pointer}
  button:disabled{opacity:.6}.remove{background:transparent;color:#43544a;text-decoration:underline}
  .map{width:100%;height:245px}
  .message{font-size:12px;padding:8px 12px 0;margin:0}
  .hint{font-size:12px;color:#57635a;padding:10px 12px;margin:0}
</style>