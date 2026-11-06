<script lang="ts">
  import { onMount } from 'svelte';
  import Map from 'ol/Map.js';
  import View from 'ol/View.js';
  import TileLayer from 'ol/layer/Tile.js';
  import OSM from 'ol/source/OSM.js';
  import { fromLonLat } from 'ol/proj.js';
  import 'ol/ol.css';
  let target: HTMLDivElement;
  onMount(() => {
    const map = new Map({ target, layers:[new TileLayer({source:new OSM()})], view:new View({center:fromLonLat([5.09,51.56]),zoom:11.5}), controls:[] });
    return () => map.setTarget(undefined);
  });
</script>
<div class="map-shell">
  <div bind:this={target} class="map"></div>
  <div class="map-note"><strong>Regio als context</strong><span>Geen individuele locaties of adressen op deze kaart.</span></div>
</div>
<style>
  .map-shell{position:relative;border-radius:16px;overflow:hidden;border:1px solid #d9ddd4;background:#e5e9e0}
  .map{height:340px;width:100%}
  .map-note{position:absolute;left:12px;bottom:12px;right:12px;max-width:320px;display:flex;flex-direction:column;gap:2px;padding:10px 12px;background:rgba(255,255,255,.95);box-shadow:0 3px 14px #10251b17;border-radius:10px;font-size:12px;z-index:1}
  .map-note span{color:#58645b}
</style>