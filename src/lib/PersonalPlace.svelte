<script lang="ts">
  import type { PersonalPlace, ProfileBlock, ProfileLink, Theme, Typeface, ContactMode, BlockKind } from '$lib/personalPlace';
  import { blankBlock, validExternalUrl, linkSite } from '$lib/personalPlace';
  import AreaPicker from '$lib/AreaPicker.svelte';

  export let place: PersonalPlace;
  export let person: string;
  export let owner = false;
  export let editing = false;
  export let onChange: (next: PersonalPlace) => void = () => {};
  export let onNameChange: (name: string) => void = () => {};
  let imageError = '';

  function change(part: Partial<PersonalPlace>) { onChange({ ...place, ...part }); }
  function updateBlock(id: string, partial: Partial<ProfileBlock>) {
    change({ blocks: place.blocks.map((block) => block.id === id ? { ...block, ...partial } : block) });
  }
  function addBlock(kind: BlockKind) { change({ blocks: [...place.blocks, blankBlock(kind)] }); }
  function move(id: string, direction: number) {
    const list = [...place.blocks];
    const from = list.findIndex((block) => block.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= list.length) return;
    [list[from], list[to]] = [list[to], list[from]];
    change({ blocks: list });
  }
  function removeBlock(id: string) { change({ blocks: place.blocks.filter((b) => b.id !== id) }); }
  function updateLink(block: ProfileBlock, id: string, partial: Partial<ProfileLink>) {
    updateBlock(block.id, { links: block.links.map((l) => l.id === id ? { ...l, ...partial } : l) });
  }
  function addLink(block: ProfileBlock) {
    updateBlock(block.id, { links: [...block.links, { id: crypto.randomUUID(), label: '', url: '', description: '' }] });
  }
  async function uploadImage(block: ProfileBlock, event: Event) {
    imageError = '';
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 300_000) {
      imageError = 'Gebruik een PNG, JPG of WebP van maximaal 300 kB voor deze lokale demo.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(result)) updateBlock(block.id, { image: result });
    };
    reader.onerror = () => { imageError = 'De afbeelding kon niet worden gelezen.'; };
    reader.readAsDataURL(file);
  }
</script>

<div class="personal-place">
  <section class:ink={place.theme === 'ink'} class:colour={place.theme === 'kleur'} class:serif={place.typeface === 'serif'} class:mono={place.typeface === 'mono'} class="canvas">
    <header class="canvas-head">
      <h2>Hoera! {person || 'Iemand'} bestaat.</h2>
      {#if place.areaVisible && place.mapArea}<span class="location">Postcodegebied {place.mapArea.pc4}</span>{/if}
      {#if place.areaVisible && place.area.trim()}<span class="location">{place.area}</span>{/if}
    </header>
    {@const intro = place.blocks.find((block) => block.kind === 'text' && block.text.trim())}
    {#if intro}<div class="introduction">{intro.text}</div>{/if}
    {@const stories = place.blocks.filter((block) => block.kind !== 'links' && block.id !== intro?.id && ((block.kind === 'text' && block.text.trim()) || (block.kind === 'image' && block.image)))}
    {#if stories.length}
      <section class="stories">
        <h3>Wat ik verder zoal doe</h3>
        {#each stories as item (item.id)}
          {#if item.kind === 'text'}<p class="authored-text">{item.text}</p>
          {:else}<figure><img src={item.image} alt={item.alt || 'Afbeelding op de persoonlijke plek'} />{#if item.text.trim()}<figcaption>{item.text}</figcaption>{/if}</figure>{/if}
        {/each}
      </section>
    {/if}
    {@const allLinks = place.blocks.filter((block) => block.kind === 'links').flatMap((block) => block.links.filter((link) => validExternalUrl(link.url)))}
    {#if allLinks.length}
      <section class="elsewhere">
        <h3>Verder kijken</h3>
        <div class="outbound-links">
          {#each allLinks as link (link.id)}
            <div class="outbound-link">
              <a href={link.url} target="_blank" rel="noopener noreferrer" class="social-link">
                    <span class="platform-symbol" aria-hidden="true">
                      {#if linkSite(link.url).icon === 'instagram'}
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                      {:else if linkSite(link.url).icon === 'youtube'}
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none"/></svg>
                      {:else if linkSite(link.url).icon === 'bandcamp'}
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5h14L16 19H2Z"/></svg>
                      {:else if linkSite(link.url).icon === 'facebook'}
                        <span class="platform-letter">f</span>
                      {:else if linkSite(link.url).icon === 'spotify'}
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M5 10q8-3 14 1M6 13q7-2 12 1M7 16q6-1 10 1"/></svg>
                      {:else}
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18"/></svg>
                      {/if}
                    </span>
                    {linkSite(link.url).recognized ? linkSite(link.url).name : link.label || linkSite(link.url).name}
                  </a>
              {#if link.description}<span>{link.description}</span>{/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}
    {#if !intro && !stories.length && !allLinks.length}<p class="empty">{owner ? 'Dit is jouw plek. Je kunt iets vertellen, maar dat hoeft niet.' : 'Op deze plek is nog niets geschreven.'}</p>{/if}
    {#if place.contactMode !== 'none' && place.contactNote.trim()}
      <section class="contact"><h3>{place.contactMode === 'elsewhere' ? 'Zeg elders hallo' : 'Zeg gerust hallo'}</h3><p>{place.contactNote}</p></section>
    {/if}
  </section>

  {#if owner && editing}
    <div class="studio" aria-label="Richt mijn plek in">
      <div class="studio-header"><h3>Vertel iets over jezelf</h3><p>De pagina heeft een vaste opbouw. Jij bepaalt de inhoud en hoeveel je laat zien.</p></div>
      <div class="settings">
        <div class="setting"><label for="person-name">Naam</label><input id="person-name" maxlength="40" value={person} oninput={(e) => onNameChange(e.currentTarget.value)} /></div>
        <div class="setting"><label for="profile-theme">Achtergrond</label><select id="profile-theme" value={place.theme} onchange={(e) => change({ theme: e.currentTarget.value as Theme })}><option value="papier">Papier</option><option value="ink">Donker</option><option value="kleur">Warm</option></select></div>
        <div class="setting"><label for="profile-font">Letters</label><select id="profile-font" value={place.typeface} onchange={(e) => change({ typeface: e.currentTarget.value as Typeface })}><option value="sans">Eenvoudig</option><option value="serif">Boekachtig</option><option value="mono">Typemachine</option></select></div>
      </div>
      <div class="setting area-setting">
        <label for="profile-area">Buurt, wijk of stad (mag leeg)</label>
        <input id="profile-area" maxlength="80" value={place.area} placeholder="Bijvoorbeeld: Korvel, Tilburg" oninput={(e) => change({ area: e.currentTarget.value })}/>
        <label class="check"><input type="checkbox" checked={place.areaVisible} onchange={(e) => change({ areaVisible: e.currentTarget.checked })}/> Toon deze aanduiding op mijn plek</label>
        <small>Dit is wat je zelf wilt delen, niet je woonadres. Er wordt nooit een exact adres opgeslagen.</small>
        <label>Mijn postcodegebied (optioneel)</label>
        <AreaPicker area={place.mapArea} onChange={(mapArea) => change({ mapArea })}/>
        <small>Bij zichtbaarheid verschijnt dit postcodegebied als vlak op de kaart, niet als woonpunt.</small>
      </div>

      <div class="pieces-editor">
        <h4>Verhalen, beelden en vindplaatsen</h4>
        {#each place.blocks as block, i (block.id)}
          <div class="block-editor">
            <div class="block-top"><strong>{block.kind === 'text' ? 'Tekst' : block.kind === 'image' ? 'Afbeelding' : 'Links'}</strong>
              <div class="block-controls">
                <button disabled={i === 0} onclick={() => move(block.id, -1)} aria-label="Verplaats onderdeel omhoog">↑</button>
                <button disabled={i === place.blocks.length - 1} onclick={() => move(block.id, 1)} aria-label="Verplaats onderdeel omlaag">↓</button>
                <button onclick={() => removeBlock(block.id)} aria-label="Verwijder onderdeel">Verwijder</button>
              </div>
            </div>
            {#if block.kind === 'text'}
              <label for={'body-'+block.id}>Jouw tekst</label>
              <textarea id={'body-'+block.id} rows="5" maxlength="2500" value={block.text} placeholder="Een verhaal, gedachte, grap of iets anders…" oninput={(e) => updateBlock(block.id, { text: e.currentTarget.value })}></textarea>
            {:else if block.kind === 'image'}
              <label for={'photo-'+block.id}>Kies een afbeelding van je apparaat</label>
              <input id={'photo-'+block.id} type="file" accept="image/png,image/jpeg,image/webp" onchange={(e) => uploadImage(block, e)} />
              {#if imageError}<p class="error" role="alert">{imageError}</p>{/if}
              <small>Maximaal 300 kB; uitsluitend lokaal in deze browser opgeslagen.</small>
              <label for={'alt-'+block.id}>Beschrijving van de afbeelding</label>
              <input id={'alt-'+block.id} maxlength="180" value={block.alt} oninput={(e) => updateBlock(block.id, { alt: e.currentTarget.value })}/>
              <label for={'caption-'+block.id}>Bijschrift (optioneel)</label>
              <input id={'caption-'+block.id} maxlength="240" value={block.text} oninput={(e) => updateBlock(block.id, { text: e.currentTarget.value })}/>
            {:else}
              {#each block.links as link (link.id)}
                <div class="link-editor">
                  <label for={'link-url-'+link.id}>Link naar sociaal profiel of website (https://)</label><input id={'link-url-'+link.id} maxlength="600" placeholder="https://…" value={link.url} oninput={(e) => updateLink(block, link.id, { url: e.currentTarget.value })}/>
                  {#if link.url && !validExternalUrl(link.url)}<small class="error">Vul een geldig https-adres in.</small>{/if}
                  {#if validExternalUrl(link.url)}
                    <small>Wordt getoond als: <strong>{linkSite(link.url).name}</strong>{linkSite(link.url).recognized ? ' (automatisch met icoon)' : ''}</small>
                  {/if}
                  {#if validExternalUrl(link.url) && !linkSite(link.url).recognized}
                    <label for={'link-label-'+link.id}>Andere naam voor deze website (optioneel)</label>
                    <input id={'link-label-'+link.id} maxlength="100" placeholder="Mijn blog, mijn band…" value={link.label} oninput={(e) => updateLink(block, link.id, { label: e.currentTarget.value })}/>
                  {/if}
                  <label for={'link-description-'+link.id}>Wat is daar te vinden? (optioneel)</label><input id={'link-description-'+link.id} maxlength="240" placeholder="Daar ben ik vooral actief…" value={link.description} oninput={(e) => updateLink(block, link.id, { description: e.currentTarget.value })}/>
                  <button class="quiet" onclick={() => updateBlock(block.id, { links: block.links.filter((x) => x.id !== link.id) })}>Link weghalen</button>
                </div>
              {/each}
              <button class="quiet" disabled={block.links.length >= 10} onclick={() => addLink(block)}>+ Link toevoegen</button>
            {/if}
          </div>
        {/each}
        <div class="add-block">
          <button onclick={() => addBlock('text')}>+ Tekst</button>
          <button onclick={() => addBlock('image')}>+ Afbeelding</button>
          <button onclick={() => addBlock('links')}>+ Links</button>
        </div>
      </div>
      <div class="contact-settings">
        <label for="contact-mode">Hoe wil je benaderd worden?</label>
        <select id="contact-mode" value={place.contactMode} onchange={(e) => change({ contactMode: e.currentTarget.value as ContactMode })}>
          <option value="none">Liever geen direct contact via mijn profiel</option>
          <option value="elsewhere">Liever ergens anders</option>
          <option value="in-person">Spreek me liever in het echt aan</option>
        </select>
        {#if place.contactMode !== 'none'}
          <label for="contact-note">Vertel hoe (optioneel)</label>
          <textarea id="contact-note" maxlength="280" rows="2" placeholder={place.contactMode === 'elsewhere' ? 'Je vindt mij vooral op Instagram…' : 'Spreek me gerust aan bij de schilderles.'} value={place.contactNote} oninput={(e) => change({ contactNote: e.currentTarget.value })}></textarea>
        {/if}
        <small>Geen interne berichtplicht en geen automatische deelknop voor je woonadres.</small>
      </div>
    </div>
  {/if}
</div>

<style>
  .canvas{background:#f1eee6;color:#242923;min-height:280px;padding:clamp(22px,5vw,48px);border:1px solid #deded7;transition:background .15s,color .15s}
  .canvas.ink{background:#222729;color:#eee9de;border-color:#222729}
  .canvas.colour{background:#f3d9bc;color:#4b3028;border-color:#e0c5a9}
  .canvas.serif{font-family:Georgia,'Times New Roman',serif}
  .canvas.mono{font-family:'Courier New',monospace}
  .canvas-head{display:flex;flex-direction:column;align-items:flex-start;gap:5px;margin-bottom:28px}
  .canvas h2{font-family:inherit;font-size:clamp(27px,4vw,43px);letter-spacing:-.8px;line-height:1.13;font-weight:600;margin:0}
  .location{font-size:13px;opacity:.75}
  .introduction{font-size:clamp(17px,2.2vw,20px);line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere;max-width:690px;margin:0 0 28px}
  .stories,.elsewhere,.contact{max-width:690px;margin-top:36px}
  .stories h3,.elsewhere h3,.contact h3{font-family:inherit;font-size:20px;margin:0 0 17px;font-weight:600}
  .stories .authored-text{margin:0 0 17px}
  .stories figure{margin:20px 0 26px}
  .elsewhere{padding-top:8px}
  .piece{max-width:680px;min-width:0}
  .authored-text{white-space:pre-wrap;overflow-wrap:anywhere;font-size:clamp(15px,2vw,18px);line-height:1.65;margin:0}
  figure{margin:0}figure img{width:100%;height:auto;max-height:620px;object-fit:contain;display:block}figcaption{font-size:12px;margin-top:6px;opacity:.7}
  .outbound-links{display:flex;flex-direction:column;gap:13px}.outbound-link{display:flex;align-items:baseline;gap:4px 13px;flex-wrap:wrap}
  .outbound-link a{color:inherit;font-weight:600;text-underline-offset:3px;overflow-wrap:anywhere}
  .social-link{display:inline-flex;align-items:center;gap:8px}
  .platform-symbol{width:23px;height:23px;border:1px solid currentColor;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
  .platform-letter{font:bold 18px Arial,sans-serif}
  .area-controls{display:flex;flex-wrap:wrap;align-items:center;gap:12px;font-size:12px;color:#566358}
  .outbound-link span{font-size:13px;opacity:.8}
  .contact{border-top:1px solid currentColor;margin-top:28px;padding-top:15px;max-width:680px}
  .contact span{font-size:12px;opacity:.7}.contact p{margin:6px 0 0;white-space:pre-wrap}
  .empty{color:inherit;opacity:.6;max-width:550px}
  .studio{border-top:1px solid #d9ded8;margin-top:28px;padding-top:25px}
  .studio-header h3{font-weight:500;font-size:20px;margin:0}
  .studio-header p{font-size:13px;color:#6d756d;margin:4px 0 24px}
  .settings{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
  .setting{display:flex;flex-direction:column;gap:6px}
  .area-setting{margin-top:18px;max-width:600px}
  .check{display:flex;gap:10px;align-items:center;margin-top:4px;font-size:13px}
  .check input{width:auto}
  label{font-size:12px;color:#515d54}
  input,select,textarea{width:100%;border:1px solid #c6cec6;border-radius:2px;padding:9px;background:#fff;color:#252b25;font:inherit}
  input[type=file]{font-size:12px}
  small{font-size:11px;color:#697169}
  .pieces-editor{margin-top:30px}
  .pieces-editor h4{font-size:16px;font-weight:500}
  .block-editor{padding:16px 0;border-top:1px solid #dce1da;display:flex;flex-direction:column;gap:7px}
  .block-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:5px}
  .block-top strong{font-size:13px;font-weight:600}
  .block-controls{display:flex;gap:9px;align-items:center}
  .block-controls button,.quiet{background:transparent;border:0;padding:3px 2px;color:#4c6354;text-decoration:underline;text-underline-offset:2px;font-size:12px}
  button:disabled{opacity:.4;cursor:default}
  .add-block{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 24px}
  .add-block button{background:#fff;border:1px solid #bac5b9;padding:8px 12px;border-radius:2px;color:#26392b}
  .link-editor{padding:10px 0;display:flex;flex-direction:column;gap:6px;border-top:1px dotted #d6ddd3}
  .contact-settings{border-top:1px solid #dce1da;padding-top:18px;display:flex;flex-direction:column;gap:8px;max-width:600px}
  .error{color:#9d4229;font-size:12px}
  @media(max-width:600px){.settings{grid-template-columns:1fr}.canvas{min-height:180px}.block-top{align-items:flex-start}.block-controls{gap:5px}}
</style>