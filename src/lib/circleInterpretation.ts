import type { Post, Message, CircleReply } from './types';

// A deliberately small, inspectable heuristic. No remote model, profiles, scores,
// automatic labels, ranking, notifications or changes to participants' content.
export const REVIEW_INTERVAL_MS = 6 * 60 * 60 * 1000;

export type Direction = 'praktische-vraag' | 'uitwisseling' | 'gezamenlijk-idee' | 'verkenning';
export type Interpretation = {
  threadId: string;
  revision: string;
  reviewedAt: number;
  directions: Direction[];
  evidence: string[];
};
export type Thread = {id:string; text:string; kind:string; state?:string; replies:CircleReply[]};

export function threadsForInterpretation(posts: Post[], messages: Message[], replies: CircleReply[]): Thread[] {
  const entries = [
    ...posts.filter(post=>post.visibility==='kring').map(post=>({id:'post-'+post.id,text:post.text,kind:post.kind,state:post.state})),
    ...messages.map(message=>({id:'message-'+message.id,text:message.text,kind:'gesprek',state:undefined}))
  ];
  return entries.map(entry=>({...entry,replies:replies.filter(reply=>reply.parentId===entry.id)}));
}

// A revision key contains no text or authors. Only immutable reply IDs and
// optional practical state change; stored locally, never transmitted.
export function revisionOf(thread:Thread):string {
  return [thread.id,thread.state || '',...thread.replies.map(reply=>reply.id).sort()].join('|');
}

export function interpret(thread:Thread, now:number):Interpretation {
  const parts = [thread.text,...thread.replies.map(reply=>reply.text)].map(s=>s.toLowerCase());
  const root = parts[0];
  const responses = parts.slice(1);
  const directions: Direction[]=[];
  const evidence:string[]=[];
  const hasQuestion = thread.kind==='vraag' || root.includes('?') || /\b(zoek|nodig|wie heeft|kan iemand)\b/.test(root);
  const hasOffer = responses.some(s=>/\b(ik heb|kan ik|ik kan|neem ik|neem .* mee|leen|aanbieden)\b/.test(s));
  const hasIdea = responses.some(s=>/\b(zullen we|kunnen we samen|laten we|misschien samen|samen .* (maken|doen|proberen))\b/.test(s));
  if (hasQuestion) {directions.push('praktische-vraag');evidence.push('De aanzet heeft een vragend karakter');}
  if (hasOffer) {directions.push('uitwisseling');evidence.push('Er is mogelijk hulp of materiaal aangeboden');}
  if (hasIdea) {directions.push('gezamenlijk-idee');evidence.push('Er lijkt een gezamenlijk voorstel te ontstaan');}
  if (!directions.length && responses.length > 0) {
    directions.push('verkenning');evidence.push('Het gesprek ontwikkelt zich zonder duidelijke praktische richting');
  }
  if (!directions.length) evidence.push('Nog onvoldoende aanknopingspunten voor een richting');
  return {threadId:thread.id,revision:revisionOf(thread),reviewedAt:now,directions,evidence};
}

export function reviewDueThreads(
  posts:Post[],messages:Message[],replies:CircleReply[],
  previous:Interpretation[],now:number
):Interpretation[] {
  const old = new Map(previous.map(item=>[item.threadId,item]));
  return threadsForInterpretation(posts,messages,replies).map(thread=>{
    const earlier=old.get(thread.id);
    // One first look when the thread enters the browser. Subsequent looks only
    // when the input changed AND at least six hours have elapsed since review.
    if (earlier && Number.isFinite(earlier.reviewedAt) &&
      now-earlier.reviewedAt>=0 && now-earlier.reviewedAt<REVIEW_INTERVAL_MS) return earlier;
    if (earlier && earlier.revision===revisionOf(thread)) return earlier;
    return interpret(thread,now);
  });
}

export function readInterpretations(raw:unknown):Interpretation[] {
  if(!Array.isArray(raw))return [];
  return raw.filter((x):x is Interpretation=>Boolean(x && typeof x==='object' &&
    typeof x.threadId==='string' && typeof x.revision==='string' &&
    Number.isFinite(x.reviewedAt) && Array.isArray(x.directions) &&
    x.directions.every((d:unknown)=>['praktische-vraag','uitwisseling','gezamenlijk-idee','verkenning'].includes(String(d))) &&
    Array.isArray(x.evidence) && x.evidence.every((e:unknown)=>typeof e==='string'))).slice(0,500);
}
