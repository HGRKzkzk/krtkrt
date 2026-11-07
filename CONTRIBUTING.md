# Bijdragen aan krtkrt

Krtkrt is een kleine demo die stap voor stap verandert. Houd niet alleen de code, maar ook de beschrijving van het **daadwerkelijke gedrag** actueel.

## Voor elke PR

1. Controleer of de wijziging gevolgen heeft voor de zichtbare werking, de privacygrenzen, de gegevensopslag of de technische architectuur.
2. Werk de **README.md** bij voor wat bezoekers en ontwikkelaars nu echt kunnen doen.
3. Werk **PRODUCT.md** bij bij een verandering van productprincipes of gebruikersgedrag. Leg vervallen alternatieven desgewenst vast in **docs/ontwerpgeschiedenis.md** in plaats van ze naast actuele keuzes te laten staan.
4. Werk **ARCHITECTURE.md** bij bij technische keuzes, externe afhankelijkheden, datarepresentatie of privacy-/veiligheidsgrenzen.
5. Controleer `npm run check` en `npm run build`; probeer de betreffende flow ook zelf in de browser.
6. Benoem expliciet wat **demo** is en wat in werkelijkheid multi-user, veilig of gepubliceerd is. Doe nooit alsof een client-only zichtbaarheidsschakelaar serverrechten vervangt.

## Automatische documentatieborging

Voor PR's die `src/**` of `package.json` wijzigen controleert CI of ten minste een van **README.md**, **PRODUCT.md** of **ARCHITECTURE.md** in dezelfde PR is gewijzigd. Dit is een minimum, geen inhoudelijke vrijbrief: een wijziging aan het gebruikersgedrag vereist meestal README én PRODUCT.

Voor strikt interne veranderingen die de documentatie niet raken, kan een beheerder de PR-label `docs-not-needed` toevoegen, mits in de PR-beschrijving staat waarom. Gebruik deze uitzondering niet voor gewijzigde interface, gebruikersgedrag, opslag of privacy.

De CI controleert niet of alle beschreven uitspraken correct zijn: dat blijft een reviewtaak.

## Praktische afspraken

Gebruik uitsluitend **fictieve personen** in voorbeelddata. Geen echte adressen, inloggegevens, e-mails, persoonlijke gegevens of sleutels committen. Een PR blijft ter beoordeling open totdat iemand expliciet besluit tot mergen. Nieuwe functies die echte accounts, uitwisseling tussen bezoekers of locatievrijgave vereisen, mogen niet als bestaande mogelijkheden worden beschreven voordat de benodigde serverbeveiliging daadwerkelijk bestaat.
