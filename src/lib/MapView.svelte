<script lang="ts">
  import { onMount } from 'svelte';
  import Map from 'ol/Map.js';
  import View from 'ol/View.js';
  import TileLayer from 'ol/layer/Tile.js';
  import VectorLayer from 'ol/layer/Vector.js';
  import OSM from 'ol/source/OSM.js';
  import VectorSource from 'ol/source/Vector.js';
  import Feature from 'ol/Feature.js';
  import Point from 'ol/geom/Point.js';
  import { fromLonLat } from 'ol/proj.js';
  import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js';
  import type { Post } from './types';
  import 'ol/ol.css';

  export let posts: Post[] = [];
  export let selectedId: string | null = null;
  export let onSelect: (id: string) => void = () => {};

  let target: HTMLDivElement;
  let map: Map;
  const vectorSource = new VectorSource();
  // Illustratieve punten op buurtniveau, NIET de locatie van de aanbieder of diens woning.
  const areaPoints: [number,number][] = [
    [5.082,51.557], [5.101,51.565], [5.067,51.551], [5.109,51.546],
    [5.090,51.542], [5.074,51.570]
  ];
  function renderMarkers(){
    vectorSource.clear();
    posts.forEach((post,index)=>{
      const coordinate = areaPoints[index % areaPoints.length];
      const feature = new Feature({geometry:new Point(fromLonLat(coordinate)), postId:post.id});
      const chosen = post.id===selectedId;
      feature.setStyle(new Style({
        image:new CircleStyle({
          radius:chosen?17:14,
          fill:new Fill({color:chosen?'#254f3c':'#407658'}),
          stroke:new Stroke({color:'#ffffff',width:3})
        }),
        text:new Text({text:post.kind==='vraag'?'?':post.kind==='aanbod'?'+':'•',font:'bold 17px sans-serif',fill:new Fill({color:'#fff'}),offsetY:0})
      }));
      vectorSource.addFeature(feature);
    });
  }
  onMount(()=>{
    const vectorLayer=new VectorLayer({source:vectorSource});
    map = new Map({
      target,
      layers:[new TileLayer({source:new OSM()}),vectorLayer],
      view:new View({center:fromLonLat([5.087,51.556]),zoom:12.8})
    });
    map.on('singleclick',event=>{
      const feature=map.forEachFeatureAtPixel(event.pixel,f=>f);
      const id=feature?.get('postId');
      if(typeof id==='string')onSelect(id);
    });
    renderMarkers();
    return ()=>map.setTarget(undefined);
  });
  $: if(map && posts && selectedId !== undefined) renderMarkers();
</script>

<div class="map-shell">
  <div bind:this={target} class="map" aria-label="Interactieve kaart met fictieve gebiedsmarkers"></div>
  </div>
<style>
  .map-shell{position:relative;width:100%;flex:1;min-height:min(680px,calc(100vh - 126px));overflow:hidden;background:#e8ebe4}
  .map{height:100%;min-height:min(680px,calc(100vh - 126px));width:100%}
  @media(max-width:760px){
    .map-shell,.map{min-height: min(52vh,470px)}
  }
</style>