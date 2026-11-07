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
  import GeoJSON from 'ol/format/GeoJSON.js';
  import { getCenter } from 'ol/extent.js';
  import { fromLonLat } from 'ol/proj.js';
  import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js';
  import { postcodeGeometry } from './mapArea';
  import type { MapArea } from './mapArea';
  import type { Post } from './types';
  import type { DemoNeighbour } from './demoNeighbours';
  import 'ol/ol.css';

  export let posts: Post[] = [];
  export let selectedId: string | null = null;
  export let onSelect: (id: string) => void = () => {};
  export let ownArea: MapArea | null = null;
  export let ownName = 'Ik';
  export let onOwnProfile: () => void = () => {};
  export let neighbours: DemoNeighbour[] = [];
  export let onPerson: (name: string) => void = () => {};

  let target: HTMLDivElement;
  let map: OLMap;
  let selectedArea: string | null = null;
  let activeLoad = 0;
  const postsSource = new VectorSource();
  const areaSource = new VectorSource();
  const geojson = new GeoJSON();
  const areaPoints: [number,number][] = [
    [5.082,51.557],[5.101,51.565],[5.067,51.551],[5.109,51.546],
    [5.090,51.542],[5.074,51.570]
  ];
  $: groups = (() => {
    const result = new Map<string, { name:string; mine:boolean }[]>();
    for (const person of neighbours) {
      if (!result.has(person.pc4)) result.set(person.pc4, []);
      result.get(person.pc4)?.push({ name:person.name, mine:false });
    }
    if (ownArea?.pc4) {
      if (!result.has(ownArea.pc4)) result.set(ownArea.pc4, []);
      result.get(ownArea.pc4)?.push({ name:ownName || 'Ik', mine:true });
    }
    return result;
  })();
  $: selectedPeople = selectedArea ? [...(groups.get(selectedArea) || [])].sort((a,b) => Number(b.mine) - Number(a.mine)) : [];

  function renderPosts() {
    postsSource.clear();
    posts.forEach((post,index) => {
      const feature = new Feature({
        geometry:new Point(fromLonLat(areaPoints[index % areaPoints.length])),
        postId:post.id
      });
      const selected = selectedId === post.id;
      feature.setStyle(new Style({
        image:new CircleStyle({radius:selected?17:14, fill:new Fill({color:selected?'#254f3c':'#407658'}),stroke:new Stroke({color:'#fff',width:3})}),
        text:new Text({text:post.kind==='vraag'?'?':post.kind==='aanbod'?'+':'•',font:'bold 17px sans-serif',fill:new Fill({color:'#fff'})})
      }));
      postsSource.addFeature(feature);
    });
  }

  async function renderAreas() {
    const load = ++activeLoad;
    areaSource.clear();
    const areas = [...groups.entries()];
    const results = await Promise.all(areas.map(async ([pc4,people]) => {
      try {
        const collection = await postcodeGeometry(pc4);
        return {pc4,people,features:geojson.readFeatures(collection,{featureProjection:'EPSG:3857'})};
      } catch {
        return {pc4,people,features:[]};
      }
    }));
    if (!map || load !== activeLoad) return;
    for (const {pc4,people,features} of results) {
      if (!features.length) continue;
      const temporarily = new VectorSource({features});
      const extent = temporarily.getExtent();
      if (!extent) continue;
      for (const feature of features) {
        feature.set('profileArea',pc4);
        feature.setStyle(new Style({
          fill:new Fill({color:people.some(p=>p.mine)?'rgba(169,93,50,.16)':'rgba(54,103,76,.13)'}),
          stroke:new Stroke({color:people.some(p=>p.mine)?'#a55e3c':'#5b7968',width:2})
        }));
      }
      areaSource.addFeatures(features);
      const count = people.length;
      const marker = new Feature({geometry:new Point(getCenter(extent)),profileArea:pc4});
      marker.setStyle(new Style({
        image:new CircleStyle({
          radius:count>1?21:18,
          fill:new Fill({color:people.some(p=>p.mine)?'#a55e3c':'#294e40'}),
          stroke:new Stroke({color:'#fff',width:3})
        }),
        text:new Text({text:String(count),font:'bold 14px sans-serif',fill:new Fill({color:'#fff'})})
      }));
      areaSource.addFeature(marker);
    }
  }
  function chooseArea(pc4: string) {selectedArea = selectedArea===pc4 ? null : pc4;}
  onMount(() => {
    map = new OLMap({
      target,
      layers:[
        new TileLayer({source:new OSM()}),
        new VectorLayer({source:areaSource}),
        new VectorLayer({source:postsSource})
      ],
      view:new View({center:fromLonLat([5.087,51.556]),zoom:12.4})
    });
    map.on('singleclick',event => {
      const feature=map.forEachFeatureAtPixel(event.pixel,f=>f);
      const pc4=feature?.get('profileArea');
      if (typeof pc4==='string') {chooseArea(pc4);return;}
      const id=feature?.get('postId');
      if (typeof id==='string') {selectedArea=null;onSelect(id);}
    });
    renderPosts();
    void renderAreas();
    return () => {activeLoad++;map.setTarget(undefined);};
  });
  $: if (map && posts && selectedId !== undefined) renderPosts();
  $: if (map && groups) void renderAreas();
  $: if (selectedArea && !groups.has(selectedArea)) selectedArea=null;
</script>

<div class="map-shell">
  <div bind:this={target} class="map" aria-label="Kaart met bijdragen en aantallen profielen per viercijferig postcodegebied"></div>
  {#if selectedArea}
    <section class="area-panel" aria-label={'Mensen in postcodegebied '+selectedArea}>
      <div class="panel-heading">
        <div><strong>Gebied {selectedArea}</strong><span>{selectedPeople.length} {selectedPeople.length===1?'persoon':'personen'} · voorbeeldprofielen</span></div>
        <button onclick={() => selectedArea=null} aria-label="Sluit profielenlijst">×</button>
      </div>
      <div class="people">
        {#each selectedPeople as person}
          <button class:own-person={person.mine} onclick={() => {if(person.mine) onOwnProfile(); else onPerson(person.name);}}>
            <span class="person-label">{person.mine ? (person.name || 'Mijn plek') : person.name}{#if person.mine}<span class="own-hint">Jij · Mijn plek</span>{/if}</span>
            <span aria-hidden="true">↗</span>
          </button>
        {/each}
      </div>
    </section>
  {/if}
  <div class="legend">Het cijfer geeft het aantal zichtbare profielen per gebied aan. Geen woonadressen.</div>
</div>
<style>
  .map-shell{position:relative;width:100%;flex:1;min-height:min(680px,calc(100vh - 126px));overflow:hidden;background:#e8ebe4}
  .map{height:100%;min-height:min(680px,calc(100vh - 126px));width:100%}
  .area-panel{position:absolute;z-index:2;right:15px;top:15px;background:#fafaf8;border:1px solid #d5ded5;box-shadow:0 8px 22px #263b3026;width:min(290px,calc(100% - 30px));max-height:65%;overflow-y:auto}
  .panel-heading{padding:13px 14px;display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #e1e5df}
  .panel-heading div{display:flex;flex-direction:column;gap:2px}
  .panel-heading strong{font-size:14px}.panel-heading span{font-size:11px;color:#69756d}
  .panel-heading button{font-size:23px;line-height:1;background:none;border:0;padding:0;color:#54655a;cursor:pointer}
  .people{display:flex;flex-direction:column}
  .people button{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border:0;background:transparent;color:#273d2f;text-align:left;cursor:pointer;border-bottom:1px solid #edf0eb}
  .people button:hover,.people button:focus-visible{background:#eff3ed}
  .people button.own-person{background:#f8e9df;color:#653c26;border-left:3px solid #a55e3c;padding-left:11px}
  .people button.own-person:hover,.people button.own-person:focus-visible{background:#f3dfd0}
  .person-label{display:flex;flex-direction:column;gap:2px}
  .own-hint{font-size:11px;color:#86563f}
  .legend{position:absolute;bottom:12px;left:12px;padding:6px 9px;background:#fafaf8ed;z-index:1;max-width:70%;font-size:11px;color:#5d6d62}
  @media(max-width:760px){.map-shell,.map{min-height:min(52vh,470px)}.area-panel{top:10px;right:10px;max-height:70%}.legend{max-width:85%}}
</style>