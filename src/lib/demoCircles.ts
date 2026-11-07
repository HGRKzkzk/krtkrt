// All circles, memberships, places and activities below are invented demo content.
// A circle is a social relationship; locations belong to specific activities,
// not automatically to a circle's members or to their home addresses.
export type CircleId = 'schildergroep' | 'band-a' | 'band-b';
export type CirclePlace = {
  id: string;
  title: string;
  kind: 'ontmoeting' | 'optreden';
  description: string;
  // Deliberately approximate, fictitious demo positions, NOT actual events.
  lon: number;
  lat: number;
};
export type DemoCircle = {
  id: CircleId;
  name: string;
  summary: string;
  description: string;
  memberNames: string[];
  channels: string[];
  places: CirclePlace[];
};
export const demoCircles: DemoCircle[] = [
  {
    id: 'schildergroep', name: 'Schilderklasje (voorbeeld)',
    summary: 'Samen schilderen, materialen delen en elkaar iets laten zien.',
    description: 'Een kleine groep die geregeld bij elkaar komt. De ontmoeting heeft een plek, maar de mensen vallen niet samen met die plek.',
    memberNames: ['Noor (voorbeeld)', 'Sam (voorbeeld)', 'Alex (voorbeeld)', 'Mika (voorbeeld)'],
    channels: ['algemeen', 'materiaal'],
    places: [{id:'atelier',title:'Schildermiddag (fictief)',kind:'ontmoeting',
      description:'Een denkbeeldige ontmoetingsplek in Tilburg; geen werkelijk adres of afspraak.',
      lon:5.081,lat:51.556}]
  },
  {
    id: 'band-a', name: 'Band A (voorbeeld)',
    summary: 'Repetities, liedjes en af en toe een optreden.',
    description: 'De leden wonen niet noodzakelijk bij elkaar in de buurt. Een repetitie of optreden kan een plek hebben; de band zelf hoeft er niet te wonen.',
    memberNames: ['Gast', 'Jules (voorbeeld)', 'Mara (voorbeeld)'],
    channels: ['algemeen','repetitie'],
    places: [
      {id:'repetitie',title:'Repetitie (fictief)',kind:'ontmoeting',
        description:'Denkbeeldige repetitielocatie in Tilburg, geen echt adres.',
        lon:5.070,lat:51.558},
      {id:'podium',title:'Optreden (fictief)',kind:'optreden',
        description:'Denkbeeldig podium in Tilburg, geen aangekondigd evenement.',
        lon:5.101,lat:51.548}
    ]
  },
  {
    id:'band-b',name:'Band B (voorbeeld)',
    summary:'Samen muziek onderzoeken, zonder een vaste plek op de kaart.',
    description:'Deze band heeft in de demo bewust geen geografische gegevens. Dat maakt haar niet minder zichtbaar of minder volwaardig als kring.',
    memberNames:['Gast','Bo (voorbeeld)','Robin (voorbeeld)'],
    channels:['algemeen','ideeën'],
    places:[]
  }
];
export function circleById(id: string): DemoCircle {
  return demoCircles.find(circle => circle.id===id) ?? demoCircles[0];
}
