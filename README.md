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
