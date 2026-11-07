import { cleanMapArea } from './mapArea';
import type { MapArea } from './mapArea';
export type Theme = 'papier' | 'ink' | 'kleur';
export type Typeface = 'sans' | 'serif' | 'mono';
export type ContactMode = 'none' | 'elsewhere' | 'in-person';
export type BlockKind = 'text' | 'image' | 'links';
export type ProfileLink = { id: string; label: string; url: string; description: string };
export type ProfileBlock = {
  id: string;
  kind: BlockKind;
  text: string;
  richText?: string;
  image: string;
  alt: string;
  links: ProfileLink[];
};
export type PersonalPlace = {
  theme: Theme;
  typeface: Typeface;
  area: string;
  mapArea: MapArea | null;
  areaVisible: boolean;
  contactMode: ContactMode;
  contactNote: string;
  blocks: ProfileBlock[];
};
export type LegacyProfile = {
  bio: string;
  appreciates: string;
  dislikes: string;
  links: string;
};

export const blankBlock = (kind: BlockKind): ProfileBlock => ({
  id: crypto.randomUUID(), kind, text: '', image: '', alt: '', links: []
});

export function emptyPlace(): PersonalPlace {
  return { theme: 'papier', typeface: 'sans', area: '', mapArea: null, areaVisible: false, contactMode: 'none', contactNote: '', blocks: [] };
}

export function validExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password;
  } catch { return false; }
}

export function fromLegacy(profile: LegacyProfile): PersonalPlace {
  const place = emptyPlace();
  if (profile.bio.trim()) place.blocks.push({ ...blankBlock('text'), text: profile.bio });
  if (profile.appreciates.trim()) place.blocks.push({ ...blankBlock('text'), text: profile.appreciates });
  if (profile.dislikes.trim()) place.blocks.push({ ...blankBlock('text'), text: profile.dislikes });
  const links = profile.links.split(/\n|,/).map((url) => url.trim()).filter(validExternalUrl).slice(0, 8)
    .map((url) => ({ id: crypto.randomUUID(), label: new URL(url).hostname, url, description: '' }));
  if (links.length) place.blocks.push({ ...blankBlock('links'), links });
  return place;
}

export function cleanPlace(raw: unknown): PersonalPlace {
  if (!raw || typeof raw !== 'object') return emptyPlace();
  const x = raw as Partial<PersonalPlace>;
  const themes: Theme[] = ['papier', 'ink', 'kleur'];
  const fonts: Typeface[] = ['sans', 'serif', 'mono'];
  const contacts: ContactMode[] = ['none', 'elsewhere', 'in-person'];
  const kindSet: BlockKind[] = ['text', 'image', 'links'];
  const blocks: ProfileBlock[] = Array.isArray(x.blocks) ? x.blocks.slice(0, 25)
    .filter((b): b is ProfileBlock => !!b && typeof b === 'object' && kindSet.includes(b.kind))
    .map((b) => ({
      id: String(b.id || crypto.randomUUID()), kind: b.kind,
      text: String(b.text || '').slice(0, 2500),
      richText: typeof b.richText === 'string' ? b.richText.slice(0, 30000) : '',
      image: typeof b.image === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(b.image) && b.image.length < 600000 ? b.image : '',
      alt: String(b.alt || '').slice(0, 180),
      links: Array.isArray(b.links) ? b.links.slice(0, 10).filter((l) => l && typeof l === 'object').map((l) => ({
        id: String(l.id || crypto.randomUUID()),
        label: String(l.label || '').slice(0, 100),
        url: validExternalUrl(String(l.url || '')) ? String(l.url) : '',
        description: String(l.description || '').slice(0, 240)
      })) : []
    })) : [];
  return {
    theme: themes.includes(x.theme as Theme) ? x.theme as Theme : 'papier',
    typeface: fonts.includes(x.typeface as Typeface) ? x.typeface as Typeface : 'sans',
    area: String(x.area || '').slice(0, 80),
    mapArea: cleanMapArea(x.mapArea),
    areaVisible: x.areaVisible === true,
    contactMode: contacts.includes(x.contactMode as ContactMode) ? x.contactMode as ContactMode : 'none',
    contactNote: String(x.contactNote || '').slice(0, 280),
    blocks
  };
}

export type LinkSite = { name: string; icon: string; recognized: boolean };
export function linkSite(value: string): LinkSite {
  if (!validExternalUrl(value)) return { name: 'Website', icon: 'web', recognized: false };
  const host = new URL(value).hostname.toLowerCase().replace(/^www\./, '');
  const platforms: { hosts: string[]; name: string; icon: string }[] = [
    { hosts: ['instagram.com'], name: 'Instagram', icon: 'instagram' },
    { hosts: ['facebook.com', 'fb.com'], name: 'Facebook', icon: 'facebook' },
    { hosts: ['bandcamp.com'], name: 'Bandcamp', icon: 'bandcamp' },
    { hosts: ['youtube.com', 'youtu.be'], name: 'YouTube', icon: 'youtube' },
    { hosts: ['bsky.app'], name: 'Bluesky', icon: 'bluesky' },
    { hosts: ['mastodon.social', 'mastodon.online'], name: 'Mastodon', icon: 'mastodon' },
    { hosts: ['tiktok.com'], name: 'TikTok', icon: 'tiktok' },
    { hosts: ['linkedin.com'], name: 'LinkedIn', icon: 'linkedin' },
    { hosts: ['soundcloud.com'], name: 'SoundCloud', icon: 'soundcloud' },
    { hosts: ['open.spotify.com', 'spotify.com'], name: 'Spotify', icon: 'spotify' }
  ];
  const platform = platforms.find((p) => p.hosts.some((h) => host === h || host.endsWith('.' + h)));
  return platform ? { name: platform.name, icon: platform.icon, recognized: true } : { name: host, icon: 'web', recognized: false };
}
