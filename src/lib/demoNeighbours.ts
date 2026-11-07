import type { PersonalPlace } from './personalPlace';

// All people and texts below are fictional. These records are demo fixtures only.
export type DemoNeighbour = {
  id: string;
  name: string;
  pc4: string;
  intro: string;
  more: string;
  links: Array<{ label: string; url: string; description: string }>;
};

export const demoNeighbours: DemoNeighbour[] = [
  {
    id: 'demo-5041-1', name: 'Lena (voorbeeld)', pc4: '5041',
    intro: 'Ik maak graag dingen met mijn handen. Vooral keramiek en kleine reparaties, het liefst zonder haast.',
    more: 'Op donderdag ben ik vaak bij een open atelier te vinden. Ik heb altijd wel een vraag over glazuur.',
    links: []
  },
  {
    id: 'demo-5041-2', name: 'Ilias (voorbeeld)', pc4: '5041',
    intro: 'Muziek verzamelen, fietsen opknappen en af en toe met de buren koken. Niet per se in die volgorde.',
    more: 'Ik zoek nog iemand die met mij een oude versterker wil proberen te repareren.',
    links: []
  },
  {
    id: 'demo-5041-3', name: 'Jette (voorbeeld)', pc4: '5041',
    intro: 'Ik houd een kleine moestuin bij, maar praat minstens zo graag over boeken en het weer.',
    more: 'Als er weer te veel courgettes zijn, laat ik het weten.',
    links: []
  },
  {
    id: 'demo-5041-4', name: 'Roos (voorbeeld)', pc4: '5041',
    intro: 'Schilderen is voor mij vooral een reden om samen te komen. De rest ontstaat vanzelf.',
    more: 'Ik neem soms extra papier of verf mee, voor wie wil aanschuiven.',
    links: []
  }
];

export function demoNeighbourPlace(person: DemoNeighbour): PersonalPlace {
  return {
    theme: 'papier', typeface: 'sans',
    area: '', mapArea: {pc4: person.pc4}, areaVisible: true,
    contactMode: 'none', contactNote: '',
    blocks: [
      {id: person.id + '-intro',kind:'text',text:person.intro,image:'',alt:'',links:[]},
      {id: person.id + '-more',kind:'text',text:person.more,image:'',alt:'',links:[]},
      ...person.links.length ? [{
        id: person.id + '-links',kind:'links' as const,text:'',image:'',alt:'',
        links:person.links.map((link, index) => ({id:person.id+'-'+index,...link}))
      }] : []
    ]
  };
}
