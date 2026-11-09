# krtkrt

Een kleine, geografisch georiënteerde plek om mensen te leren kennen, vragen te stellen, spullen en kennis te delen en aansluiting te vinden bij bestaande kringen. Geen vervangend sociaal netwerk: een ontmoeting mag net zo goed buiten krtkrt verdergaan.

**Status: openbare prototypecode met fictieve gebruikers.** Er zijn geen echte accounts, geen gedeelde serverdatabase en geen werkende autorisatie tussen gebruikers. Ingevoerde inhoud wordt uitsluitend in de browser van dit apparaat bewaard; de proefprofielen zijn vaste demo-inhoud. Gebruik de demo niet voor echte privégegevens.

## Wat kun je nu uitproberen?

- **Kaart:** voorbeeldbijdragen bekijken en het gekozen viercijferige postcodegebied (PC4) van een profiel zien. Per gebied staat één teller met het aantal zichtbare voorbeeldprofielen; een klik opent de bijbehorende personenlijst. Het eigen profiel staat daarin bovenaan en is subtiel anders weergegeven. Vier fictieve personen horen bij PC4 **5041**.
- **Kringen:** een fictieve schildergroep met kanalen, gesprekken, vragen en aanbod. Er is nog geen gedeelde chat tussen apparaten of leden.
- **Mijn plek:** een persoonlijke pagina met eigen introductie, aanvullende verhalen of beelden en externe vindplaatsen. De editor heeft eenvoudige rijke tekstopmaak (vet, cursief, onderstrepen, kopjes, lijsten en veilige links); aanvullende onderdelen en contactvoorkeuren zijn vrijwillig.
- **Eigen gebied:** voer vier cijfers of een volledige Nederlandse postcode in. Alleen de vier cijfers worden gebruikt en opgeslagen. De kaart haalt de grens van dat PC4-gebied op; pas wanneer je zichtbaarheid inschakelt, wordt je profiel bij dat gebied getoond. Dit is geen exacte woonlocatie.

Geen afzonderlijk Ontdek-tabblad, profielscores, aanbevelingsalgoritme, vind-ik-leuks, verplicht intern berichtensysteem of profielvolledigheidsmeter.

## Lokaal starten

Vereist: Node.js 22 en npm.

```bash
npm install
npm run dev
```

Open het lokale adres dat Vite toont. Voor een technische controle:

```bash
npm run check
npm run build
```

De demo gebruikt SvelteKit, TypeScript en OpenLayers. De interface is primair Nederlandstalig.

## Privacy en grenzen van deze demo

De eigen inhoud wordt lokaal in de browser opgeslagen onder `onder-elkaar-demo-v1`. Bijdragen en profielwijzigingen zijn **niet zichtbaar voor andere gebruikers**; de vier proefpersonen in 5041 zijn geen echte accounts. De knop om voorbeelden te herstellen wist ook eigen demo-inhoud in deze browser.

Een PC4-gebied is niet hetzelfde als een officiële wijk- of buurtgrens. Voor gebiedscontouren wordt een externe Esri Nederland-kaartdienst gebruikt; kaarttegels komen van OpenStreetMap. Het opzoeken van een postcodegebied vereist dus een netwerkverbinding en deelt de opgevraagde PC4-code met de dienst. Afbeeldingen blijven beperkt tot kleine lokale bestanden. De rich-text-editor is een proef met gefilterde HTML, geen productieklare multi-userbeveiliging.

Voor echte deelnemers zijn server-side authenticatie, autorisatie, moderatie, privacyafspraken, mediaopslag en een robuust contentbeveiligingsmodel noodzakelijk.

## Documentatie en bijdragen

- [PRODUCT.md](PRODUCT.md) — **actuele** productafspraken, scheiding tussen demo en toekomstige mogelijkheden.
- [ARCHITECTURE.md](ARCHITECTURE.md) — **actuele** technische implementatie en beperkingen.
- [CONTRIBUTING.md](CONTRIBUTING.md) — werkwijze, documentatieplicht bij wijzigingen en review.
- [docs/ontwerpgeschiedenis.md](docs/ontwerpgeschiedenis.md) — historische besluiten, inclusief inmiddels vervallen richtingen.

Voor een functionele wijziging moeten de relevante documenten in dezelfde PR worden bijgewerkt, of moet een beheerder expliciet vastleggen waarom dat niet nodig is. De CI controleert dit. Zo voorkomen we dat de README opnieuw achterblijft.

> De repository is openbaar. Commit geen persoonsgegevens van echte proefdeelnemers, adressen, tokens of geheime sleutels.

### Profielfoto en gebiedsnaam
Bij **Mijn plek** kun je optioneel een profielfoto kiezen, direct onder je naam. De browser maakt daarvan een kleine vierkante JPEG die lokaal wordt bewaard en als thumbnail terugkomt in de postcodepersonenlijst en bij bijdragen. Zonder foto gebruikt krtkrt initialen; een foto is geen voorwaarde om mee te doen. De foto wordt niet naar een server geüpload.

De interface probeert bij een PC4-gebied een herkenbare **plaats-/gebiedsnaam** te tonen met gegevens van de PDOK Locatieserver. Als de naam niet betrouwbaar kan worden vastgesteld, blijft `Gebied 5041` (of de gekozen andere PC4) zichtbaar. Een PC4 is niet één-op-één een officiële wijk.

## Docker: dezelfde basis op Windows en Raspberry Pi

De eerste **infrastructuurproef** staat in [infra/README.md](infra/README.md). Via Docker Compose start je dezelfde statische webinterface en een **lege PocketBase-backend**, afzonderlijk op een Windows-home-pc (Docker Desktop/WSL2) of Raspberry Pi OS Lite 64-bit.

Vanaf de repository-root op Windows:

```powershell
docker compose -p krtkrt-dev -f infra/compose.yaml -f infra/compose.dev.yaml up --build -d
```

Open daarna http://localhost:8080. Een test van het backendproxy-pad is http://localhost:8080/api/health. **Dit bouwt alleen de infrastructuur:** aanmelden, uitnodigingen, kringen met rechten en gedeelde profielen werken nog niet. De bestaande applicatie gebruikt nog uitsluitend browseropslag. Het Pi-startcommando, opslagafspraken, stopcommando's en veiligheidsgrenzen staan in de aparte handleiding.

## Kringen als zelfstandig vertrekpunt (conceptdemo)

De tab **Kringen** bevat nu drie fictieve verbanden: een schilderklasje en twee bands. Je kunt iedere kring openen en daar de eigen bijdragen en gesprekken lezen of lokale demobijdragen plaatsen. Oude schildergroepgesprekken blijven leesbaar. Vanuit de kring kan de bezoeker **Bekijk op kaart** kiezen: het schilderklasje heeft één denkbeeldige ontmoetingsplek, Band A twee denkbeeldige activiteiten en Band B nadrukkelijk **geen** kaartlocatie. Dat laatste is geen ontbrekend profielveld.

Op de algemene buurtkaart verschijnen alleen buurtbijdragen, geen kringgebonden berichten als verzonnen geografische punten. Je eigen persoonlijke pagina verwijst naar de drie proefkringen. Alle lidmaatschappen, bijdragen en locaties zijn uitsluitend fictieve frontendvoorbeelden. Er is **geen** echte kringautorisatie, geen automatisch tonen van ledenlocaties en geen werkend account.

## Natuurlijker verloop binnen kringen

De kringpagina toont nu één doorlopende stroom met vragen, aanbod, gedachten en gesprekken in chronologische volgorde. Het schrijfvlak staat vooraan: kies daar of je een gesprek begint, een vraag stelt, iets aanbiedt of een gedachte deelt. Voor gesprekken kun je desgewenst een onderwerp/kanaal kiezen. Via subtiele filters zijn losse gespreksonderwerpen terug te vinden; `Alles` toont de hele kringstroom. De kaart met fictieve activiteiten blijft bereikbaar via `Plekken en activiteiten` maar onderbreekt niet langer de kringconversatie.

Bestaande demobijdragen en schildergroepberichten blijven behouden. Nieuwe bijdragen blijven lokale browserdemo-data en zijn geen werkelijk afgeschermde groepscommunicatie.

## Reacties en praktische voortgang binnen kringen

Een nieuwe bijdrage in een kring is nu één basisvorm, met een optioneel karakter (gesprek, vraag, aanbod of gedachte). Iedere bijdrage kan **rechtstreeks reacties** krijgen. Antwoorden verschijnen onder de oorspronkelijke bijdrage, niet als losse items in de kringstroom. Bij praktische vragen of aanbod kan de **eigen auteur** desgewenst aangeven of die nog openstaan of inmiddels geregeld zijn, zonder de reacties te sluiten. Vanuit een bestaande bijdrage kan iemand een **nieuw idee** beginnen, met een verwijzing naar het eerdere gesprek.

Oude schildergroepberichten blijven leesbaar naast nieuwe bijdragen. De nieuwe reacties worden uitsluitend in de lokale browserdemo opgeslagen, niet gedeeld met echte andere gebruikers. Herstel voorbeelden wist ook nieuwe lokale reacties.

## Schrijven en antwoorden zonder verplichte indeling

In de kring begint iemand nu direct met schrijven. Een bijdrage hoeft **niet** vooraf als 'gesprek', 'vraag', 'aanbod' of 'gedachte' te worden gekozen; een aanduiding kan optioneel worden toegevoegd via **Eventueel aanduiden**. Berichten zonder aanduiding krijgen geen zichtbaar soortlabel. Oude kanaalfilters en dubbele tussenkoppen zijn uit de kringstroom verdwenen, maar bestaande berichten en hun kanaalnamen blijven leesbaar. Bij **Reageren** verschijnt ook het invoerveld direct in de inspringende gespreksdraad, zelfs als er nog geen reacties zijn. De oorspronkelijke bijdrage blijft op het hoofdniveau, de antwoorden staan eronder.
