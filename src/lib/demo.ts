import type { Post, Message, Connection } from './types';
const now = Date.parse('2026-11-01T18:00:00Z');
export const demoPosts: Post[] = [
  {id:'p1', author:'Noor (voorbeeld)',kind:'vraag',text:'Heeft iemand een brede kwast die ik voor de volgende les kan lenen?',visibility:'kring',circle:'Schildergroep',createdAt:now,demo:true},
  {id:'p2', author:'Sam (voorbeeld)',kind:'aanbod',text:'Ik heb nog wat ultramarijn en okergeel over. Wie kan het gebruiken?',visibility:'kring',circle:'Schildergroep',createdAt:now-300000,demo:true},
  {id:'p3', author:'Alex (voorbeeld)',kind:'vraag',text:'Heeft iemand een klopboormachine die ik een middag mag lenen?',visibility:'buurt',circle:'Schildergroep',createdAt:now-600000,demo:true},
  {id:'p4', author:'Mika (voorbeeld)',kind:'gedachte',text:'Wat maakt dat sommige schilderijen juist werken wanneer je iets níét precies herkent?',visibility:'kring',circle:'Schildergroep',createdAt:now-900000,demo:true}
];
export const demoMessages: Message[] = [
  {id:'m1',author:'Noor (voorbeeld)',text:'Ik heb vandaag zin om met een heel beperkt palet te werken. Iemand tips?',channel:'algemeen',createdAt:now,demo:true},
  {id:'m2',author:'Sam (voorbeeld)',text:'Probeer eens maar twee kleuren en wit. Verrassend hoeveel er kan.',channel:'algemeen',createdAt:now+60000,demo:true},
  {id:'m3',author:'Alex (voorbeeld)',text:'Ik neem de extra kwasten donderdag mee.',channel:'materiaal',createdAt:now+120000,demo:true}
];
export const demoConnections: Connection[] = [
  {id:'c1',from:'Brian Eno',to:'Aphex Twin',reason:'Misschien een gedeelde zoektocht naar klank als ruimte, ondanks heel andere luisterervaringen.',author:'Voorbeeldbijdrage',createdAt:now,demo:true},
  {id:'c2',from:'Kate Bush',to:'Peter Gabriel (I–III)',reason:'Een mogelijke verwantschap in de zoektocht naar vorm, productie en expressie.',author:'Voorbeeldbijdrage',createdAt:now,demo:true}
];