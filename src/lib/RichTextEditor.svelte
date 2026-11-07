<script lang="ts">
  import { onMount } from 'svelte';
  import { sanitizeRich, textToRich } from './richText';
  export let value = '';
  export let fallbackText = '';
  export let onChange: (next: string) => void = () => {};
  export let placeholder = 'Vertel iets over jezelf. Je kunt hier meteen beginnen met schrijven.';
  let editable: HTMLDivElement;
  let current = '';
  let error = '';
  let active = false;
  onMount(() => {
    current = sanitizeRich(value || textToRich(fallbackText));
    editable.innerHTML = current;
  });
  function emit() {
    if (!editable) return;
    const clean = sanitizeRich(editable.innerHTML);
    current = clean;
    onChange(clean);
  }
  function format(command: string, argument?: string) {
    editable.focus();
    document.execCommand(command,false,argument);
    emit();
  }
  function insertLink() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      error = 'Selecteer eerst een stukje tekst voor de link.';return;
    }
    const answer = window.prompt('Link naar website (https://)', 'https://');
    if (answer === null) return;
    let valid = false;
    try {
      const url = new URL(answer);
      valid = url.protocol === 'https:' && !url.username && !url.password;
    } catch { /* invalid */ }
    if (!valid) {error = 'Gebruik een geldig https-adres.';return;}
    error = '';
    format('createLink',answer);
  }
  function plainPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertText',false,text);
    emit();
  }
</script>

<div class="rich-editor">
  <div class="toolbar" role="toolbar" aria-label="Tekstopmaak">
    <button type="button" title="Vet" aria-label="Vet" onclick={() => format('bold')}><strong>B</strong></button>
    <button type="button" title="Cursief" aria-label="Cursief" onclick={() => format('italic')}><em>I</em></button>
    <button type="button" title="Onderstrepen" aria-label="Onderstrepen" onclick={() => format('underline')}><u>U</u></button>
    <span class="separator" aria-hidden="true"></span>
    <button type="button" title="Tussenkop" onclick={() => format('formatBlock','h3')}>Kop</button>
    <button type="button" title="Gewone tekst" onclick={() => format('formatBlock','p')}>Tekst</button>
    <button type="button" title="Opsomming" onclick={() => format('insertUnorderedList')}>Lijst</button>
    <button type="button" title="Maak een link van geselecteerde tekst" onclick={insertLink}>Link</button>
    <span class="separator" aria-hidden="true"></span>
    <button type="button" title="Opmaak van selectie wissen" onclick={() => format('removeFormat')}>Opmaak wissen</button>
  </div>
  <div bind:this={editable} class="editable" contenteditable="true" role="textbox" aria-label="Vrije profieltekst met opmaak" aria-multiline="true" data-placeholder={placeholder} oninput={emit} onfocus={() => active = true} onblur={() => active = false} onpaste={plainPaste}></div>
  {#if error}<p role="alert" class="error">{error}</p>{/if}
  <p class="hint">Schrijf zoals je wilt. Selecteer tekst om die op te maken. Externe links beginnen met https://. Geplakte tekst wordt zonder verborgen opmaak ingevoegd.</p>
</div>

<style>
  .rich-editor{background:#fff;border:1px solid #c7d0c5}
  .toolbar{display:flex;align-items:center;gap:4px;flex-wrap:wrap;padding:8px;border-bottom:1px solid #dde2dc;background:#f7f8f5}
  .toolbar button{font:inherit;background:transparent;color:#2f4435;border:0;border-radius:3px;padding:5px 9px;cursor:pointer;min-height:31px}
  .toolbar button:hover,.toolbar button:focus-visible{background:#e7eee4}
  .separator{width:1px;height:22px;background:#cfd6cd;margin:0 5px}
  .editable{min-height:155px;padding:15px 17px;outline:0;font:inherit;font-size:16px;line-height:1.7;white-space:normal;overflow-wrap:anywhere}
  .editable:focus-visible{outline:2px solid #426c54;outline-offset:-2px}
  .editable:empty:before{content:attr(data-placeholder);color:#879085;pointer-events:none}
  .hint{font-size:12px;color:#68736a;padding:8px 12px 12px;margin:0}
  .error{font-size:12px;color:#9f342a;padding:0 12px}
</style>