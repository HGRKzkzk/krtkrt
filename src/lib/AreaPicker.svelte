<script lang="ts">
  import { onMount } from 'svelte';
  import Map from 'ol/Map.js';
  import View from 'ol/View.js';
  import TileLayer from 'ol/layer/Tile.js';
  import VectorLayer from 'ol/layer/Vector.js';
  import VectorSource from 'ol/source/Vector.js';
  import OSM from 'ol/source/OSM.js';
  import Feature from 'ol/Feature.js';
  import Point from 'ol/geom/Point.js';
  import Circle from 'ol/geom/Circle.js';
  import { fromLonLat, toLonLat } from 'ol/proj.js';
  import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style.js';
  import { AREA_RADIUS_METERS, snapArea } from '$lib/mapArea';
  import type { MapArea } from '$lib/mapArea';

  export let area: MapArea | null = null;
  export let onChange: (area: MapArea) => void = () => {};
  let target: HTMLDivElement;
  let map: Map;
  const source = new VectorSource();
  function refresh() {
    source.clear();
    if (!area) return;
    const center = fromLonLat([area.lon, area.lat]);
    source.addFeature(new Feature({ geometry: new Circle(center, AREA_RADIUS_METERS), style: new Style({ fill: new Fill({ color: 'rgba(50,105,77,.20)' }), stroke: new Stroke({ color: '#276247', width: 2, lineDash: [5, 4] }) }) }));
    source.addFeature(new Feature({ geometry: new Point(center), style: new Style({ image: new CircleStyle({ radius: 6, fill: new Fill({ color: '#276247' }), stroke: new Stroke({ color: '#fff', width: 2 }) }) }) }));
  }
  onMount(() => {
    map = new Map({
      target,
      layers: [new TileLayer({ source: new OSM() }), new VectorLayer({ source })],
      view: new View({ center: fromLonLat(area ? [area.lon, area.lat] : [5.087, 51.556]), zoom: area ? 12 : 12.6 })
    });
    map.on('singleclick', (event) => {
      const [lon, lat] = toLonLat(event.coordinate);
      onChange(snapArea(lon, lat));
    });
    refresh();
    return () => map.setTarget(undefined);
  });
  $: if (map) refresh();
</script>

<div class="picker">
  <div bind:this={target} class="map" aria-label="Kaart om een globale buurtregio te kiezen"></div>
  <p class="hint">Klik ergens op de kaart om een <strong>ruim gebied</strong> te kiezen. De locatie wordt afgerond; het is geen huisadres of exacte pin.</p>
</div>
<style>
  .picker{border:1px solid #d7ddd6;background:#fff}
  .map{width:100%;height:245px}
  .hint{font-size:12px;color:#57635a;padding:10px 12px;margin:0}
</style>
