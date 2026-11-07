<script lang="ts">
  import { onMount } from 'svelte';
  import MapView from '$lib/MapView.svelte';
  import PersonalPlaceView from '$lib/PersonalPlace.svelte';
  import { emptyPlace, fromLegacy, cleanPlace } from '$lib/personalPlace';
  import type { PersonalPlace } from '$lib/personalPlace';
  import { demoPosts, demoMessages, demoConnections } from '$lib/demo';
  import type { Post, Message, Connection, Kind, Visibility } from '$lib/types';

  type Tab = 'kaart' | 'kringen' | 'profiel';
  type Profile = { bio: string; appreciates: string; dislikes: string; links: string };
  let tab: Tab = 'kaart';
  let selectedPostId: string | null = 'p1';
  let selectedPerson: string | null = null;
  let posts: Post[] = [...demoPosts];
  let messages: Message[] = [...demoMessages];
  // Preserve historical notes written in older demo versions; no route editor.
  let connections: Connection[] = [...demoConnections];
  let myProfile: Profile = { bio: '', appreciates: '', dislikes: '', links: '' };
  let personalPlace: PersonalPlace = emptyPlace();
  let screenName = 'Gast';
  let channel = 'algemeen';
  let showComposer = false;
  let editingProfile = false;
  let postText = '';
  let postKind: Kind = 'vraag';
  let postVisibility: Visibility = 'kring';
  let messageText = '';
  let notice = '';
  let stored = false;
  const key = 'onder-elkaar-demo-v1';
  const demoPeople: Record<string, Profile> = {
    'Noor (voorbeeld)': { bio: 'Ik schilder sinds kort en ontdek graag wat er mogelijk is met beperkte middelen.', appreciates: 'Kleur, wandelen, spontaan iets proberen', dislikes: 'Niet alles hoeft perfect te zijn.', links: '' },
    'Sam (voorbeeld)': { bio: 'Ik houd van kunst, koken en spullen die je samen kunt gebruiken.', appreciates: 'Samen maken, delen, experimenteren', dislikes: 'Wegwerpcultuur', links: '' },
    'Alex (voorbeeld)': { bio: 'Ik maak graag dingen en help af en toe iemand met een klus.', appreciates: 'Muziek, hout, schilderen', dislikes: 'Onnodig ingewikkeld doen', links: '' },
    'Mika (voorbeeld)': { bio: 'Ik ben benieuwd waarom iets ons raakt.', appreciates: 'Gesprekken, schilderkunst, muziek', dislikes: 'Smaak als wedstrijd', links: '' },
    'Voorbeeldbijdrage': { bio: 'Een fictief voorbeeldprofiel met persoonlijke observaties.', appreciates: 'Onverwachte verbindingen', dislikes: 'Dwingende aanbevelingen', links: '' }
  };

  $: currentPost = posts.find((p) => p.id === selectedPostId) ?? null;
  $: profileName = selectedPerson || screenName || 'Gast';
  $: shownProfile = selectedPerson
    ? fromLegacy(demoPeople[selectedPerson] ?? { bio: '', appreciates: '', dislikes: '', links: '' })
    : personalPlace;
  $: profilePosts = posts.filter((p) => p.author === profileName);
  $: profileNotes = connections.filter((c) => c.author === profileName);

  onMount(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        posts = Array.isArray(data.posts) ? data.posts : [...demoPosts];
        messages = Array.isArray(data.messages) ? data.messages : [...demoMessages];
        connections = Array.isArray(data.connections) ? data.connections : [...demoConnections];
        screenName = typeof data.screenName === 'string' ? data.screenName : 'Gast';
        if (data.myProfile && typeof data.myProfile === 'object') {
          myProfile = {
            bio: String(data.myProfile.bio || ''),
            appreciates: String(data.myProfile.appreciates || ''),
            dislikes: String(data.myProfile.dislikes || ''),
            links: String(data.myProfile.links || '')
          };
        }
        personalPlace = data.personalPlace ? cleanPlace(data.personalPlace) : fromLegacy(myProfile);
      }
    } catch {
      notice = 'De opgeslagen demo kon niet worden geladen.';
    }
    stored = true;
  });
  function persist() {
    if (!stored) return;
    try {
      localStorage.setItem(key, JSON.stringify({ posts, messages, connections, screenName, myProfile, personalPlace }));
    } catch {
      notice = 'Opslaan in deze browser lukt niet.';
    }
  }
  function openPerson(name: string) {
    selectedPerson = name === screenName ? null : name;
    editingProfile = false;
    tab = 'profiel';
  }
  function openCircle() {
    channel = 'algemeen';
    tab = 'kringen';
  }
  function addPost() {
    if (!postText.trim()) return;
    const post: Post = {
      id: crypto.randomUUID(), author: screenName.trim() || 'Gast', kind: postKind,
      text: postText.trim(), visibility: postVisibility, circle: 'Schildergroep', createdAt: Date.now()
    };
    posts = [post, ...posts];
    selectedPostId = post.id;
    postText = '';
    showComposer = false;
    persist();
  }
  function addMessage() {
    if (!messageText.trim()) return;
    messages = [...messages, { id: crypto.randomUUID(), author: screenName.trim() || 'Gast', channel, text: messageText.trim(), createdAt: Date.now() }];
    messageText = '';
    persist();
  }
  function removePost(id: string) {
    posts = posts.filter((p) => p.id !== id);
    if (selectedPostId === id) selectedPostId = posts[0]?.id ?? null;
    persist();
  }
  function reset() {
    if (!confirm('Je eigen demo-inhoud wissen en de voorbeelden herstellen?')) return;
    posts = [...demoPosts];
    messages = [...demoMessages];
    connections = [...demoConnections];
    myProfile = { bio: '', appreciates: '', dislikes: '', links: '' };
    personalPlace = emptyPlace();
    screenName = 'Gast';
    selectedPerson = null;
    selectedPostId = 'p1';
    showComposer = false;
    editingProfile = false;
    tab = 'kaart';
    notice = '';
    persist();
  }
  function links(raw: string): string[] {
    return raw.split(/\n|,/).map((s) => s.trim()).filter((s) => /^https:\/\/[^\s]+$/i.test(s)).slice(0, 5);
  }
  function when(timestamp: number) {
    return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' }).format(new Date(timestamp));
  }
</script>

<svelte:head>
  <title>krtkrt — Onder elkaar</title>
  <meta name="description" content="Een kleine plek voor oproepen, kringen en mensen in de buurt." />
</svelte:head>

<div class="app">
  <header class="masthead">
    <button class="wordmark" onclick={() => tab = 'kaart'} aria-label="krtkrt — naar de kaart">krtkrt<span class="dot">.</span></button>
    <nav aria-label="Hoofdnavigatie">
      <button class:active={tab === 'kaart'} aria-current={tab === 'kaart' ? 'page' : undefined} onclick={() => tab = 'kaart'}>Kaart</button>
      <button class:active={tab === 'kringen'} aria-current={tab === 'kringen' ? 'page' : undefined} onclick={openCircle}>Kringen</button>
      <button class:active={tab === 'profiel'} aria-current={tab === 'profiel' ? 'page' : undefined} onclick={() => openPerson(screenName)}>Mijn plek</button>
    </nav>
  </header>

  {#if tab === 'kaart'}
    <main class="map-layout">
      <section class="map-area" aria-label="Kaart van de buurt">
        <MapView {posts} selectedId={selectedPostId} onSelect={(id) => selectedPostId = id} />
        <div class="map-caption">Voorbeeldpunten op buurtniveau, geen woonadressen.</div>
      </section>
      <aside class="sidebar" aria-label="Oproepen">
        <div class="sidebar-head">
          <h1>In de buurt <span class="count">{posts.length}</span></h1>
          <button class="action-link" onclick={() => showComposer = !showComposer}>{showComposer ? 'Sluiten' : '+ Bijdrage'}</button>
        </div>
        {#if showComposer}
          <form class="compose" onsubmit={(event) => {event.preventDefault(); addPost();}}>
            <label for="post-kind">Soort bijdrage</label>
            <select id="post-kind" bind:value={postKind}>
              <option value="vraag">Vraag</option><option value="aanbod">Aanbod</option><option value="gedachte">Gedachte</option>
            </select>
            <label for="post-text">Bericht</label>
            <textarea id="post-text" bind:value={postText} rows="3" maxlength="600" required placeholder="Wat speelt er?"></textarea>
            <label for="post-visibility">Bereik</label>
            <select id="post-visibility" bind:value={postVisibility}><option value="kring">Schildergroep</option><option value="buurt">Buurt</option></select>
            <button class="solid-button" type="submit">Plaatsen</button>
          </form>
        {/if}
        <div class="post-list">
          {#each posts as post (post.id)}
            <article class:selected={selectedPostId === post.id} class="post">
              <button class="post-open" onclick={() => selectedPostId = post.id} aria-expanded={selectedPostId === post.id}>
                <span class="post-meta">{post.kind} · {post.visibility === 'kring' ? 'Schildergroep' : 'Buurt'} · {when(post.createdAt)}</span>
                <span class="post-text">{post.text}</span>
              </button>
              {#if selectedPostId === post.id}
                <div class="post-actions">
                  <button onclick={() => openPerson(post.author)}>{post.author}</button>
                  <button onclick={openCircle}>Schildergroep</button>
                  {#if !post.demo}<button onclick={() => removePost(post.id)}>Verwijder</button>{/if}
                </div>
              {/if}
            </article>
          {/each}
        </div>
      </aside>
    </main>
  {:else if tab === 'kringen'}
    <main class="content-view">
      <div class="section-title"><h1>Schildergroep</h1><span class="muted">Voorbeeldkring</span></div>
      <div class="conversation-layout">
        <nav class="channels" aria-label="Kanalen">
          <button class:active={channel === 'algemeen'} onclick={() => channel = 'algemeen'}># algemeen</button>
          <button class:active={channel === 'materiaal'} onclick={() => channel = 'materiaal'}># materiaal</button>
        </nav>
        <section class="conversation" aria-label="Gesprek">
          <div class="messages">
            {#each messages.filter((m) => m.channel === channel) as message (message.id)}
              <article class="message">
                <div class="message-line"><button class="author" onclick={() => openPerson(message.author)}>{message.author}</button><time>{when(message.createdAt)}</time></div>
                <p>{message.text}</p>
              </article>
            {/each}
          </div>
          <form class="send-message" onsubmit={(event) => {event.preventDefault(); addMessage();}}>
            <label for="message-text">Schrijf in #{channel}</label>
            <div class="send-row">
              <input id="message-text" bind:value={messageText} maxlength="500" required placeholder="Schrijf een bericht…"/>
              <button type="submit" class="solid-button">Verstuur</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  {:else}
    <main class="content-view profile-view">
      <div class="section-title">
        <h1>{selectedPerson ? 'Bij ' + profileName : 'Mijn plek'}</h1>
        {#if selectedPerson}
          <button class="action-link" onclick={() => openPerson(screenName)}>Terug naar mijn plek</button>
        {:else}
          <button class="action-link" onclick={() => editingProfile = !editingProfile}>{editingProfile ? 'Klaar' : 'Richt mijn plek in'}</button>
        {/if}
      </div>
      <PersonalPlaceView
        place={shownProfile}
        person={profileName}
        owner={!selectedPerson}
        editing={!selectedPerson && editingProfile}
        onChange={(next) => {personalPlace = next; persist();}}
        onNameChange={(next) => {screenName = next; persist();}}
      />
      <section class="contributions">
        <h2>Bijdragen</h2>
        {#if profilePosts.length === 0 && profileNotes.length === 0}<p class="muted">Nog geen bijdragen.</p>{/if}
        {#each profilePosts as post (post.id)}
          <div class="contribution"><span class="post-meta">{post.kind} · {when(post.createdAt)}</span><p>{post.text}</p><button class="action-link" onclick={() => {selectedPostId = post.id; tab = 'kaart';}}>Op de kaart</button></div>
        {/each}
        {#each profileNotes as note (note.id)}
          <div class="contribution"><span class="post-meta">Eerdere notitie</span><p>{note.reason}</p></div>
        {/each}
      </section>
    </main>
  {/if}

  {#if notice}<p class="notice" role="status">{notice}</p>{/if}
  <footer class="footer">
    <span><strong>Demo.</strong> Voorbeeldpersonen en lokale browsergegevens; niets wordt met anderen gedeeld.</span>
    <button onclick={reset}>Herstel voorbeelden</button>
  </footer>
</div>

<style>
  :global(*){box-sizing:border-box}
  :global(body){margin:0;background:#fafaf8;color:#242824;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5}
  :global(button),:global(input),:global(select),:global(textarea){font:inherit}
  :global(button){cursor:pointer}
  :global(button:focus-visible),:global(input:focus-visible),:global(select:focus-visible),:global(textarea:focus-visible),:global(a:focus-visible){outline:2px solid #366d59;outline-offset:3px}
  :global(a){color:inherit;text-decoration:underline;text-underline-offset:3px}
  .app{min-height:100vh;display:flex;flex-direction:column}
  .masthead{height:64px;padding:0 clamp(18px,3vw,46px);display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e4e0;background:#fafaf8;gap:20px}
  .wordmark{border:0;background:transparent;padding:0;font-size:25px;letter-spacing:-1.6px;font-weight:700;color:#202722;white-space:nowrap}
  .dot{color:#bd5834}
  .masthead nav{display:flex;align-items:center;gap:clamp(16px,2.6vw,32px);height:100%}
  .masthead nav button{height:100%;padding:2px 0 0;border:0;border-bottom:2px solid transparent;background:none;color:#666e66}
  .masthead nav button.active{color:#202722;border-bottom-color:#202722}
  h1,h2,p{margin-top:0}
  h1{font-weight:600;letter-spacing:-.4px;font-size:19px}
  h2{font-size:15px;font-weight:600}
  .muted,.post-meta,.count,time{color:#7b817a;font-size:12px;font-weight:400}
  .map-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,360px);flex:1;min-height:0}
  .map-area{position:relative;min-width:0;background:#e9eae5;display:flex;flex-direction:column}
  .map-caption{padding:9px 20px;font-size:11px;color:#646b62;background:#fafaf8;border-top:1px solid #e2e4e0}
  .sidebar{min-width:0;border-left:1px solid #e2e4e0;background:#fafaf8}
  .sidebar-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:22px 20px 17px;border-bottom:1px solid #e2e4e0}
  .sidebar-head h1{margin:0}
  .count{margin-left:4px}
  .action-link{background:none;border:0;padding:0;color:#315c48;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}
  .post{border-bottom:1px solid #e7e9e5;padding:0 20px}
  .post.selected{background:#f1f3ef}
  .post-open{display:block;width:100%;text-align:left;padding:18px 0;border:0;background:none;color:inherit}
  .post-meta{display:block;margin-bottom:6px}
  .post-text{display:block;font-size:14px;line-height:1.45;overflow-wrap:anywhere;white-space:pre-wrap}
  .post-actions{display:flex;flex-wrap:wrap;gap:14px;padding:0 0 16px}
  .post-actions button{padding:0;background:none;border:0;color:#315c48;text-decoration:underline;text-underline-offset:2px;font-size:12px}
  .compose,.profile-form{display:grid;gap:9px;padding:18px 20px;border-bottom:1px solid #e2e4e0}
  label{font-size:12px;color:#595f58}
  input,select,textarea{width:100%;padding:9px 10px;border:1px solid #cbd1c9;border-radius:2px;background:#fff;color:#242824;resize:vertical}
  .solid-button{justify-self:start;border:0;border-radius:2px;background:#263c31;color:white;padding:9px 15px}
  .content-view{width:min(980px,100%);margin:0 auto;padding:clamp(22px,4vw,52px) clamp(18px,3vw,36px);flex:1}
  .section-title{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #dfe3dd;padding-bottom:22px;margin-bottom:28px;gap:12px}
  .section-title h1{font-size:clamp(24px,3.5vw,34px);margin:0;font-weight:500}
  .conversation-layout{display:grid;grid-template-columns:190px minmax(0,1fr);gap:40px}
  .channels{display:flex;flex-direction:column;align-items:stretch;gap:5px}
  .channels button{padding:8px 10px;text-align:left;border:0;border-left:2px solid transparent;background:transparent;color:#687268}
  .channels button.active{color:#1f3327;border-left-color:#27382d;background:#f0f2ee}
  .message{padding:16px 0;border-bottom:1px solid #e5e7e3}
  .message:first-child{padding-top:0}
  .message-line{display:flex;align-items:baseline;gap:12px}
  .author{border:0;background:none;padding:0;font-weight:600;color:#263b2e}
  .message p{margin:4px 0 0;white-space:pre-wrap;overflow-wrap:anywhere}
  .send-message{margin-top:32px}
  .send-message label{display:block;margin-bottom:8px}
  .send-row{display:flex;gap:8px}
  .send-row input{min-width:0}
  .profile-view{max-width:800px}
  .profile-body{max-width:650px}
  .profile-bio{font-size:17px;line-height:1.65;white-space:pre-wrap}
  .profile-field{margin-top:25px}
  .profile-field h2{margin-bottom:5px;color:#515a51;font-size:13px}
  .profile-field p{white-space:pre-wrap;overflow-wrap:anywhere}
  .outbound{overflow-wrap:anywhere}
  .profile-form{padding:0 0 30px;border:0;max-width:620px}
  .contributions{margin-top:44px;border-top:1px solid #dfe3dd;padding-top:20px}
  .contributions>h2{font-size:17px;margin-bottom:15px}
  .contribution{padding:15px 0;border-bottom:1px solid #e6e8e4}
  .contribution p{margin:4px 0 8px;white-space:pre-wrap;overflow-wrap:anywhere}
  .notice{padding:8px 20px}
  .footer{padding:14px clamp(18px,3vw,46px);display:flex;justify-content:space-between;gap:16px;border-top:1px solid #e2e4e0;color:#767c75;font-size:11px}
  .footer strong{font-weight:600}
  .footer button{border:0;background:none;padding:0;text-decoration:underline;color:#555e55;font-size:11px}
  @media(max-width:760px){
    .masthead{height:58px}
    .masthead nav{gap:15px}
    .map-layout{display:flex;flex-direction:column}
    .map-area{min-height:0}
    .sidebar{border-left:0;border-top:1px solid #e2e4e0}
    .sidebar-head{padding:18px}
    .post{padding:0 18px}
    .conversation-layout{grid-template-columns:1fr;gap:24px}
    .channels{flex-direction:row;border-bottom:1px solid #e2e4e0}
    .channels button{border-left:0;border-bottom:2px solid transparent}
    .channels button.active{border-left:0;border-bottom-color:#27382d}
    .footer{flex-direction:column;gap:6px}
  }
  @media(max-width:400px){.masthead nav{gap:10px}.masthead nav button{font-size:12px}.wordmark{font-size:23px}}
</style>