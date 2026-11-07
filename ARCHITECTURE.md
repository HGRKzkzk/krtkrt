# Technische architectuur — voorlopig

## Demo 0.1
SvelteKit + TypeScript + OpenLayers; statische deployment. Drie interface-ingangen: Kaart, Kringen en Mijn plek. Ontdekking is **geen** afzonderlijke interfacefunctie; zij kan ontstaan door het lezen van bijdragen en profielen.

- `src/lib/MapView.svelte`: kaart met algemene geografische context.
- `src/lib/demo.ts`: fictieve oproepen, kanaalberichten en historische voorbeeldnotities (bestaande lokale demo-data blijven leesbaar).
- `src/lib/types.ts`: eenvoudige modeltypen.
- `src/routes/+page.svelte`: demo-interface en lokale invoer.
- Browseropslag is per apparaat en géén multi-user backend.

## Latere mogelijke domeinobjecten
Person, Circle, Membership, Invitation, Channel, Message, Post, Region, Link, ModerationAction. Een eventueel verband tussen bijdragen is afgeleid van de context en wordt niet als verplicht zelfstandig object opgelegd. Dit is een richting, nog geen definitief databaseschema.

## Privacy en veiligheid
Geen locaties van particuliere woningen of publiek zichtbare inventarissen. Een toekomstige backend moet kringautorisatie en expliciete deelrechten afdwingen op de server, niet alleen in de UI. Geen echte leden of gevoelige gesprekken voor die beveiliging werkt.

## Bewust niet gebouwd
Accounts, uitnodigingsketens, gedeelde chat, moderatiedashboard, geolocatie van leden, matchmaking, AI-routes, grafendatabase, betalingen en notificaties.

## Grenzen
Betekenis ontstaat in menselijke expressie en interactie. De UI bevat geen route-editor, compatibiliteitsscore of zelfstandig Ontdek-tabblad. Historische demo-verbindingen worden behouden als tekst, zonder nieuwe expliciete route-objecten te laten maken.

## UI 0.2 — presentatie
De kaart is het primaire canvas; de bijdragenlijst is een aansluitende zijstrook (op smalle schermen onder de kaart). De overige primaire bestemmingen zijn Kringen en Mijn plek. De demo gebruikt dezelfde browseropslagsleutel als UI 0.1 om bestaande bijdragen en profielinhoud te behouden. De vormgeving bevat geen nieuw afhankelijkheden of backend.
