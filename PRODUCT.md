# Productgrondslag — Onder elkaar

## Doel
Een hub die mensen, bestaande kringen, praktische hulpvragen en persoonlijke betekenissen vindbaar en bespreekbaar maakt. De hub vervangt geen andere sociale netwerken en verwijst juist graag door.

## Uitgangspunten
- Nabijheid is geografisch, sociaal en inhoudelijk; geen van die drie heeft alleenrecht.
- Mensen mogen iets vragen, aanbieden, vertellen of delen zonder prestatieverplichting.
- De kaart is geen inventaris van woningen of bezittingen.
- Kringen zijn afgeschermd waar nodig, maar het grotere netwerk mag niet hermetisch worden.
- Introduceren betekent oprecht voor de toegang instaan, niet verantwoordelijkheid overnemen voor andermans toekomstig handelen.
- Persoonlijke profielen bieden ook ruimte aan ambivalentie, afkeer en onverwachte verwantschap.
- Waardering voor een artiest impliceert geen waardering voor verwante artiesten of genres.
- **Ontdekking is een kwaliteit van de hele hub, geen afzonderlijke bestemming of expliciete route-editor.** Verwantschappen, meningsverschillen en nieuwsgierigheid ontstaan in gesprekken, profielen en bijdragen.
- Verwijzingen tussen bijdragen mogen helpen om verder te kijken, maar mogen nooit suggereren dat het systeem iemands smaak of identiteit definitief kent.
- Externe links zijn een kracht; de hub is geen allesomvattend eindstation.
- Groei, retentie en activiteit zijn geen autonome succesmaten.

## Pilot
Een schildergroep als eerste kring. Binnen die kring kunnen deelnemers materialen delen, vragen stellen, vrij praten, eigen interesses tonen en elkaar gaandeweg op nieuwe gedachten brengen. De eerste openbare code gebruikt uitsluitend fictieve demo-inhoud. Echte deelname volgt alleen na veilige toegangsrechten, privacycontrole en afspraken over moderatie.

## Visuele en interactionele richting — UI 0.2
- **Inhoud eerst.** De gebruiker komt direct in een omgeving waar iets te vinden is; geen welkomsthero of instructies vóór de inhoud.
- Neem het rustige, directe kaartgebruik van de Liedjeskaart van Nederland als referentie, zonder die vormgeving letterlijk te kopiëren.
- Kaart en bijdragen staan in één overzicht; selectie van een marker en van een bijdrage blijft op elkaar aangesloten.
- Gebruik sobere typografie, witruimte en dunne scheidingslijnen; vermijd kaart-in-kaart, badges, schaduwen, herhaald gekleurde panelen en overbodige iconen.
- Een bijdrage-, profiel- of chatformulier verschijnt pas wanneer het nodig is.
- Korte en eerlijke demovermelding blijft aanwezig, maar domineert niet de eerste blik.
- Minimalisme is geen functionaliteitsreductie: externe links, vrije expressie, afkeer, kringen en uitleg over zichtbaarheid blijven mogelijk.
- Toegankelijkheid is leidend: tekstlabels, focusstijlen, betekenisvolle knoppen en responsief gedrag.


## Mijn plek — persoonlijke ruimte (ontwerpbesluit)
Mijn plek is geen profielvolledigheidsopdracht maar een persoonlijke voordeur waar iemand zich op eigen wijze kan uitdrukken. De bezoeker kan er iets van een mens leren kennen; een ontmoeting kan daarna juist buiten krtkrt verdergaan.

- **Vrijwillige, geleidelijke zelfonthulling:** naam alleen is voldoende. Geen verplichte bio, foto, interesses of voltooide profielstappen.
- **Vormvrijheid:** deelnemers kunnen tekst, eigen beeld en verwijzingen toevoegen en naar eigen inzicht ordenen, met een paar duidelijke vormgevingskeuzes. Geen vrije scripts of onveilige HTML.
- **Externe vindplaatsen zijn volwaardig:** Instagram, Bandcamp, een eigen website of iets anders. Geen verplicht intern contactkanaal, geen prikkel om elders actieve mensen binnen de hub te houden.
- **Bereikbaarheid is optioneel:** een deelnemer kan aangeven liever elders of in het echt aangesproken te worden, of geen contactverzoek via het profiel te wensen.
- **Buurt of wijk is vrijwillig:** zelfgekozen wijk/stad als zachte situering, nooit een verplicht woonadres, GPS-positie of publieke woonmarker.
- **Privacy naast zelfonthulling:** de mate van zichtbaar willen zijn is iets anders dan de technische toegang. Deze lokale demo is nog geen afgeschermde multi-useromgeving; er mogen geen echte deelnemersgegevens worden opgeslagen in de repository.
- **Geen template-dwang:** blokken en hun volgorde zijn van de gebruiker. Rustige, bijna lege en uitbundige pagina's zijn allebei volwaardig.

### Eerste technische snede
Een blokkeneditor met verplaatsbare tekst-, afbeeldings- en linkblokken, drie rustige kleurvarianten, drie letterkeuzes, een optionele globale buurtaanduiding en contactvoorkeur. Afbeeldingen worden als kleine lokale databestanden in de browser opgeslagen (maximaal 300 kB per bestand); er is geen uploadservice of publiek profiel. Vrije HTML/CSS, rich media en toegang per kring blijven latere beslissingen.

## Kaart en persoonlijke vindplaatsen — uitbreiding op Mijn plek 0.3
Deelnemers kunnen zelf op de kaart een **globaal gebied** kiezen. De opgeslagen positie wordt meteen naar een grof raster afgerond; de kaart toont een groot gebied in plaats van een pinpoint. Dit is niet bedoeld als de werkelijke woning of als geverifieerde wijkgrens. De instelling blijft vrijwillig; de bestaande zichtbaarheidsschakelaar regelt of de eigen profielmarkering in de lokale demo verschijnt. Een eigen profiel is herkenbaar met een afzonderlijk 'IK'-symbool en vanaf de kaart te openen.

Voor bekende externe platforms zoals Instagram, Bandcamp, YouTube, Facebook, Bluesky, Spotify en LinkedIn leiden we de naam automatisch uit het webadres af. De eigenaar kan een persoonlijke toelichting toevoegen. Voor een onbekende website blijft een vrije naam mogelijk. Standaardiconen worden lokaal getekend, zonder trackers, externe scripts of faviconaanroepen.

Een echte multi-user implementatie vergt aparte autorisatie voor de zichtbaarheid van profielgebieden, ook vóór gegevens naar een client gestuurd worden. De huidige browserdemo is geen echte publieke buurtkaart en levert geen persoonsverificatie.
