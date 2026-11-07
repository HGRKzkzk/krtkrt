# Codex — vervolgopdrachten

De eerste code-import (PR #2) en de navigatie-/profielreparatie (PR #4) zijn afgerond. Dit document is bijgewerkt omdat de eerdere opdracht uitging van een afzonderlijk tabblad **Ontdek**, dat door een later productbesluit is vervallen.

## Actuele productrichting
- Hoofdnavigatie: **Kaart**, **Kringen**, **Mijn plek**.
- Ontdekking ontstaat **impliciet** via de bijdragen, profielen en ontmoetingen van mensen.
- Geen afzonderlijke route-editor, geen Culturele Match-scores en geen expliciete verplichting om verbanden te leggen.
- Vrije persoonlijke expressie, inclusief tegenstrijdigheid en afkeer, blijft essentieel.
- Externe verwijzingen mogen belangrijker zijn dan interactie binnen de hub.

## Bij nieuwe codewijzigingen
1. Lees `PRODUCT.md`, `ARCHITECTURE.md` en `AGENTS.md`.
2. Voer `npm install`, `npm run check` en `npm run build` uit.
3. Test drie primaire tabbladen, kaartmarkers, profielbewerking en berichten; geen regressie in lokale opslag.
4. Houd alle testdata fictief. Bewaar geen privéadressen of gevoelige gegevens.
5. Maak kleine reviewbare PR's; merge niet automatisch.

De huidige demo gebruikt browseropslag, **geen** echte accounts, gedeelde chat of serverafgedwongen rechten.