<script lang="ts">
  import type { PersonalPlace, ProfileBlock, ProfileLink, Theme, Typeface, ContactMode, BlockKind } from '$lib/personalPlace';
  import { blankBlock, validExternalUrl } from '$lib/personalPlace';

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
    <div class="canvas-head">
      <h2>{person || 'Mijn plek'}</h2>
      {#if place.areaVisible && place.area.trim()}<span class="location">{place.area}</span>{/if}
    </div>
    <div class="blocks">
      {#each place.blocks as block (block.id)}
        <section class="piece">
          {#if block.kind === 'text' && block.text.trim()}
            <p class="authored-text">{block.text}</p>
          {:else if block.kind === 'image' && block.image}
            <figure><img src={block.image} alt={block.alt || 'Afbeelding op de persoonlijke plek'} />{#if block.text.trim()}<figcaption>{block.text}</figcaption>{/if}</figure>
          {:else if block.kind === 'links'}
            <div class="outbound-links">
              {#each block.links.filter((l) => validExternalUrl(l.url)) as link (link.id)}
                <div class="outbound-link">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label || new URL(link.url).hostname}</a>
                  {#if link.description}<span>{link.description}</span>{/if}
                </div>
              {/each}
            </div>
          {/if}
        </section>
      {/each}
      {#if place.blocks.length === 0}<p class="empty">{owner ? 'Je kunt hier iets over jezelf laten zien. Een naam alleen is ook prima.' : 'Er is hier nog niets toegevoegd.'}</p>{/if}
    </div>
    {#if place.contactMode !== 'none' && place.contactNote.trim()}
      <div class="contact"><span>{place.contactMode === 'elsewhere' ? 'Verder praten' : 'Elkaar ontmoeten'}</span><p>{place.contactNote}</p></div>
    {/if}
  </section>

  {#if owner && editing}
    <div class="studio" aria-label="Richt mijn plek in">
      <div class="studio-header"><h3>Richt je plek in</h3><p>Voeg toe wat je wilt. Je hoeft niets af te maken.</p></div>
      <div class="settings">
        <div class="setting"><label for="person-name">Naam</label><input id="person-name" maxlength="40" value={person} oninput={(e) => onNameChange(e.currentTarget.value)} /></div>
        <div class="setting"><label for="profile-theme">Achtergrond</label><select id="profile-theme" value={place.theme} onchange={(e) => change({ theme: e.currentTarget.value as Theme })}><option value="papier">Papier</option><option value="ink">Donker</option><option value="kleur">Warm</option></select></div>
        <div class="setting"><label for="profile-font">Letters</label><select id="profile-font" value={place.typeface} onchange={(e) => change({ typeface: e.currentTarget.value as Typeface })}><option value="sans">Eenvoudig</option><option value="serif">Boekachtig</option><option value="mono">Typemachine</option></select></div>
      </div>
      <div class="setting area-setting">
        <label for="profile-area">Buurt, wijk of stad (mag leeg)</label>
        <input id="profile-area" maxlength="80" value={place.area} placeholder="Bijvoorbeeld: Korvel, Tilburg" oninput={(e) => change({ area: e.currentTarget.value })}/>
        <label class="check"><input type="checkbox" checked={place.areaVisible} onchange={(e) => change({ areaVisible: e.currentTarget.checked })}/> Toon deze aanduiding op mijn plek</label>
        <small>Dit is wat je zelf wilt delen, niet je woonadres. Je profiel verschijnt niet als woonmarker op de kaart.</small>
      </div>

      <div class="pieces-editor">
        <h4>Onderdelen</h4>
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
                  <label for={'link-label-'+link.id}>Naam</label><input id={'link-label-'+link.id} maxlength="100" placeholder="Mijn Instagram, band, website…" value={link.label} oninput={(e) => updateLink(block, link.id, { label: e.currentTarget.value })}/>
                  <label for={'link-url-'+link.id}>Link (https://)</label><input id={'link-url-'+link.id} maxlength="600" placeholder="https://…" value={link.url} oninput={(e) => updateLink(block, link.id, { url: e.currentTarget.value })}/>
                  {#if link.url && !validExternalUrl(link.url)}<small class="error">Vul een geldig https-adres in.</small>{/if}
                  <label for={'link-description-'+link.id}>Wat is daar te vinden?</label><input id={'link-description-'+link.id} maxlength="240" placeholder="Daar ben ik vooral actief…" value={link.description} oninput={(e) => updateLink(block, link.id, { description: e.currentTarget.value })}/>
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
  .canvas-head{display:flex;align-items:baseline;flex-wrap:wrap;gap:12px;margin-bottom:28px}
  .canvas h2{font-family:inherit;font-size:clamp(25px,4vw,38px);letter-spacing:-.5px;font-weight:500;margin:0}
  .location{font-size:13px;opacity:.75}
  .blocks{display:flex;flex-direction:column;gap:22px}
  .piece{max-width:680px;min-width:0}
  .authored-text{white-space:pre-wrap;overflow-wrap:anywhere;font-size:clamp(15px,2vw,18px);line-height:1.65;margin:0}
  figure{margin:0}figure img{width:100%;height:auto;max-height:620px;object-fit:contain;display:block}figcaption{font-size:12px;margin-top:6px;opacity:.7}
  .outbound-links{display:flex;flex-direction:column;gap:13px}.outbound-link{display:flex;align-items:baseline;gap:4px 13px;flex-wrap:wrap}
  .outbound-link a{color:inherit;font-weight:600;text-underline-offset:3px;overflow-wrap:anywhere}
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