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
  import GeoJSON from 'ol/format/GeoJSON.js';
  import { getCenter } from 'ol/extent.js';
  import { fromLonLat } from 'ol/proj.js';
  import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js';
  import { postcodeGeometry } from './mapArea';
  import type { MapArea } from './mapArea';
  import type { Post } from './types';
  import 'ol/ol.css';

  export let posts: Post[] = [];
  export let selectedId: string | null = null;
  export let onSelect: (id: string) => void = () => {};
  export let ownArea: MapArea | null = null;
  export let onOwnProfile: () => void = () => {};

  let target: HTMLDivElement;
  let map: Map;
  let lastPc4 = '';
  let activeLoad = 0;
  const postsSource = new VectorSource();
  const profileSource = new VectorSource();
  const geojson = new GeoJSON();
  // Alleen illustratieve voorbeeldgebieden; geen woon- of ophaaladressen.
  const areaPoints: [number,number][] = [
    [5.082,51.557], [5.101,51.565], [5.067,51.551], [5.109,51.546],
    [5.090,51.542], [5.074,51.570]
  ];
  function renderMarkers() {
    postsSource.clear();
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
        text:new Text({text:post.kind==='vraag'?'?':post.kind==='aanbod'?'+':'•',font:'bold 17px sans-serif',fill:new Fill({color:'#fff'})})
      }));
      postsSource.addFeature(feature);
    });
  }
  async function renderOwnArea() {
    const pc4 = ownArea?.pc4 || '';
    if (pc4 === lastPc4) return;
    lastPc4 = pc4;
    const load = ++activeLoad;
    profileSource.clear();
    if (!pc4) return;
    try {
      const collection = await postcodeGeometry(pc4);
      if (!map || load !== activeLoad) return;
      const features = geojson.readFeatures(collection, { featureProjection: 'EPSG:3857' });
      if (!features.length) return;
      for (const feature of features) {
        feature.setStyle(new Style({
          fill: new Fill({ color: 'rgba(168,91,48,.15)' }),
          stroke: new Stroke({ color: '#a55e3c', width: 2, lineDash: [6,5] })
        }));
      }
      profileSource.addFeatures(features);
      const point = new Feature({geometry:new Point(getCenter(profileSource.getExtent())), ownProfile:true});
      point.setStyle(new Style({
        image:new CircleStyle({radius:19, fill:new Fill({color:'#a55e3c'}),stroke:new Stroke({color:'#fff',width:3})}),
        text:new Text({text:'IK',font:'bold 12px sans-serif',fill:new Fill({color:'#fff'})})
      }));
      profileSource.addFeature(point);
    } catch {
      // No fabricated location if the external postcode service is unavailable.
    }
  }
  onMount(()=>{
    map = new Map({
      target,
      layers:[
        new TileLayer({source:new OSM()}),
        new VectorLayer({source:profileSource}),
        new VectorLayer({source:postsSource})
      ],
      view:new View({center:fromLonLat([5.087,51.556]),zoom:12.8})
    });
    map.on('singleclick',event=>{
      const feature=map.forEachFeatureAtPixel(event.pixel,f=>f);
      if (feature?.get('ownProfile')) {onOwnProfile(); return;}
      const id=feature?.get('postId');
      if (typeof id==='string') onSelect(id);
    });
    renderMarkers();
    void renderOwnArea();
    return ()=>{activeLoad++;map.setTarget(undefined);};
  });
  $: if(map && posts && selectedId !== undefined) renderMarkers();
  $: if(map && ownArea !== undefined) void renderOwnArea();
</script>

<div class="map-shell">
  <div bind:this={target} class="map" aria-label="Kaart met voorbeeldbijdragen en eventueel je eigen viercijferige postcodegebied"></div>
</div>
<style>
  .map-shell{position:relative;width:100%;flex:1;min-height:min(680px,calc(100vh - 126px));overflow:hidden;background:#e8ebe4}
  .map{height:100%;min-height:min(680px,calc(100vh - 126px));width:100%}
  @media(max-width:760px){.map-shell,.map{min-height:min(52vh,470px)}}
</style>