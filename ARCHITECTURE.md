# Technische architectuur — huidige browserdemo

Dit document beschrijft de **huidige implementatie** en wordt samen met codewijzigingen onderhouden. De productkeuzes staan in [PRODUCT.md](PRODUCT.md); historisch materiaal staat in [docs/ontwerpgeschiedenis.md](docs/ontwerpgeschiedenis.md).

## Architectuur in het kort

- SvelteKit 2, Svelte 5, TypeScript, Vite en OpenLayers 10; statische build.
- Eén applicatieroute met drie zichtbare ingangen: **Kaart**, **Kringen** en **Mijn plek**.
- De applicatie gebruikt browser-`localStorage` (sleutel `onder-elkaar-demo-v1`) en statische fictieve testgegevens. Geen backend, echte authenticatie of verbinding tussen bezoekers.
- Externe infrastructuur: OSM-tegels en een Esri Nederland ArcGIS FeatureServer voor PC4-vlakken.

## Belangrijkste bestanden

| Bestand | Verantwoordelijkheid |
| --- | --- |
| `src/routes/+page.svelte` | Navigatie, lokale demo-toestand, bijdragen, gesprekskanalen, profielweergave en opslag |
| `src/lib/MapView.svelte` | OpenLayers-hoofdkaart, voorbeeldbijdragen en PC4-groepsmarkeringen met profielenlijst |
| `src/lib/AreaPicker.svelte` | PC4-invoer en grensvoorbeeld; accepteert vier cijfers of volledige Nederlandse postcode |
| `src/lib/mapArea.ts` | PC4-validatie, opslagmodel en ophalen van geografische polygonen |
| `src/lib/demoNeighbours.ts` | Vier uitsluitend fictieve profielen in PC4 5041 |
| `src/lib/demo.ts` | Overige fictieve bijdragen, berichten en oudere voorbeeldnotities |
| `src/lib/PersonalPlace.svelte` | Persoonlijke pagina, rich-text- en mediaonderdelen, links en vrijwillige contact-/locatiekeuze |
| `src/lib/RichTextEditor.svelte`, `src/lib/richText.ts` | Kleine browsereditor en beperkte HTML-sanitatie |
| `src/lib/personalPlace.ts` | Persoonlijke-paginamodel, compatibiliteit met oudere demo-opslag en herkenning van externe platforms |
| `src/lib/types.ts` | Overige domeintypen |

## PC4 en zichtbaarheid

De regio bestaat uit een viercijferige postcode, niet uit een puntlocatie. De gebruiker kan een volledige postcode invoeren; het systeem bewaart alleen PC4. De geometrie wordt als GeoJSON bij de externe kaartdienst opgehaald en als vlak getekend. Eén kaartmarkering per gebied toont het aantal zichtbare profielen in de demo en opent een lijst. De eigen gebruiker staat alleen in de groep als de vrijwillige gebiedszichtbaarheid is ingeschakeld.

PC4 is geen CBS-wijk- of buurtdefinitie. De externe PC4-service kan onbeschikbaar zijn; bij fout ophalen mag geen zelfbedacht gebied worden gesuggereerd. De kaartdienst ontvangt de opgevraagde vier cijfers. **De client-only zichtbaarheidsschakelaar is geen productie-autorisatie.**

## Eigen pagina en opslag

Persoonlijke pagina's volgen een vaste redactionele presentatie en hebben optionele extra tekst-, beeld- en linkonderdelen. De editor ondersteunt beperkte rijke HTML (bijvoorbeeld kopjes en vet/cursief); de inhoud wordt gefilterd voordat die als HTML wordt weergegeven. JavaScript, inline styles en willekeurige HTML zijn geen toegestane profielinhoud. Plakken in de editor gebeurt als platte tekst. De huidige minimale editor gebruikt browserfunctionaliteit die voor productie opnieuw moet worden beoordeeld.

Afbeeldingen zijn kleine data-URL's in lokale browseropslag (maximaal 300 kB per bestand). De beschikbare opslagruimte verschilt per browser. Oude demo-tekst kan in het huidige model worden overgenomen. De browsergegevens blijven alleen op hetzelfde apparaat/in dezelfde browser beschikbaar en worden door de knop *Herstel voorbeelden* gewist.

## Grenzen van het prototype

De fictieve personen in 5041 hebben geen accounts. Kringgesprekken en profielgegevens zijn niet veilig tussen meerdere echte gebruikers gescheiden. Er bestaat geen server-side verificatie van toestemming, zichtbaarheid, identiteiten, berichten of gedeelde bestanden. Gebruik daarom geen echte ledengegevens of persoonlijke testadressen.

Voor een volgende fase zijn onder andere nodig: server-side identiteits- en autorisatiemodel, scheiding kring/openbaar, inhoudsvalidatie op de server, mediabeheer, verwijderbaarheid, privacybeleid en moderatie.

## Onderhoud en documentatiecontrole

Bij een PR met wijzigingen aan de applicatiebron (`src/**`) of `package.json` moet ten minste één van **README.md**, **PRODUCT.md** of **ARCHITECTURE.md** zijn bijgewerkt. Voor uitsluitend interne wijzigingen kan een beheerder expliciet de PR-label `docs-not-needed` toepassen; de motivatie hoort dan in de PR-beschrijving. Daarnaast is er een PR-template die vraagt welke contracten, privacykeuzes en voorbeelden geraakt worden. Zie [CONTRIBUTING.md](CONTRIBUTING.md).

Dit is een onderhoudscontrole, geen garantie dat elk beschreven feit automatisch inhoudelijk juist is: reviewers blijven verantwoordelijk voor de correspondentie tussen code, gedrag en documentatie.

## Avatar- en gebiedslabels
Het optionele `personalPlace.avatar` bevat in deze browserdemo een vierkant uitgesneden, verkleinde JPEG-data-URL van circa 160×160 pixels; de invoer accepteert JPG, PNG en WebP tot 5 MB. Het opgeslagen resultaat is op lengte begrensd. De herbruikbare component `src/lib/Avatar.svelte` toont het lokale beeld of anders initialen. Dezelfde bron wordt aan de PC4-groepslijst en eigen bijdragen doorgegeven. Er is **geen serverupload of gedeeld gebruikersprofiel**.

`src/lib/mapArea.ts` vraagt voor een bestaande PC4 optioneel een plaatslabel op via de PDOK Locatieserver; alleen wanneer de gevonden plaatsnaam eenduidig bij die vier cijfers hoort wordt deze gebruikt. Anders verschijnt het neutrale PC4-label. De postcodegrenzen blijven van Esri komen. Het externe PDOK-verzoek deelt de gekozen PC4-code, niet een adres.

## Draagbare Docker Compose-infrastructuur (eerste fase)

`infra/compose.yaml` definieert dezelfde twee services voor development en Raspberry Pi: **web** (SvelteKit statisch gebouwd en door Nginx geserveerd) en **backend** (gepinde PocketBase 0.40.6 met SQLite). De bestanden `infra/compose.dev.yaml` en `infra/compose.pi.yaml` voegen alleen omgevingsspecifieke instellingen toe. `infra/Dockerfile.web` en `infra/pocketbase/Dockerfile` werken met Docker Linux amd64 en arm64; Compose bouwt momenteel lokaal voor het hostplatform. De Pi 3 B+ vereist Raspberry Pi OS Lite 64-bit.

Nginx stuurt uitsluitend `/api/` naar PocketBase door; `/_/` wordt via de webpoort geweigerd. De webpoort is op de host beperkt tot `127.0.0.1:8080`. Development stelt de PocketBase-beheerpoort alleen op `127.0.0.1:8090` beschikbaar; Pi niet. Externe HTTPS/tunnel is **nog niet opgenomen**.

De PocketBase-data staan buiten de container in een per omgeving geconfigureerde map (`PB_DATA_DIR`) en zijn uitgesloten van Git. Development en Pi gebruiken verschillende projectnamen en opslag. De eerste backend bevat nog **geen appcollecties, uitnodigingen of accountintegratie**; de huidige frontend houdt haar lokale demogedrag.

Voor de pilot volgt nog: migratieschema, uitnodigings- en registratieflow, gebruikers- en kringrechten, databaseback-ups met hersteltest, imageversies/digests, reproduceerbare CI ARM64-images en beveiligde externe toegang. Installatie en testprocedure: [infra/README.md](infra/README.md).

## Conceptproef: meerdere kringen en contextkaarten

`src/lib/demoCircles.ts` definieert drie fictieve kringen met eigen ID, ledennamen, kanalen en **optionele activiteiten met expliciete voorbeeldcoördinaten**; een kring is geen geografisch object. `src/lib/CircleMap.svelte` tekent uitsluitend locaties die bij de geopende kring als activiteit zijn opgegeven. Als er geen locaties bestaan, toont de UI een gewone uitleg in plaats van een kunstmatige marker.

`src/routes/+page.svelte` toont een kringenoverzicht, actieve kring met bijdragen en kanaalgesprekken, en een omschakeling naar de contextkaart. Nieuwe demo-berichten bewaren optioneel `circle`; historische berichten zonder die eigenschap blijven in de schildergroep zichtbaar. De bestaande opslag onder `onder-elkaar-demo-v1` blijft behouden. De algemene buurtkaart filtert voortaan op `visibility === 'buurt'`; kringinterne berichten krijgen **geen** willekeurige kaartpositie. De kaartcoördinaten van de nieuwe activiteiten zijn uitsluitend verzonnen demo-voorbeelden en mogen niet voor echte optredens of afspraken worden aangezien.

Deze frontendproef heeft geen echte uitnodigingen, lidmaatschappen of autorisatie. 'Alle drie de kringen' is alleen een demo-aanname, geen accountmodel of toegangsbesluit.

## Kringstroom als gecombineerde presentatielaag

De bestaande `Post`- en `Message`-objecten blijven voorlopig bestaan voor compatibiliteit met `onder-elkaar-demo-v1`. In `src/routes/+page.svelte` worden ze voor de actieve kring in een tijdelijke, getypeerde presentatiestroom gecombineerd en op tijd gesorteerd. Het kanaalfilter toont bij een specifiek onderwerp alleen gespreksberichten uit dat kanaal; `Alles` omvat ook vragen, aanbod en gedachten. Het schrijfvlak kiest op basis van het type tussen de bestaande `addMessage`- en `addPost`-route. Geen gegevensmigratie, geen ranking, geen backend.

## Reacties, toestand en herkomst in de kringdemo

`Post.kind` omvat nu ook `gesprek`; alle **nieuwe** kringbijdragen gebruiken het bestaande `Post`-model. `Post.state` is optioneel (`open`/`geregeld`) en alleen door de auteur in de browserinterface te wijzigen voor `vraag` of `aanbod`. `Post.originId` kan verwijzen naar een bestaande kringbijdrage (prefix `post-` of `message-`). `CircleReply` legt antwoorden vast als aparte objecten met `parentId`, zonder ze in de hoofdtijdlijn te plaatsen. De component `src/lib/CircleDiscussion.svelte` presenteert reacties en praktische toestand binnen de gecombineerde kringstroom.

In `onder-elkaar-demo-v1` wordt daarvoor een optionele `replies`-array toegevoegd. Oudere opgeslagen data zonder `replies` krijgen fictieve voorbeeldreacties en historische `Message`-records blijven leesbaar als bijdrage. Er is geen backend, geen echte gebruikerstoestemming of productieautorisatie. De scheiding van kringgegevens wordt alleen in de browser gesimuleerd.
