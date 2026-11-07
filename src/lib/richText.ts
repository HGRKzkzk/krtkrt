// Strict, small HTML subset for a browser-only personal page prototype.
// Importantly, pasted HTML never passes through unchanged to {@html}.
// All element attributes except independently validated HTTPS links are discarded.
const tags = new Set(['P','BR','H3','H4','STRONG','B','EM','I','U','UL','OL','LI','BLOCKQUOTE']);
const rejectWithContents = new Set(['SCRIPT','STYLE','SVG','MATH','IFRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','TEXTAREA','SELECT','META','LINK','TEMPLATE','NOSCRIPT']);
const canonical: Record<string,string> = {B:'strong',I:'em'};

export function escapeText(text: string): string {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
export function textToRich(text: string): string {
  return text.split(/\n\n+/).map((paragraph) => '<p>' + escapeText(paragraph).replace(/\n/g,'<br>') + '</p>').join('');
}
export function sanitizeRich(input: string): string {
  if (typeof DOMParser === 'undefined') return textToRich(input.replace(/<[^>]*>/g, ''));
  const doc = new DOMParser().parseFromString(input,'text/html');
  function visit(node: Node, depth: number): string {
    if (depth > 40) return '';
    if (node.nodeType === Node.TEXT_NODE) return escapeText(node.textContent || '');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const element = node as Element;
    const tag = element.tagName.toUpperCase();
    if (rejectWithContents.has(tag)) return '';
    const children = Array.from(element.childNodes).map((part) => visit(part,depth+1)).join('');
    if (tag === 'A') {
      const url = element.getAttribute('href') || '';
      try {
        const parsed = new URL(url);
        if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) return '<a href="' + escapeText(parsed.href) + '" target="_blank" rel="noopener noreferrer">' + children + '</a>';
      } catch { /* keep only link text */ }
      return children;
    }
    if (tag === 'DIV') return '<p>' + children + '</p>';
    if (!tags.has(tag)) return children;
    const name = canonical[tag] || tag.toLowerCase();
    return tag === 'BR' ? '<br>' : '<' + name + '>' + children + '</' + name + '>';
  }
  return Array.from(doc.body.childNodes).map((child)=>visit(child,0)).join('').slice(0,30000);
}
export function richHasText(html: string): boolean {
  return html.replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').trim().length > 0;
}
