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
