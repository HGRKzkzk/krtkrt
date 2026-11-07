# Productafspraken — krtkrt

Dit document beschrijft de **huidige productrichting**, niet alle eerdere experimenten. Eerdere tekstversies zijn bewaard in [de ontwerpgeschiedenis](docs/ontwerpgeschiedenis.md). Wat momenteel werkelijk werkt staat in [README.md](README.md); hoe het werkt staat in [ARCHITECTURE.md](ARCHITECTURE.md).

## Doel en houding

Krtkrt brengt mensen, kringen, praktische vragen, aanbod en persoonlijke verhalen op een toegankelijke, geografisch georiënteerde manier bij elkaar. Het is geen platform om mensen zo lang mogelijk vast te houden: een ontmoeting buiten krtkrt kan juist een goed resultaat zijn.

- Mensen mogen vragen, aanbieden, vertellen of twijfelen, zonder prestatieverplichting of sociaal beoordelingssysteem.
- Nabijheid is geografisch, sociaal én inhoudelijk; geen van die aspecten reduceert de andere.
- Geen likes, persoonsscores, profielvolledigheid, gepushte engagementprikkels of dwingende aanbevelingen.
- Ontdekking ontstaat vanuit bijdragen, kringen en personen; er is geen afzonderlijk Ontdek-tabblad en geen sociaal-grafiekeditor.
- De eerste gedeelde proef moet klein en veilig kunnen beginnen, zonder een gesloten genootschap als einddoel.

## Mijn plek

**Een persoonlijke pagina, niet een formulier dat moet worden afgevinkt.** Een eigen gekozen naam mag genoeg zijn. De deelnemer beslist wat, wanneer en in welke mate iets van zichzelf zichtbaar wordt.

De huidige richting is een **herkenbare redactionele opbouw**: naam, een vrije introductie, eventueel aanvullende verhalen of beelden, verwijzingen naar andere plekken en een vrijwillige contactvoorkeur. De tekst kan eenvoudig rijk worden opgemaakt. Deelnemers hoeven niet een compleet ontwerp van nul af te bouwen; eigen woorden en afbeeldingen geven de pagina karakter.

- Een Instagram-, Bandcamp- of andere externe link mag een volwaardige uitnodiging zijn. Bekende platforms worden waar mogelijk aan het webadres herkend.
- Zichtbaar zijn is niet hetzelfde als bereikbaar moeten zijn. Deelnemers hoeven geen intern contactkanaal te kiezen.
- Persoonlijke zelfonthulling, lokale herkenbaarheid en bereikbaarheid zijn afzonderlijke keuzes.
- Geen verplicht profielbeeld, interesseschema, woonadres of stappenplan.
- De experimentele browsereditor is **geen** algemene HTML/CSS-/script-editor; alleen beperkte, gefilterde opmaak is toegestaan. Voor een echte publieke toepassing moeten de veiligheids- en onderhoudseisen opnieuw worden beoordeeld.

## Geografie: PC4

Het gedeelde geografische niveau is een **vrijwillig gekozen viercijferig postcodegebied (PC4)**, niet een woonpunt. Wie een volledige Nederlandse postcode invoert, gebruikt daarvan alleen de vier cijfers. Het zelf invullen van een vrije wijknaam was dubbelop en is geen onderdeel van de huidige profielbewerking.

PC4-grenzen worden uit een externe postcodevlakdienst geladen en zijn niet identiek aan de formele CBS-wijk- of buurtgrenzen. Deelnemers bepalen afzonderlijk of zij hun gebied zichtbaar maken.

Meerdere zichtbare profielen in één PC4-gebied worden gegroepeerd:
- Eén markering met een aantal per gebied, geen kunstmatige losse persoonslocaties.
- Klikken toont een personenlijst. De eigen gebruiker staat daar **voor zichzelf** bovenaan, met een rustige visuele onderscheiding; dit is geen algemene rangorde.
- Bij het verbergen van het eigen gebied verdwijnt het profiel uit de groep.
- Het tonen van exacte aantallen in kleine groepen is voor een echte pilot een afzonderlijke privacyafweging.

## Kringen en bijdragen

De demo toont een schildergroep met voorbeeldkanalen, oproepen, gesprekken en bijdragen. Een echte kring heeft later afspraken nodig over toegang, delen buiten de kring en moderatie. Die rechten kunnen pas werkelijk bestaan met een server-side autorisatiemodel. De huidige kringpresentatie is daarom **niet** afgeschermd tussen echte gebruikers.

## Huidige scope versus later

**Wel nu:** browserdemo, fictieve oproepen en gesprekken, persoonlijke pagina, lokale bewerking en opslag, PC4-vlakken, gegroepeerde proefprofielen (vier in 5041), optionele zichtbaarheid en eenvoudige rich-text-opmaak.

**Niet nu:** echte accounts, publieke profielen tussen gebruikers, gedeelde live chat, externe mediahosting, toegangsrechten per kring, moderatiedashboard, aanbevelingsalgoritme, betalingen of notificaties.

Voor een echte proef met mensen eerst: identiteit en toegang, autorisatie, contentbeveiliging, veilige opslag, verwijdering en toestemming, beheer- en moderatieafspraken, en beoordeling van geografische privacy.

## Wijzigingsdiscipline

Dit document bevat de huidige normatieve keuzes. Gedane experimenten en vervallen richtingen gaan naar [docs/ontwerpgeschiedenis.md](docs/ontwerpgeschiedenis.md), niet als tegenstrijdige paragrafen achteraan dit bestand. Bij veranderingen aan zichtbaar productgedrag worden **README.md** en dit document opnieuw beoordeeld; bij technische wijzigingen **ARCHITECTURE.md**. De PR-template en CI-check maken die beoordeling verplicht.
