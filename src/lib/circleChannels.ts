import type { CircleId } from './demoCircles';

// Pure presentation rules. Channel membership belongs to an entire thread,
// not to individual replies. Existing saved content stays intact.
export type ChannelSettings = Partial<Record<CircleId,string[]>>;
export type ChannelAssignments = Record<string,string>;
export const DEFAULT_CHANNEL = 'algemeen';
const MAX_CHANNELS = 12;

export function cleanChannelName(value:string):string {
  return value.trim().toLocaleLowerCase('nl-NL').replace(/\s+/g,' ').slice(0,32);
}
export function channelsForCircle(id:CircleId, settings:ChannelSettings, legacy:string[]=[]):string[] {
  const chosen = settings[id] ?? [DEFAULT_CHANNEL];
  const unique = [DEFAULT_CHANNEL,...chosen,...legacy]
    .map(cleanChannelName).filter(Boolean);
  return Array.from(new Set(unique)).slice(0,MAX_CHANNELS);
}
export function readChannelSettings(raw:unknown):ChannelSettings {
  if(!raw || typeof raw!=='object')return {};
  const obj = raw as Record<string,unknown>;
  const result:ChannelSettings = {};
  for (const id of ['schildergroep','band-a','band-b'] as const) {
    if (Array.isArray(obj[id])) {
      result[id] = Array.from(new Set([DEFAULT_CHANNEL,...obj[id]
        .filter((x:unknown):x is string=>typeof x==='string')
        .map(cleanChannelName).filter(Boolean)])).slice(0,MAX_CHANNELS);
    }
  }
  return result;
}
export function readChannelAssignments(raw:unknown):ChannelAssignments {
  if(!raw || typeof raw!=='object'||Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).filter(([key,value])=>
    /^(post|message)-[\w-]{1,100}$/.test(key) && typeof value==='string' && value.length<=32
  ).map(([key,value])=>[key,cleanChannelName(value as string)]));
}
export function channelForThread(id:string, original:string|undefined, overrides:ChannelAssignments):string {
  return overrides[id] || (original ? cleanChannelName(original) : DEFAULT_CHANNEL);
}
export function changeChannel(settings:ChannelSettings,id:CircleId,label:string):ChannelSettings {
  const value=cleanChannelName(label);
  const list=channelsForCircle(id,settings);
  if(!value||list.includes(value)||list.length>=MAX_CHANNELS)return settings;
  return {...settings,[id]:[...list,value]};
}
