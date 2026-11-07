# krtkrt lokaal en op de Raspberry Pi

Dit is de **infrastructurele proef**, nog geen werkende uitnodigings-/accountimplementatie. De frontend blijft in localStorage werken. PocketBase start met een **lege database**; er zijn nog geen applicatiecollecties, gebruikers of beveiligde kringen ingericht.

## Vooraf

Docker Engine en Docker Compose v2 op Linux/Raspberry Pi OS Lite 64-bit, of Docker Desktop met WSL2/Linux-containers op Windows. Op een Raspberry Pi 3 B+ is **64-bit** vereist. Gebruik een recente Docker-versie. Er is geen Node-installatie nodig om de containers te draaien.

In de repository-root:

### Windows home-pc (PowerShell)

```powershell
docker compose -p krtkrt-dev -f infra/compose.yaml -f infra/compose.dev.yaml up --build -d
docker compose -p krtkrt-dev -f infra/compose.yaml -f infra/compose.dev.yaml ps
```

Website: http://localhost:8080. PocketBase beheer is lokaal bereikbaar op http://localhost:8090/_/. Maak alleen een **fictief** lokaal beheerdersaccount aan. De frontend gebruikt die API nog niet. PocketBase-data staan in de niet-gecommitte map `data/pocketbase`.

### Raspberry Pi 3 B+ (SSH-terminal)

Gebruik Raspberry Pi OS Lite **64-bit**, sluit de Pi bij voorkeur via Ethernet aan en installeer Docker Engine en Compose. Zet de data bij voorkeur op een externe, betrouwbaar gemounte USB-SSD. Zet dan `PB_DATA_DIR=/mnt/krtkrt-data/pocketbase` in een lokaal `infra/.env` (kopie van `infra/.env.example`). Maak de directory vooraf aan en controleer de toegangsrechten van Docker.

```bash
docker compose -p krtkrt-pi --env-file infra/.env -f infra/compose.yaml -f infra/compose.pi.yaml up --build -d
docker compose -p krtkrt-pi --env-file infra/.env -f infra/compose.yaml -f infra/compose.pi.yaml ps
```

Zonder `infra/.env` kun je de `--env-file infra/.env` argumenten weglaten; dan gebruikt Compose de standaardlocatie `data/pocketbase` (niet aanbevolen als dat op de microSD is). **De Pi-configuratie opent geen PocketBase-beheerpoort.** Voor onderhoud kan tijdelijk een SSH-tunnel naar de interne backend gebruikt worden, of de `pocketbase superuser` CLI binnen de container. Stel nooit zomaar `8090` beschikbaar op het netwerk.

De webserver luistert op de host uitsluitend op `127.0.0.1:8080`. Voor toegang vanaf een ander apparaat of internet is **apart geconfigureerde** netwerktoegang (bijvoorbeeld een gecontroleerde tunnel) nodig. Deze PR levert bewust nog geen publieke domein- of Cloudflare-configuratie.

## Inspecteren en stoppen

```bash
docker compose -p krtkrt-dev -f infra/compose.yaml -f infra/compose.dev.yaml logs --tail=100
docker compose -p krtkrt-dev -f infra/compose.yaml -f infra/compose.dev.yaml down
```

Gebruik op de Pi de Pi-bestanden en projectnaam. `down` verwijdert containers en het netwerk, **niet** de data in `PB_DATA_DIR`. Verwijder de map met databasegegevens nooit als onderdeel van normale deployment.

## Controles

```bash
docker compose -f infra/compose.yaml -f infra/compose.dev.yaml config --quiet
docker compose -f infra/compose.yaml -f infra/compose.pi.yaml config --quiet
```

Controleer na opstarten `http://localhost:8080` (frontend) en `http://localhost:8080/api/health` (backend via proxy). Alleen op de home-pc is de admin-UI beschikbaar op localhost:8090.

## Belangrijke grenzen

- Er zijn **geen echte accounts, uitnodigingstokens of kringrechten**; PocketBase is nog niet verbonden met de SvelteKit-demo.
- De database en eventuele toekomstige uploads vereisen **aparte back-ups buiten de Pi**. Kopieer niet achteloos een live SQLite-bestand; gebruik een consistente back-upmethode en test herstel.
- Deel nooit de `/_/`-beheerinterface publiek, commit geen credentials, zet geen routerpoorten open en gebruik geen echte deelnemersgegevens totdat toegang, HTTPS, herstel en moderatie zijn ingericht.
- Docker-images zijn architectuurspecifiek maar hebben dezelfde bron en Compose-definitie. Houd ontwikkeling en pilot gescheiden met verschillende datamappen, projectnamen en geheimen.
- **Build op de home-pc/CI, niet noodzakelijk op de Pi:** deze eerste fase ondersteunt lokaal `--build` op beide; het bouwen op een Pi 3 B+ kan traag zijn. Een vervolg-PR kan multi-architecture images via GitHub Actions publiceren, zodat de Pi alleen hoeft te pullen.
