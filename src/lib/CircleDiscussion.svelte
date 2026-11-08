<script lang="ts">
  import Avatar from './Avatar.svelte';
  import type { Post, Message, CircleReply } from './types';
  export let posts: Post[] = [];
  export let messages: Message[] = [];
  export let replies: CircleReply[] = [];
  export let circleName = '';
  export let filter = 'alles';
  export let screenName = 'Gast';
  export let ownAvatar = '';
  export let onReply: (parentId:string,text:string) => void = () => {};
  export let onStatus: (postId:string,state:'open'|'geregeld'|undefined) => void = () => {};
  export let onBranch: (parentId:string) => void = () => {};
  export let onDelete: (id:string) => void = () => {};
  export let onPerson: (name:string) => void = () => {};
  export let onOrigin: (id:string) => void = () => {};
  let replyTo: string | null = null;
  let draft = '';
  $: entries = [
    ...posts.map(post=>({id:'post-'+post.id,author:post.author,text:post.text,createdAt:post.createdAt,
      channel:'',label:post.kind,post:post as Post|null})),
    ...messages.map(message=>({id:'message-'+message.id,author:message.author,text:message.text,createdAt:message.createdAt,
      channel:message.channel,label:'gesprek',post:null as Post|null}))
  ].filter(item=>filter==='alles'||(item.channel && item.channel===filter))
    .sort((a,b)=>b.createdAt-a.createdAt||a.id.localeCompare(b.id));
  function sendReply(parentId:string) {
    if (!draft.trim()) return;
    onReply(parentId,draft.trim());
    draft='';
    replyTo=null;
  }
  function when(time:number) {
    return new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short'}).format(new Date(time));
  }
  function replyCount(parentId:string) {
    return replies.filter(reply=>reply.parentId===parentId).length;
  }
  function changeState(post:Post, raw:string) {
    onStatus(post.id,raw==='open'||raw==='geregeld'?raw:undefined);
  }
</script>

<section class="discussion" aria-label="Bijdragen en reacties in {circleName}">
  <div class="stream-heading">
    <h2>In de kring</h2>
    <span class="muted">{entries.length} {entries.length===1?'bijdrage':'bijdragen'}</span>
  </div>
  {#if entries.length===0}
    <p class="muted empty-feed">Hier is nog niets geplaatst. Je kunt hierboven iets beginnen.</p>
  {/if}
  {#each entries as item (item.id)}
    <article class="entry" id={"circle-"+item.id}>
      <Avatar name={item.author} image={item.author===screenName?ownAvatar:''}/>
      <div class="body">
        <div class="heading">
          <button class="author" onclick={() => onPerson(item.author)}>{item.author}</button>
          <span class="meta">{item.channel ? '# '+item.channel : item.label} · {when(item.createdAt)}</span>
        </div>
        <p class="entry-text">{item.text}</p>
        {#if item.post?.originId}
          <button class="origin" onclick={() => onOrigin(item.post!.originId!)}>Ontstaan uit een eerdere bijdrage · Bekijk oorsprong</button>
        {/if}
        {#if item.post && (item.post.kind==='vraag' || item.post.kind==='aanbod')}
          <div class="state-row">
            {#if item.post.state==='open'}
              <span class="state-tag">{item.post.kind==='vraag'?'Ik zoek nog':'Nog beschikbaar'}</span>
            {:else if item.post.state==='geregeld'}
              <span class="state-tag">Het is geregeld</span>
            {/if}
            {#if item.post.author===screenName}
              <label>Stand van zaken
                <select value={item.post.state||''} onchange={(event)=>changeState(item.post!,event.currentTarget.value)}>
                  <option value="">Geen aanduiding</option>
                  <option value="open">{item.post.kind==='vraag'?'Ik zoek nog':'Nog beschikbaar'}</option>
                  <option value="geregeld">Het is geregeld</option>
                </select>
              </label>
            {/if}
          </div>
        {/if}
        {#if replyCount(item.id)>0}
          <div class="replies">
            {#each replies.filter(reply=>reply.parentId===item.id).sort((a,b)=>a.createdAt-b.createdAt) as reply (reply.id)}
              <div class="reply">
                <Avatar name={reply.author} image={reply.author===screenName?ownAvatar:''}/>
                <div>
                  <button class="author" onclick={() => onPerson(reply.author)}>{reply.author}</button>
                  <span class="meta"> · {when(reply.createdAt)}</span>
                  <p>{reply.text}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
        <div class="actions">
          <button onclick={() => {replyTo=replyTo===item.id?null:item.id;draft='';}}>
            {replyTo===item.id?'Annuleren':replyCount(item.id)?'Reageren · '+replyCount(item.id):'Reageren'}
          </button>
          <button onclick={() => onBranch(item.id)}>Nieuw idee vanuit dit gesprek</button>
          {#if item.post && item.post.author===screenName && !item.post.demo}
            <button onclick={() => onDelete(item.post!.id)}>Verwijderen</button>
          {/if}
        </div>
        {#if replyTo===item.id}
          <form class="reply-form" onsubmit={(event)=>{event.preventDefault();sendReply(item.id);}}>
            <label for={'reply-'+item.id}>Reageer op {item.author}</label>
            <textarea id={'reply-'+item.id} rows="2" maxlength="600" required bind:value={draft} placeholder="Schrijf een reactie…"></textarea>
            <button type="submit" disabled={!draft.trim()}>Reageren</button>
          </form>
        {/if}
      </div>
    </article>
  {/each}
</section>

<style>
  .discussion{margin-top:30px}
  .stream-heading{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
  .stream-heading h2{font-size:19px;font-weight:600;margin:0 0 10px}
  .muted,.meta{color:#778177;font-size:12px}
  .entry{display:flex;gap:12px;align-items:flex-start;padding:20px 0;border-bottom:1px solid #e0e5df}
  .body{flex:1;min-width:0}
  .heading{display:flex;gap:8px 13px;align-items:baseline;flex-wrap:wrap}
  .author{background:transparent;border:0;padding:0;color:#2c4936;font-weight:600}
  .entry-text{margin:7px 0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:15px;line-height:1.6}
  .origin{background:none;border:0;padding:0;color:#4e7457;font-size:12px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
  .state-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:10px 0}
  .state-tag{background:#e8f0e7;color:#33573d;padding:3px 9px;font-size:12px;border-radius:3px}
  .state-row label{color:#536353;font-size:12px;display:flex;gap:7px;align-items:center}
  .state-row select{padding:5px;background:#fff;border:1px solid #d0d9d0}
  .replies{border-left:2px solid #dce6db;margin:14px 0 0;padding-left:13px}
  .reply{display:flex;align-items:flex-start;gap:9px;padding:9px 0}
  .reply p{font-size:13px;line-height:1.55;margin:5px 0 0;white-space:pre-wrap;overflow-wrap:anywhere}
  .actions{display:flex;gap:16px;flex-wrap:wrap;margin-top:11px}
  .actions button{border:0;padding:0;background:none;color:#39624a;text-decoration:underline;text-underline-offset:3px;font-size:12px}
  .reply-form{margin-top:14px;display:flex;align-items:flex-start;flex-direction:column;gap:7px}
  .reply-form label{font-size:12px;color:#56665a}
  .reply-form textarea{width:100%;padding:9px;border:1px solid #c9d4c9;font:inherit}
  .reply-form button{padding:8px 14px;background:#294434;color:#fff;border:0}
  .reply-form button:disabled{opacity:.5}
  .empty-feed{padding:24px 0}
</style>