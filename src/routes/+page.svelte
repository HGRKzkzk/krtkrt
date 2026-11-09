<script lang="ts">
  import { onMount, tick } from 'svelte';
  import MapView from '$lib/MapView.svelte';
  import CircleMap from '$lib/CircleMap.svelte';
  import CircleDiscussion from '$lib/CircleDiscussion.svelte';
  import { demoCircles, circleById } from '$lib/demoCircles';
  import type { CircleId } from '$lib/demoCircles';
  import PersonalPlaceView from '$lib/PersonalPlace.svelte';
  import Avatar from '$lib/Avatar.svelte';
  import { demoNeighbours, demoNeighbourPlace } from '$lib/demoNeighbours';
  import { emptyPlace, fromLegacy, cleanPlace } from '$lib/personalPlace';
  import type { PersonalPlace } from '$lib/personalPlace';
  import { demoPosts, demoMessages, demoConnections, demoReplies } from '$lib/demo';
  import type { Post, Message, Connection, Kind, CircleReply } from '$lib/types';

  type Tab = 'kaart' | 'kringen' | 'profiel';
  type Profile = { bio: string; appreciates: string; dislikes: string; links: string };
  let tab: Tab = 'kaart';
  let selectedPostId: string | null = 'p1';
  let selectedPerson: string | null = null;
  let posts: Post[] = [...demoPosts];
  let messages: Message[] = [...demoMessages];
  let replies: CircleReply[] = [...demoReplies];
  // Preserve historical notes written in older demo versions; no route editor.
  let connections: Connection[] = [...demoConnections];
  let myProfile: Profile = { bio: '', appreciates: '', dislikes: '', links: '' };
  let personalPlace: PersonalPlace = emptyPlace();
  let screenName = 'Gast';
  let channel = 'algemeen';
  let activeCircleId: CircleId | null = null;
  let showCircleMap = false;
  let circleFilter = 'alles';
  let circleDraftKind: Kind = 'gesprek';
  let startingFrom: string | null = null;
  let showComposer = false;
  let editingProfile = false;
  let postText = '';
  let postKind: Kind = 'vraag';
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
  $: activeCircle = activeCircleId ? circleById(activeCircleId) : null;
  $: circlePosts = activeCircle ? posts.filter((p) => p.circle === activeCircle.name || (activeCircle.id === 'schildergroep' && p.circle === 'Schildergroep')) : [];
  $: mapPosts = posts.filter((p) => p.visibility === 'buurt');
  $: circleFeed = activeCircle ? [
    ...circlePosts.map((post) => ({id:'post-'+post.id, kind:'post' as const, author:post.author, text:post.text, timestamp:post.createdAt, label:post.kind, channel:'', post})),
    ...messages.filter((message) => message.circle === activeCircle?.name || (activeCircle?.id === 'schildergroep' && !message.circle))
      .map((message) => ({id:'message-'+message.id, kind:'message' as const, author:message.author, text:message.text, timestamp:message.createdAt, label:'gesprek', channel:message.channel, message}))
  ].filter((entry) => circleFilter === 'alles' || (entry.kind === 'message' && entry.channel === circleFilter))
    .sort((a,b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id)) : [];
  $: profileName = selectedPerson || screenName || 'Gast';
  $: shownProfile = selectedPerson
    ? (demoNeighbours.find((person) => person.name === selectedPerson)
      ? demoNeighbourPlace(demoNeighbours.find((person) => person.name === selectedPerson)!)
      : fromLegacy(demoPeople[selectedPerson] ?? { bio: '', appreciates: '', dislikes: '', links: '' }))
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
        replies = Array.isArray(data.replies) ? data.replies : [...demoReplies];
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
      localStorage.setItem(key, JSON.stringify({ posts, messages, replies, connections, screenName, myProfile, personalPlace }));
    } catch {
      notice = 'Opslaan in deze browser lukt niet.';
    }
  }
  function openPerson(name: string) {
    selectedPerson = name === screenName ? null : name;
    editingProfile = false;
    tab = 'profiel';
  }
  function openCircle(id: CircleId = 'schildergroep') {
    activeCircleId = id;
    channel = 'algemeen';
    circleFilter = 'alles';
    circleDraftKind = 'gesprek';
    messageText = '';
    startingFrom = null;
    showCircleMap = false;
    showComposer = false;
    tab = 'kringen';
  }
  function circlesOverview() {
    activeCircleId = null;
    startingFrom = null;
    circleFilter = 'alles';
    showCircleMap = false;
    showComposer = false;
    tab = 'kringen';
  }
  function openPostCircle(circleName: string) {
    const circle = demoCircles.find((item) => item.name === circleName || (item.id === 'schildergroep' && circleName === 'Schildergroep'));
    if (circle) openCircle(circle.id);
    else circlesOverview();
  }
  function addPost() {
    if (!postText.trim()) return;
    const inCircle = tab === 'kringen' && activeCircle;
    const post: Post = {
      id: crypto.randomUUID(), author: screenName.trim() || 'Gast', kind: postKind,
      text: postText.trim(), visibility: inCircle ? 'kring' : 'buurt',
      circle: inCircle ? activeCircle.name : '', createdAt: Date.now()
    };
    posts = [post, ...posts];
    selectedPostId = post.id;
    postText = '';
    showComposer = false;
    persist();
  }
  function addMessage() {
    if (!messageText.trim()) return;
    if (!activeCircle) return;
    messages = [...messages, { id: crypto.randomUUID(), author: screenName.trim() || 'Gast', channel, circle:activeCircle.name, text: messageText.trim(), createdAt: Date.now() }];
    messageText = '';
    persist();
  }
  function publishCircleEntry() {
    if (!activeCircle || !messageText.trim()) return;
    const post: Post = {
      id:crypto.randomUUID(), author:screenName.trim() || 'Gast', kind:circleDraftKind,
      text:messageText.trim(), visibility:'kring', circle:activeCircle.name,
      createdAt:Date.now(), ...(startingFrom ? {originId:startingFrom} : {})
    };
    posts = [post,...posts];
    messageText = '';
    startingFrom = null;
    circleDraftKind = 'gesprek';
    circleFilter = 'alles';
    persist();
  }
  function addCircleReply(parentId:string,text:string) {
    if (!activeCircle || !text.trim() || !circleFeed.some((entry)=>entry.id===parentId)) return;
    replies = [...replies, {id:crypto.randomUUID(),parentId,author:screenName.trim()||'Gast',text:text.trim(),createdAt:Date.now()}];
    persist();
  }
  function setCircleState(postId:string,state:'open'|'geregeld'|undefined) {
    posts = posts.map(post=>post.id===postId && post.author===screenName && (post.kind==='vraag'||post.kind==='aanbod')
      ? {...post,state} : post);
    persist();
  }
  function startFrom(parentId:string) {
    startingFrom=parentId;
    messageText='';
    circleDraftKind='gesprek';
    circleFilter='alles';
    document.getElementById('circle-entry')?.focus();
  }
  async function goToOrigin(parentId:string) {
    circleFilter='alles';
    await tick();
    document.getElementById('circle-'+parentId)?.scrollIntoView({behavior:'smooth',block:'center'});
  }
  function deleteCirclePost(id:string) {
    const match=posts.find(post=>post.id===id);
    if (!match || match.demo || match.author!==screenName) return;
    posts=posts.filter(post=>post.id!==id);
    replies=replies.filter(reply=>reply.parentId!=='post-'+id);
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
    replies = [...demoReplies];
    connections = [...demoConnections];
    myProfile = { bio: '', appreciates: '', dislikes: '', links: '' };
    personalPlace = emptyPlace();
    screenName = 'Gast';
    selectedPerson = null;
    selectedPostId = 'p1';
    showComposer = false;
    startingFrom = null;
    editingProfile = false;
    tab = 'kaart';
    activeCircleId = null;
    showCircleMap = false;
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
      <button class:active={tab === 'kringen'} aria-current={tab === 'kringen' ? 'page' : undefined} onclick={circlesOverview}>Kringen</button>
      <button class:active={tab === 'profiel'} aria-current={tab === 'profiel' ? 'page' : undefined} onclick={() => openPerson(screenName)}>Mijn plek</button>
    </nav>
  </header>

  {#if tab === 'kaart'}
    <main class="map-layout">
      <section class="map-area" aria-label="Kaart van de buurt">
        <MapView posts={mapPosts} selectedId={selectedPostId} onSelect={(id) => selectedPostId = id}
          ownArea={personalPlace.areaVisible ? personalPlace.mapArea : null}
          ownName={screenName}
          ownAvatar={personalPlace.avatar || ''}
          neighbours={demoNeighbours}
          onPerson={openPerson}
          onOwnProfile={() => {selectedPerson = null; tab = 'profiel'; editingProfile = false;}} />
        <div class="map-caption">Fictieve proefpersonen in postcodegebied 5041. De kaart toont aantallen per postcodegebied, geen woonadressen.</div>
      </section>
      <aside class="sidebar" aria-label="Oproepen">
        <div class="sidebar-head">
          <h1>In de buurt <span class="count">{mapPosts.length}</span></h1>
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
            <small>Deze bijdrage wordt in de buurt-demo getoond. Voor een bijdrage aan een kring ga je naar die kring.</small>
            <button class="solid-button" type="submit">Plaatsen</button>
          </form>
        {/if}
        <div class="post-list">
          {#each mapPosts as post (post.id)}
            <article class:selected={selectedPostId === post.id} class="post">
              <button class="post-open" onclick={() => selectedPostId = post.id} aria-expanded={selectedPostId === post.id}>
                <span class="post-meta">{post.kind} · {post.visibility === 'kring' ? 'Schildergroep' : 'Buurt'} · {when(post.createdAt)}</span>
                <span class="post-text">{post.text}</span>
              </button>
              {#if selectedPostId === post.id}
                <div class="post-actions">
                  <button class="author-with-avatar" onclick={() => openPerson(post.author)}><Avatar name={post.author} image={post.author === screenName ? (personalPlace.avatar || '') : ''}/>{post.author}</button>
                  <button onclick={() => openPostCircle(post.circle)}>{post.circle || 'Kring'}</button>
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
      {#if !activeCircle}
        <div class="section-title"><h1>Mijn kringen</h1><span class="muted">Drie fictieve verbanden</span></div>
        <p class="circle-lead">Een kring is een verband tussen mensen. Ze kan een vaste ontmoetingsplek hebben, verschillende activiteitlocaties, of helemaal geen locatie.</p>
        <div class="circle-list">
          {#each demoCircles as circle (circle.id)}
            <button class="circle-choice" onclick={() => openCircle(circle.id)}>
              <span class="circle-symbol" aria-hidden="true">{circle.id === 'schildergroep' ? '◒' : circle.id === 'band-a' ? '♪' : '♫'}</span>
              <span class="circle-description"><strong>{circle.name}</strong><span>{circle.summary}</span><small>{circle.places.length === 0 ? 'Geen kaartlocatie' : circle.places.length === 1 ? 'Eén voorbeeldlocatie' : circle.places.length + ' voorbeeldlocaties'}</small></span>
              <span aria-hidden="true">→</span>
            </button>
          {/each}
        </div>
        <p class="circle-note">In deze demo hoor je bij alle drie de kringen om het concept te onderzoeken. Dit is geen echt lidmaatschap of toegangssysteem.</p>
      {:else}
        <div class="circle-breadcrumb"><button class="action-link" onclick={circlesOverview}>← Mijn kringen</button><span aria-hidden="true">/</span><span>{activeCircle.name}</span></div>
        <div class="section-title">
          <h1>{activeCircle.name}</h1>
          <span class="muted">Fictieve kring</span>
        </div>
        <p class="circle-lead">{activeCircle.description}</p>
        <div class="circle-navigation" aria-label="Kring verkennen">
          <button class:chosen={!showCircleMap} onclick={() => showCircleMap = false}>In de kring</button>
          <button class:chosen={showCircleMap} onclick={() => showCircleMap = true}>Plekken en activiteiten{activeCircle.places.length ? ' · ' + activeCircle.places.length : ''}</button>
        </div>
        {#if showCircleMap}
          <section aria-label="Geografische context van deze kring">
            {#if activeCircle.places.length}
              <CircleMap places={activeCircle.places}/>
              <div class="activity-list">
                <h2>Activiteiten op de kaart</h2>
                {#each activeCircle.places as place (place.id)}
                  <div class="activity"><strong>{place.title}</strong><p>{place.description}</p></div>
                {/each}
              </div>
            {:else}
              <div class="no-map-place">
                <h2>Deze kring heeft geen kaartlocatie</h2>
                <p>De band bestaat ook zonder vaste plek. Er zijn geen locaties of activiteiten opgegeven; we tekenen geen kunstmatige positie en tonen geen locaties van leden.</p>
                <button class="action-link" onclick={() => showCircleMap = false}>Terug naar de kring</button>
              </div>
            {/if}
          </section>
        {:else}
          <div class="circle-flow">
            <section class="circle-editor" aria-label="Iets delen met deze kring">
              <div class="circle-editor-identity">
                <Avatar name={screenName} image={personalPlace.avatar || ''} size="medium"/>
                <div><strong>{screenName || 'Gast'}</strong><span>Wat wil je met deze kring delen?</span></div>
              </div>
              <form onsubmit={(event) => {event.preventDefault(); publishCircleEntry();}}>
                {#if startingFrom}
                  <div class="origin-note">Nieuwe bijdrage vanuit een eerder gesprek
                    <button type="button" onclick={() => startingFrom=null} aria-label="Verwijder verwijzing">×</button>
                  </div>
                {/if}
                <label class="visually-hidden" for="circle-entry">Schrijf iets voor deze kring</label>
                <textarea id="circle-entry" bind:value={messageText} rows="3" maxlength="600" required
                  placeholder="Waar wil je het over hebben, wat wil je vragen of delen?"></textarea>
                <div class="circle-editor-bottom">
                  <details class="entry-options">
                    <summary>{circleDraftKind === 'gesprek' ? 'Eventueel aanduiden' : circleDraftKind === 'vraag' ? 'Vraag · aanpassen' : circleDraftKind === 'aanbod' ? 'Aanbod · aanpassen' : 'Gedachte · aanpassen'}</summary>
                    <label for="circle-kind">Als een aanduiding helpt</label>
                    <select id="circle-kind" bind:value={circleDraftKind}>
                      <option value="gesprek">Geen aanduiding</option>
                      <option value="vraag">Vraag</option>
                      <option value="aanbod">Aanbod</option>
                      <option value="gedachte">Gedachte</option>
                    </select>
                  </details>
                  <button type="submit" class="solid-button" disabled={!messageText.trim()}>Delen</button>
                </div>
                <p class="circle-draft-note">Alleen in deze fictieve kringweergave; er zijn nog geen echte toegangsrechten.</p>
              </form>
            </section>

            <section class="circle-stream" aria-label="Wat er in deze kring gebeurt">
              <CircleDiscussion
                posts={circlePosts}
                messages={messages.filter((m) => m.circle === activeCircle?.name || (activeCircle?.id === 'schildergroep' && !m.circle))}
                {replies} filter="alles"
                circleName={activeCircle.name} {screenName} ownAvatar={personalPlace.avatar || ''}
                onReply={addCircleReply} onStatus={setCircleState} onBranch={startFrom}
                onDelete={deleteCirclePost} onPerson={openPerson} onOrigin={goToOrigin}
              />
            </section>
          </div>
          <section class="circle-members">
            <h2>Bij deze kring (voorbeeld)</h2>
            <p class="muted">Lidmaatschap zegt niets over de woonplek van deze mensen.</p>
            <div class="member-list">
              {#each activeCircle.memberNames as member}
                <button onclick={() => openPerson(member === 'Gast' ? screenName : member)}><Avatar name={member === 'Gast' ? screenName : member} image={member === 'Gast' ? (personalPlace.avatar || '') : ''}/><span>{member === 'Gast' ? screenName : member}</span></button>
              {/each}
            </div>
          </section>
        {/if}
      {/if}
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
      {#if !selectedPerson}
        <section class="my-circle-links" aria-label="Mijn kringen">
          <h2>Mijn kringen (voorbeeld)</h2>
          <div class="my-circle-buttons">
            {#each demoCircles as circle}
              <button onclick={() => openCircle(circle.id)}>{circle.name} <span aria-hidden="true">→</span></button>
            {/each}
          </div>
        </section>
      {/if}
      <section class="contributions">
        <h2>Bijdragen</h2>
        {#if profilePosts.length === 0 && profileNotes.length === 0}<p class="muted">Nog geen bijdragen.</p>{/if}
        {#each profilePosts as post (post.id)}
          <div class="contribution"><div class="contribution-author"><Avatar name={profileName} image={selectedPerson ? shownProfile.avatar || '' : personalPlace.avatar || ''}/><span class="post-meta">{post.kind} · {when(post.createdAt)}</span></div><p>{post.text}</p><button class="action-link" onclick={() => {selectedPostId = post.id; tab = 'kaart';}}>Op de kaart</button></div>
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
  .origin-note{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#e9efe9;padding:8px 11px;margin-bottom:10px;font-size:12px;color:#3d5845}
  .origin-note button{border:0;background:none;color:inherit;font-size:20px}
  .circle-flow{max-width:760px}
  .circle-editor{padding:18px 20px 15px;border:1px solid #dce2db;background:#f6f8f4;margin:14px 0 38px}
  .circle-editor-identity{display:flex;align-items:center;gap:12px;margin-bottom:12px}
  .circle-editor-identity div{display:flex;flex-direction:column;gap:2px}
  .circle-editor-identity strong{font-weight:600}
  .circle-editor-identity span{font-size:12px;color:#68746a}
  .circle-editor textarea{width:100%;min-height:96px;background:#fff;resize:vertical;border:1px solid #c8d4c8}
  .circle-editor-bottom{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:10px}
  .entry-options{color:#566d59;font-size:12px}
  .entry-options summary{cursor:pointer;text-decoration:underline;text-underline-offset:3px;padding:6px 0;list-style-position:inside}
  .entry-options label{display:block;margin-top:8px}
  .entry-options select{margin-top:5px;max-width:240px}
  .stream-filters button{background:transparent;border:1px solid transparent;border-radius:3px;padding:5px 9px;color:#536555}
  .stream-filters button.selected{background:#e4ebe2;color:#274732;border-color:#cbdacb}
  .circle-editor-bottom .solid-button:disabled{opacity:.5;cursor:default}
  .channel-choice{display:flex;align-items:center;gap:12px;max-width:340px;margin-top:12px}
  .channel-choice select{width:auto;flex:1}
  .circle-draft-note{font-size:11px;color:#788077;margin:12px 0 0}
  .stream-heading{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
  .stream-heading h2{font-size:19px}
  .stream-filters{display:flex;flex-wrap:wrap;gap:5px;border-bottom:1px solid #dfe4dd;padding-bottom:12px;margin-bottom:2px}
  .feed-entry{display:flex;align-items:flex-start;gap:12px;padding:19px 0;border-bottom:1px solid #e1e6df}
  .feed-avatar{flex:none}
  .feed-body{min-width:0;flex:1}
  .feed-heading{display:flex;align-items:baseline;gap:8px 13px;flex-wrap:wrap}
  .feed-heading .author{font-size:14px}
  .feed-detail{font-size:11px;color:#788078}
  .feed-body p{font-size:15px;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0 0}
  .feed-remove{border:0;background:none;color:#657768;padding:6px 0 0;font-size:12px;text-decoration:underline}
  .empty-feed{padding:24px 0}
  .visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  @media(max-width:600px){.circle-editor{padding:14px}.circle-editor-bottom{align-items:flex-start}.entry-types{width:100%}}
  .circle-lead{font-size:15px;max-width:750px;color:#4c594f;line-height:1.7}
  .circle-list{display:flex;flex-direction:column;border-top:1px solid #dfe3dd;margin:22px 0}
  .circle-choice{width:100%;display:flex;align-items:center;gap:19px;text-align:left;background:transparent;border:0;border-bottom:1px solid #dfe3dd;padding:21px 4px;color:#263a2c}
  .circle-choice:hover,.circle-choice:focus-visible{background:#f0f3ee}
  .circle-symbol{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border:1px solid #cad6ce;border-radius:5px;font-size:25px;background:#ecf1ec;flex-shrink:0}
  .circle-description{display:flex;flex:1;min-width:0;flex-direction:column;gap:3px}
  .circle-description strong{font-size:17px;font-weight:600}
  .circle-description span{font-size:13px;color:#57665a}
  .circle-description small{font-size:11px;color:#737e72}
  .circle-note{color:#757d75;font-size:12px;max-width:640px}
  .circle-breadcrumb{display:flex;align-items:center;gap:11px;margin-bottom:20px;font-size:13px;color:#7a837a}
  .circle-navigation{display:flex;flex-wrap:wrap;gap:12px;border-bottom:1px solid #dce3dc;margin:24px 0}
  .circle-navigation button{background:transparent;border:0;border-bottom:2px solid transparent;color:#536357;padding:10px 2px}
  .circle-navigation button.chosen{color:#263d2d;border-bottom-color:#263d2d;font-weight:600}
  .circle-posts{margin:25px 0 35px;max-width:720px}
  .circle-post-head{display:flex;align-items:center;justify-content:space-between;gap:20px}
  .circle-post-head h2{margin:0}
  .circle-compose{display:grid;gap:8px;padding:18px 0}
  .circle-post{border-bottom:1px solid #e1e6df;padding:12px 0}
  .circle-post p{margin:4px 0 7px}
  .circle-post .author{font-size:12px}
  .circle-members,.my-circle-links{border-top:1px solid #dee3dc;margin-top:35px;padding-top:20px}
  .member-list,.my-circle-buttons{display:flex;flex-wrap:wrap;gap:10px}
  .member-list button{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #d9e1d8;padding:7px 11px;color:#344f3c}
  .my-circle-buttons button{display:flex;gap:14px;align-items:center;background:#f7f9f6;border:1px solid #d9e1d8;padding:10px 14px;color:#344f3c}
  .activity-list{padding-top:22px}
  .activity{padding:12px 0;border-bottom:1px solid #e2e6df}
  .activity p{font-size:13px;color:#59665a;margin:4px 0}
  .no-map-place{padding:30px;border:1px solid #dce3da;background:#f3f6f1}
  .no-map-place p{max-width:650px}
  .author-with-avatar{display:inline-flex;gap:7px;align-items:center}
  .contribution-author{display:flex;align-items:center;gap:10px}
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