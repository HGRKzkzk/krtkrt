<script lang="ts">
  import { onMount } from 'svelte';
  import MapView from '$lib/MapView.svelte';
  import { demoPosts, demoMessages, demoConnections } from '$lib/demo';
  import type { Post, Message, Connection, Kind, Visibility } from '$lib/types';

  type Tab='kaart'|'kringen'|'ontdek';
  let tab:Tab='kaart';
  let posts:Post[] = [...demoPosts];
  let messages:Message[] = [...demoMessages];
  let connections:Connection[] = [...demoConnections];
  let channel='algemeen';
  let showComposer=false;
  let postText=''; let postKind:Kind='vraag'; let postVisibility:Visibility='kring';
  let messageText='';
  let from=''; let to=''; let reason='';
  let screenName='Gast';
  let stored=false;
  let notice='';
  const key='onder-elkaar-demo-v1';
  onMount(()=>{
    try {
      const raw=localStorage.getItem(key);
      if(raw){const d=JSON.parse(raw); posts=Array.isArray(d.posts)?d.posts:demoPosts; messages=Array.isArray(d.messages)?d.messages:demoMessages; connections=Array.isArray(d.connections)?d.connections:demoConnections; screenName=typeof d.screenName==='string'?d.screenName:'Gast';}
      stored=true;
    }catch{notice='Lokale gegevens konden niet worden geladen.';stored=true;}
  });
  function persist(){if(!stored)return;try{localStorage.setItem(key,JSON.stringify({posts,messages,connections,screenName}));}catch{notice='Opslaan in deze browser lukt niet.';}}
  function addPost(){if(!postText.trim())return; posts=[{id:crypto.randomUUID(), author:screenName.trim()||'Gast',kind:postKind,text:postText.trim(),visibility:postVisibility,circle:'Schildergroep',createdAt:Date.now()},...posts];postText='';showComposer=false;persist();}
  function addMessage(){if(!messageText.trim())return;messages=[...messages,{id:crypto.randomUUID(),author:screenName.trim()||'Gast',channel,text:messageText.trim(),createdAt:Date.now()}];messageText='';persist();}
  function addConnection(){if(!from.trim()||!to.trim()||!reason.trim())return;connections=[{id:crypto.randomUUID(),author:screenName.trim()||'Gast',from:from.trim(),to:to.trim(),reason:reason.trim(),createdAt:Date.now()},...connections];from='';to='';reason='';persist();}
  function reset(){if(!confirm('Alle eigen bijdragen in deze browser verwijderen en demo herstellen?'))return;posts=[...demoPosts];messages=[...demoMessages];connections=[...demoConnections];screenName='Gast';persist();}
  function removePost(id:string){posts=posts.filter(p=>p.id!==id);persist();}
  function removeConnection(id:string){connections=connections.filter(c=>c.id!==id);persist();}
  function when(ts:number){return new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short'}).format(new Date(ts));}
</script>
<svelte:head>
  <title>Onder elkaar — een kleine hub voor wat er speelt</title>
  <meta name="description" content="Demo van een buurtgerichte hub met kaart, kringen en routes tussen ideeën." />
</svelte:head>
<div class="page">
  <header class="topbar">
    <div class="brand"><span class="brandmark">◎</span><div><strong>Onder elkaar</strong><small>Een plek om elkaar te vinden</small></div></div>
    <span class="chip">Proefversie</span>
  </header>
  <div class="demo-warning"><strong>Lokale demo.</strong> Alle personen en bestaande berichten zijn fictief. Wat je toevoegt blijft alleen in deze browser: andere bezoekers kunnen het niet zien. Geen accounts, gedeelde chat of echte uitnodigingen.</div>
  <main>
    <section class="intro"><span class="eyebrow">WELKOM</span><h1>Wat speelt er bij elkaar?</h1><p>Vraag iets. Deel iets. Leg een onverwacht verband. De hub is een vertrekpunt, geen eindstation.</p></section>
    <nav class="tabs" aria-label="Hoofdnavigatie">
      <button class:active={tab==='kaart'} onclick={()=>tab='kaart'}>⌾ <span>Kaart</span></button>
      <button class:active={tab==='kringen'} onclick={()=>tab='kringen'}>♧ <span>Kringen</span></button>
      <button class:active={tab==='ontdek'} onclick={()=>tab='ontdek'}>✧ <span>Ontdek</span></button>
    </nav>
    <div class="identity"><label for="screen-name">Naam voor deze demo</label><input id="screen-name" bind:value={screenName} onblur={persist} maxlength="40"/><span>Geen profiel; alleen een naam bij je lokale bijdragen.</span></div>
    {#if notice}<p role="status" class="notice">{notice}</p>{/if}
    {#if tab==='kaart'}
      <section class="sectionhead"><div><span class="eyebrow">IN DE OMGEVING</span><h2>Een kaart om rond te kijken</h2></div><button class="primary" onclick={()=>showComposer=!showComposer}>{showComposer?'Sluiten':'+ Oproep'}</button></section>
      <MapView />
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
          <article class="panel post"><div class="postmeta"><span class="pill">{post.kind}</span><span>{post.visibility==='kring'?'Schildergroep':'Buurt (concept)'} · {when(post.createdAt)}</span></div><p>{post.text}</p><footer><span>{post.author}</span>{#if !post.demo}<button class="textbutton" onclick={()=>removePost(post.id)}>Verwijderen</button>{/if}</footer></article>
        {/each}
      </div>
    {:else if tab==='kringen'}
      <section class="sectionhead"><div><span class="eyebrow">EERSTE KRING</span><h2>De schildergroep</h2></div><span class="chip">Besloten · concept</span></section>
      <p class="lead">Een eigen plek om te praten, materiaal te delen en iets van elkaar te ontdekken. In de echte versie alleen toegankelijk voor leden.</p>
      <div class="channelbar"><button class:chosen={channel==='algemeen'} onclick={()=>channel='algemeen'}># algemeen</button><button class:chosen={channel==='materiaal'} onclick={()=>channel='materiaal'}># materiaal</button></div>
      <div class="panel conversation">
        {#each messages.filter(m=>m.channel===channel) as m (m.id)}<div class="message"><div class="avatar">{m.author.charAt(0).toUpperCase()}</div><div><div class="messagehead"><strong>{m.author}</strong><span>{when(m.createdAt)}</span></div><p>{m.text}</p></div></div>{/each}
        <form class="messageform" onsubmit={(e)=>{e.preventDefault();addMessage();}}><label for="chat-input">Schrijf in #{channel}</label><div class="sendrow"><input id="chat-input" bind:value={messageText} maxlength="500" placeholder="Wat wil je delen?" required/><button class="primary" type="submit">Plaats</button></div></form>
      </div>
      <p class="hint">Dit lijkt op een gedeeld gesprek, maar is alleen een lokale simulatie. Echte kringrechten en realtime berichten komen in een latere ontwikkelfase.</p>
    {:else}
      <section class="sectionhead"><div><span class="eyebrow">BETEKENIS EN VERWANTSCHAP</span><h2>Onverwachte routes</h2></div></section>
      <p class="lead">Wat raakt je, wat stoot je af en welke verbinding hoor of zie jij die niet vanzelfsprekend is? Een route is een uitnodiging, geen uitspraak over wat je moet waarderen.</p>
      <div class="stack">
        {#each connections as c (c.id)}<article class="panel connection"><div class="connectionends"><span>{c.from}</span><span class="arrow">↔</span><span>{c.to}</span></div><p>{c.reason}</p><footer><span>Voorgesteld door {c.author}</span>{#if !c.demo}<button class="textbutton" onclick={()=>removeConnection(c.id)}>Verwijderen</button>{/if}</footer></article>{/each}
      </div>
      <form class="panel form" onsubmit={(e)=>{e.preventDefault();addConnection();}}><h3>Leg zelf een verband</h3><div class="twocol"><div><label for="from">Van</label><input id="from" bind:value={from} maxlength="80" placeholder="Joy Division" required/></div><div><label for="to">Naar</label><input id="to" bind:value={to} maxlength="80" placeholder="Massive Attack" required/></div></div><label for="reason">Wat zie, hoor of vermoed je?</label><textarea id="reason" bind:value={reason} rows="3" maxlength="800" placeholder="Het is een andere muzikale taal, maar toch…" required></textarea><button type="submit" class="primary">Bewaar mijn route</button></form>
    {/if}
  </main>
  <footer class="sitefoot"><p>Onder elkaar · lokale ontwerpdemonstratie · geen openbaar netwerk</p><button class="textbutton" onclick={reset}>Herstel voorbeelddata</button></footer>
</div>
<style>
  :global(*){box-sizing:border-box}:global(body){margin:0;background:#f7f7f2;color:#26362c;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.5}:global(button),:global(input),:global(select),:global(textarea){font:inherit}:global(button){cursor:pointer}:global(button:focus-visible),:global(input:focus-visible),:global(select:focus-visible),:global(textarea:focus-visible){outline:3px solid #95bba7;outline-offset:2px}
  .page{max-width:950px;margin:auto;padding:0 22px}.topbar{display:flex;align-items:center;justify-content:space-between;padding:25px 0 19px;border-bottom:1px solid #dce3d9}.brand{display:flex;gap:13px;align-items:center}.brandmark{background:#38634f;color:#fff;font-size:28px;width:45px;height:45px;display:grid;place-items:center;border-radius:13px}.brand strong{display:block;font-size:21px;letter-spacing:-.65px}.brand small{display:block;color:#6b766d;font-size:12px}.chip{font-size:12px;background:#e4ece3;padding:6px 11px;border-radius:100px;white-space:nowrap;color:#416149}.demo-warning{margin-top:18px;border:1px solid #ddc9a3;background:#fcf5e9;border-radius:12px;padding:12px 15px;font-size:13px;color:#695638}.intro{padding:37px 0 26px}.eyebrow{font-size:11px;color:#577965;font-weight:750;letter-spacing:1.4px}h1{font-size:clamp(31px,6vw,45px);line-height:1.15;margin:8px 0 12px;letter-spacing:-1.3px}h2{font-size:25px;letter-spacing:-.6px;line-height:1.2;margin:5px 0}h3{font-size:18px;margin:0 0 12px}.intro p,.lead{max-width:660px;font-size:15px;color:#607066}.intro p{margin:0}.tabs{display:grid;grid-template-columns:repeat(3,1fr);background:#e9ece6;padding:5px;border-radius:14px;margin:4px 0 23px;gap:4px}.tabs button{border:none;background:transparent;border-radius:10px;padding:11px;color:#657467;font-weight:600}.tabs button.active{background:#fff;box-shadow:0 1px 6px #1b37210d;color:#264938}.identity{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:#eef2ea;border-radius:12px;padding:9px 13px;margin-bottom:26px}.identity label{font-size:12px;font-weight:700}.identity input{width:130px;padding:7px 9px;border:1px solid #c8d6ca;border-radius:7px;background:white}.identity span{font-size:11px;color:#697769}.sectionhead{display:flex;align-items:center;justify-content:space-between;gap:15px;margin:0 0 18px}.primary{color:white;background:#376b50;border:1px solid #376b50;border-radius:9px;font-size:13px;font-weight:650;padding:10px 15px;white-space:nowrap}.primary:hover{background:#29583e}.hint{font-size:12px;color:#718174;margin:10px 0 22px}.listtitle{margin:24px 0 12px}.stack{display:grid;gap:12px}.panel{background:#fff;border:1px solid #e0e6db;border-radius:14px;padding:18px;box-shadow:0 2px 7px #0f2b1510}.postmeta{display:flex;justify-content:space-between;gap:10px;color:#738074;font-size:11px;align-items:center}.pill{color:#42634e;background:#eaf2e9;padding:3px 9px;border-radius:50px;text-transform:capitalize;font-weight:700}.post p,.connection p{font-size:15px;margin:11px 0 19px;white-space:pre-wrap;overflow-wrap:anywhere}.post footer,.connection footer{border-top:1px solid #eef0ec;padding-top:10px;display:flex;justify-content:space-between;color:#6e7c70;font-size:12px}.textbutton{border:0;background:transparent;text-decoration:underline;color:#3d6f55;font-size:12px;padding:0}.form{display:grid;gap:9px;margin:16px 0}.form label,.messageform label{font-weight:650;font-size:12px}.form input,.form select,.form textarea,.messageform input{width:100%;border:1px solid #cdd8cd;padding:10px;border-radius:9px;background:#fff;color:#26362c}.form .primary{justify-self:start}.form .hint{margin:0 0 8px}.channelbar{display:flex;gap:7px;margin:20px 0 12px}.channelbar button{border:1px solid #d3ddd2;background:#eef2ed;padding:9px 14px;border-radius:8px;color:#54705b}.channelbar button.chosen{background:#376b50;color:white}.conversation{min-height:250px}.message{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid #edf0eb}.avatar{height:34px;width:34px;flex:0 0 34px;border-radius:10px;background:#dfebe1;display:grid;place-items:center;color:#416a50;font-weight:750}.messagehead{display:flex;gap:10px;align-items:center}.messagehead strong{font-size:13px}.messagehead span{font-size:11px;color:#8b978b}.message p{margin:3px 0 0;font-size:14px;overflow-wrap:anywhere}.messageform{margin-top:24px;display:grid;gap:8px}.sendrow{display:flex;gap:9px}.connectionends{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-weight:750}.connectionends span:not(.arrow){background:#eaf0e8;padding:7px 11px;border-radius:8px}.arrow{color:#7e9386}.twocol{display:grid;grid-template-columns:1fr 1fr;gap:12px}.twocol>div{display:grid;gap:8px}.sitefoot{display:flex;justify-content:space-between;gap:12px;align-items:center;border-top:1px solid #dce3d9;margin-top:60px;padding:20px 0 35px;font-size:12px;color:#758274}.notice{color:#925f29}.lead{margin:0 0 12px}
  @media(max-width:600px){.page{padding:0 14px}.topbar{padding:18px 0}.intro{padding:27px 0 20px}.sectionhead{align-items:flex-start}h2{font-size:22px}.panel{padding:14px}.sitefoot{flex-direction:column;align-items:flex-start}.twocol{grid-template-columns:1fr}.identity span{width:100%}.sendrow input{min-width:0}}
</style>