# Technische architectuur — voorlopig

## Demo 0.1
SvelteKit + TypeScript + OpenLayers; statische deployment. Drie interface-ingangen: Kaart, Kringen en Ontdek.

- `src/lib/MapView.svelte`: kaart met algemene geografische context.
- `src/lib/demo.ts`: fictieve oproepen, kanaalberichten en interpretatieve verbindingen.
- `src/lib/types.ts`: eenvoudige modeltypen.
- `src/routes/+page.svelte`: demo-interface en lokale invoer.
- Browseropslag is per apparaat en géén multi-user backend.

## Latere mogelijke domeinobjecten
Person, Circle, Membership, Invitation, Channel, Message, Post, Region, Topic, Link, Connection, ModerationAction. Dit is een richting, nog geen definitief databaseschema.

## Privacy en veiligheid
Geen locaties van particuliere woningen of publiek zichtbare inventarissen. Een toekomstige backend moet kringautorisatie en expliciete deelrechten afdwingen op de server, niet alleen in de UI. Geen echte leden of gevoelige gesprekken voor die beveiliging werkt.

## Bewust niet gebouwd
Accounts, uitnodigingsketens, gedeelde chat, moderatiedashboard, geolocatie van leden, matchmaking, AI-routes, grafendatabase, betalingen en notificaties.

## Grenzen
Interpretatieve verbindingen zijn uitspraken van deelnemers; het systeem verheft ze niet tot canonieke eigenschappen. Ontdekken mag geen automatische classificatie van mensen worden.