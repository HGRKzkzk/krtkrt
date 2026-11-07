<script lang="ts">
  import { onMount } from 'svelte';
  import OLMap from 'ol/Map.js';
  import View from 'ol/View.js';
  import TileLayer from 'ol/layer/Tile.js';
  import VectorLayer from 'ol/layer/Vector.js';
  import VectorSource from 'ol/source/Vector.js';
  import OSM from 'ol/source/OSM.js';
  import Feature from 'ol/Feature.js';
  import Point from 'ol/geom/Point.js';
  import { fromLonLat } from 'ol/proj.js';
  import { boundingExtent } from 'ol/extent.js';
  import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js';
  import type { CirclePlace } from './demoCircles';
  import 'ol/ol.css';
  export let places: CirclePlace[] = [];
  let target: HTMLDivElement;
  let map: OLMap;
  let selected: string | null = null;
  const source = new VectorSource();
  $: selectedPlace = places.find((place)=>place.id===selected);
  function render() {
    if (!map) return;
    source.clear();
    for (const place of places) {
      const feature = new Feature({
        geometry:new Point(fromLonLat([place.lon,place.lat])), placeId:place.id
      });
      feature.setStyle(new Style({
        image: new CircleStyle({
          radius:place.id===selected?17:14,
          fill:new Fill({color:place.kind==='optreden'?'#a55e3c':'#315e49'}),
          stroke:new Stroke({color:'#fff',width:3})
        }),
        text:new Text({text:place.kind==='optreden'?'♪':'•',font:'bold 17px sans-serif',fill:new Fill({color:'#fff'})})
      }));
      source.addFeature(feature);
    }
    if (places.length) {
      const coordinates = places.map(p=>fromLonLat([p.lon,p.lat]));
      if (coordinates.length === 1) map.getView().animate({center:coordinates[0],zoom:13,duration:150});
      else map.getView().fit(boundingExtent(coordinates),{padding:[65,65,65,65],maxZoom:13,duration:150});
    }
  }
  onMount(() => {
    map = new OLMap({
      target, layers:[new TileLayer({source:new OSM()}),new VectorLayer({source})],
      view:new View({center:fromLonLat([5.087,51.555]),zoom:12})
    });
    map.on('singleclick',(event)=>{
      const feature=map.forEachFeatureAtPixel(event.pixel,(f)=>f);
      const id=feature?.get('placeId');
      if (typeof id==='string') selected=id;
    });
    render();
    return ()=>map.setTarget(undefined);
  });
  $: if (map && places) render();
  $: if (map && selected) render();
</script>

<div class="circle-map">
  <div class="map" bind:this={target} aria-label="Kaart met fictieve activiteiten van deze kring"></div>
  {#if selectedPlace}
    <section class="place-detail">
      <button aria-label="Sluit activiteit" onclick={() => selected=null}>×</button>
      <strong>{selectedPlace.title}</strong>
      <p>{selectedPlace.description}</p>
    </section>
  {/if}
</div>
<p class="disclaimer">Voorbeeldlocaties op de kaart zijn verzonnen en bij benadering geplaatst. Geen echte afspraken, adressen of ledenlocaties.</p>
<style>
  .circle-map{position:relative;width:100%;border:1px solid #dce2dc}
  .map{height:min(55vh,420px);min-height:275px;width:100%}
  .place-detail{position:absolute;right:12px;top:12px;z-index:2;max-width:260px;padding:13px;background:#fafaf8;border:1px solid #dce1da;box-shadow:0 3px 15px #1d2f2822}
  .place-detail button{float:right;background:none;border:0;font-size:22px;line-height:1;color:#4d5d50}
  .place-detail p{margin:6px 0 0;font-size:12px;color:#546157}
  .disclaimer{font-size:12px;color:#6a7168;margin-top:9px}
</style>