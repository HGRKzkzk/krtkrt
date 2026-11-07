<script lang="ts">
  import { onMount } from 'svelte';
  import MapView from '$lib/MapView.svelte';
  import { demoPosts, demoMessages, demoConnections } from '$lib/demo';
  import type { Post, Message, Connection, Kind, Visibility } from '$lib/types';

  type Tab='kaart'|'kringen'|'profiel';
  let tab:Tab='kaart';
  let selectedPostId: string | null = 'p1';
  let selectedPerson: string | null = null;
  type Profile = { bio: string; appreciates: string; dislikes: string; links: string };
  let myProfile: Profile = {bio:'',appreciates:'',dislikes:'',links:''};
  const demoPeople: Record<string,{bio:string;appreciates:string;dislikes:string;links:string}> = {
    'Noor (voorbeeld)':{bio:'Ik schilder sinds kort en ontdek graag wat er mogelijk is met beperkte middelen.',appreciates:'Kleur, wandelen, spontaan iets proberen',dislikes:'Niet alles hoeft perfect te zijn.',links:''},
    'Sam (voorbeeld)':{bio:'Ik houd van kunst, koken en spullen die je samen kunt gebruiken.',appreciates:'Samen maken, delen, experimenteren',dislikes:'Wegwerpcultuur',links:''},
    'Alex (voorbeeld)':{bio:'Ik maak graag dingen en help af en toe iemand met een klus.',appreciates:'Muziek, hout, schilderen',dislikes:'Onnodig ingewikkeld doen',links:''},
    'Mika (voorbeeld)':{bio:'Ik ben benieuwd waarom iets ons raakt.',appreciates:'Gesprekken, schilderkunst, muziek',dislikes:'Smaak als wedstrijd',links:''},
    'Voorbeeldbijdrage':{bio:'Een fictief voorbeeldprofiel met persoonlijke observaties.',appreciates:'Onverwachte verbindingen',dislikes:'Dwingende aanbevelingen',links:''}
  };
  function openPerson(name:string){selectedPerson=name===screenName?null:name;tab='profiel';}
  function openCircle(){tab='kringen';channel='algemeen';}
  function choosePost(id:string){selectedPostId=id;}
  function safeLinks(raw:string){return raw.split(/\n|,/).map(x=>x.trim()).filter(x=>/^https:\/\/[^\s]+$/i.test(x)).slice(0,5);}
  let posts:Post[] = [...demoPosts];
  let messages:Message[] = [...demoMessages];
  let connections:Connection[] = [...demoConnections];
  let channel='algemeen';
  let showComposer=false;
  let postText=''; let postKind:Kind='vraag'; let postVisibility:Visibility='kring';
  let messageText='';
  let screenName='Gast';
  let stored=false;
  let notice='';
  $: currentPost = posts.find(p=>p.id===selectedPostId) || null;
  $: shownProfile = selectedPerson ? demoPeople[selectedPerson] || {bio:'Deze persoon heeft nog geen publiek demo-profiel.',appreciates:'',dislikes:'',links:''} : myProfile;
  $: profileName = selectedPerson || screenName || 'Gast';
  const key='onder-elkaar-demo-v1';
  onMount(()=>{
    try {
      const raw=localStorage.getItem(key);
      if(raw){const d=JSON.parse(raw); posts=Array.isArray(d.posts)?d.posts:demoPosts; messages=Array.isArray(d.messages)?d.messages:demoMessages; connections=Array.isArray(d.connections)?d.connections:demoConnections; screenName=typeof d.screenName==='string'?d.screenName:'Gast'; myProfile=d.myProfile && typeof d.myProfile==='object' ? {bio:String(d.myProfile.bio||''),appreciates:String(d.myProfile.appreciates||''),dislikes:String(d.myProfile.dislikes||''),links:String(d.myProfile.links||'')} : myProfile;}
      stored=true;
    }catch{notice='Lokale gegevens konden niet worden geladen.';stored=true;}
  });
  function persist(){if(!stored)return;try{localStorage.setItem(key,JSON.stringify({posts,messages,connections,screenName,myProfile}));}catch{notice='Opslaan in deze browser lukt niet.';}}
  function addPost(){if(!postText.trim())return; posts=[{id:crypto.randomUUID(), author:screenName.trim()||'Gast',kind:postKind,text:postText.trim(),visibility:postVisibility,circle:'Schildergroep',createdAt:Date.now()},...posts];postText='';showComposer=false;persist();}
  function addMessage(){if(!messageText.trim())return;messages=[...messages,{id:crypto.randomUUID(),author:screenName.trim()||'Gast',channel,text:messageText.trim(),createdAt:Date.now()}];messageText='';persist();}
  function reset(){if(!confirm('Alle eigen bijdragen in deze browser verwijderen en demo herstellen?'))return;posts=[...demoPosts];messages=[...demoMessages];connections=[...demoConnections];screenName='Gast';myProfile={bio:'',appreciates:'',dislikes:'',links:''};selectedPerson=null;selectedPostId='p1';tab='kaart';persist();}
  function removePost(id:string){posts=posts.filter(p=>p.id!==id);persist();}
  function when(ts:number){return new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short'}).format(new Date(ts));}
</script>
<svelte:head>
  <title>Onder elkaar — een kleine hub voor wat er speelt</title>
  <meta name="description" content="Demo van een buurtgerichte hub met kaart, kringen, persoonlijke bijdragen en ontmoetingen." />
</svelte:head>
<div class="page">
  <header class="topbar">
    <div class="brand"><span class="brandmark">◎</span><div><strong>Onder elkaar</strong><small>Een plek om elkaar te vinden</small></div></div>
    <button class="profile-top" onclick={()=>openPerson(screenName)} aria-label="Open mijn plek">◉ Mijn plek</button>
  </header>
  <div class="demo-warning"><strong>Lokale demo.</strong> Alle personen en bestaande berichten zijn fictief. Wat je toevoegt blijft alleen in deze browser: andere bezoekers kunnen het niet zien. Geen accounts, gedeelde chat of echte uitnodigingen.</div>
  <main>
    <section class="intro"><span class="eyebrow">WELKOM</span><h1>Wat speelt er bij elkaar?</h1><p>Vraag iets. Deel iets van jezelf. Maak kennis met anderen. De hub is een vertrekpunt, geen eindstation.</p></section>
    <nav class="tabs" aria-label="Hoofdnavigatie">
      <button class:active={tab==='kaart'} onclick={()=>tab='kaart'}>⌾ <span>Kaart</span></button>
      <button class:active={tab==='kringen'} onclick={()=>tab='kringen'}>♧ <span>Kringen</span></button>
      <button class:active={tab==='profiel'} onclick={()=>openPerson(screenName)}>◉ <span>Mijn plek</span></button>
    </nav>
    <div class="start-here"><strong>Begin hier:</strong> bekijk een oproep op de kaart, praat in de schildergroep of vertel iets over jezelf bij <button class="inline-link" onclick={()=>openPerson(screenName)}>Mijn plek</button>.</div>
    <div class="identity"><label for="screen-name">Naam voor deze demo</label><input id="screen-name" bind:value={screenName} onblur={persist} maxlength="40"/><span>Deze naam staat bij je bijdragen en bij je lokale profiel.</span></div>
    {#if notice}<p role="status" class="notice">{notice}</p>{/if}
    {#if tab==='kaart'}
      <section class="sectionhead"><div><span class="eyebrow">IN DE OMGEVING</span><h2>Een kaart om rond te kijken</h2></div><button class="primary" onclick={()=>showComposer=!showComposer}>{showComposer?'Sluiten':'+ Oproep'}</button></section>
      <MapView {posts} selectedId={selectedPostId} onSelect={choosePost} />
      {#if currentPost}
        <aside class="panel selected-post" aria-live="polite">
          <span class="eyebrow">GEKOZEN OP DE KAART · FICTIEVE LOCATIE</span>
          <p>{currentPost.text}</p>
          <div class="quick-actions"><button onclick={()=>openPerson(currentPost.author)}>Over {currentPost.author}</button><button onclick={openCircle}>Naar de schilderkring</button></div>
        </aside>
      {/if}
      <p class="hint">Deze demo koppelt oproepen alleen aan de regio; er worden geen woonadressen of exacte locaties geregistreerd.</p>
      {#if showComposer}
        <form class="panel form" onsubmit={(e)=>{e.preventDefault();addPost();}}>
          <h3>Wat wil je delen?</h3><label for="post-kind">Soort bericht</label><select id="post-kind" bind:value={postKind}><option value="vraag">Ik vraag iets</option><option value="aanbod">Ik bied iets aan</option><option value="gedachte">Ik deel een gedachte</option></select>
          <label for="post-text">In je eigen woorden</label><textarea id="post-text" bind:value={postText} rows="3" maxlength="600" placeholder="Heeft iemand nog een tube ultramarijn?" required></textarea>
          <label for="post-vis">Zichtbaarheid (concept)</label><select id="post-vis" bind:value={postVisibility}><option value="kring">Alleen schilderkring</option><option value="buurt">Buurt</option></select>
          <p class="hint">De keuze is een demonstratie van de toekomstige rechtenstructuur. Deze demo wordt niet online gedeeld.</p><button type="submit" class="primary">Plaats in mijn demo</button>
        </form>
      {/if}
      <h3 class="listtitle">Oproepen en gedachten</h3>
      <div class="stack">
        {#each posts as post (post.id)}
          <article class:highlight={selectedPostId===post.id} class="panel post"><div class="postmeta"><span class="pill">{post.kind}</span><span>{post.visibility==='kring'?'Schildergroep':'Buurt (concept)'} · {when(post.createdAt)}</span></div><p>{post.text}</p><footer><span><button class="textbutton" onclick={()=>openPerson(post.author)}>{post.author} · Bekijk profiel</button> <button class="textbutton" onclick={()=>{tab='kaart';choosePost(post.id);}}>Toon op kaart</button> <button class="textbutton" onclick={openCircle}>Naar kring</button></span>{#if !post.demo}<button class="textbutton" onclick={()=>removePost(post.id)}>Verwijderen</button>{/if}</footer></article>
        {/each}
      </div>
    {:else if tab==='kringen'}
      <section class="sectionhead"><div><span class="eyebrow">EERSTE KRING</span><h2>De schildergroep</h2></div><span class="chip">Besloten · concept</span></section>
      <p class="lead">Een eigen plek om te praten, materiaal te delen en iets van elkaar te ontdekken. In de echte versie alleen toegankelijk voor leden.</p>
      <div class="channelbar"><button class:chosen={channel==='algemeen'} onclick={()=>channel='algemeen'}># algemeen</button><button class:chosen={channel==='materiaal'} onclick={()=>channel='materiaal'}># materiaal</button></div>
      <div class="panel conversation">
        {#each messages.filter(m=>m.channel===channel) as m (m.id)}<div class="message"><div class="avatar">{m.author.charAt(0).toUpperCase()}</div><div><div class="messagehead"><button class="person-button" onclick={()=>openPerson(m.author)}>{m.author}</button><span>{when(m.createdAt)}</span></div><p>{m.text}</p></div></div>{/each}
        <form class="messageform" onsubmit={(e)=>{e.preventDefault();addMessage();}}><label for="chat-input">Schrijf in #{channel}</label><div class="sendrow"><input id="chat-input" bind:value={messageText} maxlength="500" placeholder="Wat wil je delen?" required/><button class="primary" type="submit">Plaats</button></div></form>
      </div>
      <p class="hint">Dit lijkt op een gedeeld gesprek, maar is alleen een lokale simulatie. Echte kringrechten en realtime berichten komen in een latere ontwikkelfase.</p>
    {:else if tab==='profiel'}
      <section class="sectionhead"><div><span class="eyebrow">PERSOONLIJKE PLEK</span><h2>{selectedPerson ? profileName : 'Mijn plek'}</h2></div>
        {#if selectedPerson}<button class="primary" onclick={()=>openPerson(screenName)}>Terug naar mijn plek</button>{:else}<span class="chip">Alleen in deze browser</span>{/if}
      </section>
      <p class="lead">Een profiel is geen checklist van wie je bent. Vertel wat je wilt laten zien, of houd het eenvoudig.</p>
      {#if selectedPerson}
        <article class="panel profile-view"><h3>{profileName}</h3><p>{shownProfile.bio || 'Nog geen introductie.'}</p>
          {#if shownProfile.appreciates}<h4>Wat me aanspreekt</h4><p>{shownProfile.appreciates}</p>{/if}
          {#if shownProfile.dislikes}<h4>Waar ik op afhaak of over twijfel</h4><p>{shownProfile.dislikes}</p>{/if}
          {#each safeLinks(shownProfile.links) as link}<p><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></p>{/each}
          <h4>Bijdragen in deze demo</h4>
          {#each posts.filter(p=>p.author===selectedPerson) as p}<div class="profile-contribution"><p>{p.text}</p><button class="textbutton" onclick={()=>{tab='kaart';choosePost(p.id);}}>Bekijk op de kaart</button></div>{/each}
          {#each connections.filter(c=>c.author===selectedPerson) as c}<div class="profile-contribution"><p>{c.reason}</p><span class="hint">Over {c.from} en {c.to}</span></div>{/each}
        </article>
      {:else}
        <form class="panel form" onsubmit={(e)=>{e.preventDefault();persist();notice='Je profiel is in deze browser opgeslagen.';}}>
          <label for="profile-bio">Iets over jezelf (mag ook heel kort)</label><textarea id="profile-bio" bind:value={myProfile.bio} rows="3" maxlength="1000" placeholder="Wie ben je, waar word je nieuwsgierig van?"></textarea>
          <label for="profile-appreciates">Wat spreekt je aan?</label><textarea id="profile-appreciates" bind:value={myProfile.appreciates} rows="3" maxlength="700" placeholder="Bijvoorbeeld: klank, schilderen, onverwachte ontmoetingen…"></textarea>
          <label for="profile-dislikes">Waar haak je op af, of waar twijfel je over?</label><textarea id="profile-dislikes" bind:value={myProfile.dislikes} rows="3" maxlength="700" placeholder="Mag genuanceerd, tegenstrijdig of leeg blijven."></textarea>
          <label for="profile-links">Links naar andere plekken (één https-link per regel)</label><textarea id="profile-links" bind:value={myProfile.links} rows="3" maxlength="1200" placeholder="https://..."></textarea>
          <button type="submit" class="primary">Bewaar mijn plek</button>
        </form>
        <div class="panel"><h3>Mijn bijdragen</h3>
        {#if posts.filter(p=>p.author===screenName&&!p.demo).length===0 && connections.filter(c=>c.author===screenName&&!c.demo).length===0}<p class="hint">Je hebt nog geen bijdragen geplaatst. Dat hoeft ook niet.</p>{/if}
        {#each posts.filter(p=>p.author===screenName&&!p.demo) as p}<div class="profile-contribution"><p>{p.text}</p><button class="textbutton" onclick={()=>{tab='kaart';choosePost(p.id);}}>Bekijk op kaart</button></div>{/each}
        {#each connections.filter(c=>c.author===screenName&&!c.demo) as c}<div class="profile-contribution"><p>{c.reason}</p><span class="hint">Eerder geschreven over {c.from} en {c.to}</span></div>{/each}
        </div>
      {/if}
    {/if}
  </main>
  <footer class="sitefoot"><p>Onder elkaar · lokale ontwerpdemonstratie · geen openbaar netwerk</p><button class="textbutton" onclick={reset}>Herstel voorbeelddata</button></footer>
</div>
<style>
  :global(*){box-sizing:border-box}:global(body){margin:0;background:#f7f7f2;color:#26362c;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.5}:global(button),:global(input),:global(select),:global(textarea){font:inherit}:global(button){cursor:pointer}:global(button:focus-visible),:global(input:focus-visible),:global(select:focus-visible),:global(textarea:focus-visible){outline:3px solid #95bba7;outline-offset:2px}
  .page{max-width:950px;margin:auto;padding:0 22px}.topbar{display:flex;align-items:center;justify-content:space-between;padding:25px 0 19px;border-bottom:1px solid #dce3d9}.brand{display:flex;gap:13px;align-items:center}.brandmark{background:#38634f;color:#fff;font-size:28px;width:45px;height:45px;display:grid;place-items:center;border-radius:13px}.brand strong{display:block;font-size:21px;letter-spacing:-.65px}.brand small{display:block;color:#6b766d;font-size:12px}.chip{font-size:12px;background:#e4ece3;padding:6px 11px;border-radius:100px;white-space:nowrap;color:#416149}.demo-warning{margin-top:18px;border:1px solid #ddc9a3;background:#fcf5e9;border-radius:12px;padding:12px 15px;font-size:13px;color:#695638}.intro{padding:37px 0 26px}.eyebrow{font-size:11px;color:#577965;font-weight:750;letter-spacing:1.4px}h1{font-size:clamp(31px,6vw,45px);line-height:1.15;margin:8px 0 12px;letter-spacing:-1.3px}h2{font-size:25px;letter-spacing:-.6px;line-height:1.2;margin:5px 0}h3{font-size:18px;margin:0 0 12px}.intro p,.lead{max-width:660px;font-size:15px;color:#607066}.intro p{margin:0}.tabs{display:grid;grid-template-columns:repeat(3,1fr);background:#e9ece6;padding:5px;border-radius:14px;margin:4px 0 23px;gap:4px}.tabs button{border:none;background:transparent;border-radius:10px;padding:11px;color:#657467;font-weight:600}.tabs button.active{background:#fff;box-shadow:0 1px 6px #1b37210d;color:#264938}.identity{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:#eef2ea;border-radius:12px;padding:9px 13px;margin-bottom:26px}.identity label{font-size:12px;font-weight:700}.identity input{width:130px;padding:7px 9px;border:1px solid #c8d6ca;border-radius:7px;background:white}.identity span{font-size:11px;color:#697769}.sectionhead{display:flex;align-items:center;justify-content:space-between;gap:15px;margin:0 0 18px}.primary{color:white;background:#376b50;border:1px solid #376b50;border-radius:9px;font-size:13px;font-weight:650;padding:10px 15px;white-space:nowrap}.primary:hover{background:#29583e}.hint{font-size:12px;color:#718174;margin:10px 0 22px}.listtitle{margin:24px 0 12px}.stack{display:grid;gap:12px}.panel{background:#fff;border:1px solid #e0e6db;border-radius:14px;padding:18px;box-shadow:0 2px 7px #0f2b1510}.postmeta{display:flex;justify-content:space-between;gap:10px;color:#738074;font-size:11px;align-items:center}.pill{color:#42634e;background:#eaf2e9;padding:3px 9px;border-radius:50px;text-transform:capitalize;font-weight:700}.post p,.connection p{font-size:15px;margin:11px 0 19px;white-space:pre-wrap;overflow-wrap:anywhere}.post footer,.connection footer{border-top:1px solid #eef0ec;padding-top:10px;display:flex;justify-content:space-between;color:#6e7c70;font-size:12px}.textbutton{border:0;background:transparent;text-decoration:underline;color:#3d6f55;font-size:12px;padding:0}.form{display:grid;gap:9px;margin:16px 0}.form label,.messageform label{font-weight:650;font-size:12px}.form input,.form select,.form textarea,.messageform input{width:100%;border:1px solid #cdd8cd;padding:10px;border-radius:9px;background:#fff;color:#26362c}.form .primary{justify-self:start}.form .hint{margin:0 0 8px}.channelbar{display:flex;gap:7px;margin:20px 0 12px}.channelbar button{border:1px solid #d3ddd2;background:#eef2ed;padding:9px 14px;border-radius:8px;color:#54705b}.channelbar button.chosen{background:#376b50;color:white}.conversation{min-height:250px}.message{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid #edf0eb}.avatar{height:34px;width:34px;flex:0 0 34px;border-radius:10px;background:#dfebe1;display:grid;place-items:center;color:#416a50;font-weight:750}.messagehead{display:flex;gap:10px;align-items:center}.messagehead strong{font-size:13px}.messagehead span{font-size:11px;color:#8b978b}.message p{margin:3px 0 0;font-size:14px;overflow-wrap:anywhere}.messageform{margin-top:24px;display:grid;gap:8px}.sendrow{display:flex;gap:9px}.connectionends{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-weight:750}.connectionends span:not(.arrow){background:#eaf0e8;padding:7px 11px;border-radius:8px}.arrow{color:#7e9386}.twocol{display:grid;grid-template-columns:1fr 1fr;gap:12px}.twocol>div{display:grid;gap:8px}.sitefoot{display:flex;justify-content:space-between;gap:12px;align-items:center;border-top:1px solid #dce3d9;margin-top:60px;padding:20px 0 35px;font-size:12px;color:#758274}.notice{color:#925f29}.lead{margin:0 0 12px}
  .start-here{font-size:13px;background:#edf3e8;border:1px solid #dce7d9;border-radius:11px;padding:12px 14px;margin-bottom:15px}.inline-link{padding:0;border:0;background:transparent;text-decoration:underline;color:#28573e;font-weight:700}.profile-top{border:1px solid #b4c9b5;background:#ecf3ec;padding:9px 12px;border-radius:10px;color:#315c43;font-weight:700}.quick-actions{display:flex;flex-wrap:wrap;gap:9px}.quick-actions button{padding:7px 11px;border:1px solid #cdd9cf;background:#f3f7f0;color:#28553b;border-radius:8px;font-size:13px}.selected-post{margin:12px 0}.selected-post p{margin:8px 0 12px}.highlight{border-color:#78a588;box-shadow:0 0 0 1px #78a588}.person-button{color:#315d43;font-weight:700;border:0;background:transparent;padding:0;text-decoration:underline}.profile-view h4{margin:19px 0 5px;font-size:14px}.profile-view a{overflow-wrap:anywhere}.profile-contribution{padding:10px 0;border-top:1px solid #e3e9e0;font-size:13px}.profile-contribution p{margin:3px 0 8px}
  @media(max-width:600px){.page{padding:0 14px}.topbar{padding:18px 0}.intro{padding:27px 0 20px}.sectionhead{align-items:flex-start}h2{font-size:22px}.panel{padding:14px}.sitefoot{flex-direction:column;align-items:flex-start}.twocol{grid-template-columns:1fr}.identity span{width:100%}.sendrow input{min-width:0}.tabs button{font-size:12px;padding:9px 4px}.profile-top{font-size:12px}}
</style>