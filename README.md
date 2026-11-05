# MagicQ sACN-sender

Een Node.js-script dat via sACN (E1.31) DMX-data naar MagicQ PC stuurt. MagicQ geeft die data via de MagicDMX-dongle door aan de lamp. Standaard zet het script een moving head (Ayra) op blauw.

## Vereisten

- Node.js 18 of nieuwer. Dat staat ook in `engines` in [package.json](package.json). Er zijn geen npm-pakketten nodig: het script gebruikt alleen de ingebouwde modules `node:dgram` en `node:crypto`. Zet die niet in `dependencies`, want de npm-pakketten met dezelfde naam zijn een leeg placeholder-pakket (`dgram`) en een verouderd pakket (`crypto`).
- MagicQ PC draait op dezelfde computer, met een MagicDMX-dongle.

## Starten

```
npm start
```

Het script verstuurt elke seconde een sACN-pakket. Stoppen doe je met `Ctrl+C`. Na het stoppen neemt MagicQ het universe binnen een paar seconden weer over.

## Configuratie van het script

Bovenaan [index.js](index.js):

| Constante | Standaard | Betekenis |
|---|---|---|
| `UNIVERSE` | `100` | sACN-universe. Moet gelijk zijn aan **In uni** in MagicQ. |
| `LOCAL_IP` | `192.168.0.121` | IP-adres van de netwerkkaart van deze pc. |
| `TARGET` | `239.255.0.100` | Multicastadres. Wordt automatisch berekend uit `UNIVERSE`. |
| `START_ADDRESS` | `1` | DMX-startadres dat op de lamp is ingesteld. |
| `COLOR_INTERVAL_MS` | `5000` | Om de hoeveel milliseconden de kleur wisselt. |

In de tabel `CH` staat de kanaalindeling van de fixture. Elk kanaal is een offset vanaf het startadres. Het echte DMX-adres is dus `START_ADDRESS + offset`.

| Offset | Fixturekanaal | Functie | Waarde |
|---|---|---|---|
| 0 | 1 | Pan | 128 (midden) |
| 1 | 2 | Pan fine | 0 |
| 2 | 3 | Tilt | 128 (midden, recht naar boven zoals bij Locate) |
| 3 | 4 | Tilt fine | 0 |
| 4 | 5 | Pan/tilt-snelheid | 0 (snelst) |
| 5 | 6 | Dimmer | 255 |
| 6 | 7 | Shutter | 255 |
| 7–10 | 8–11 | Rood, groen, blauw, wit | uit `COLORS` |

### Ander startadres

Met **Test = Input** stuurt MagicQ de binnenkomende kanalen ongewijzigd door. De patch in MagicQ heeft daar geen invloed op. Als je het startadres op de lamp verandert, moet je daarom ook `START_ADDRESS` in het script aanpassen, naar hetzelfde getal.

De lamp wisselt elke `COLOR_INTERVAL_MS` (standaard 5000 ms) naar de volgende kleur in `COLORS`. Standaard is dat blauw → rood → blauw. Een kleur toevoegen doe je door een regel toe te voegen met `rgbw: [rood, groen, blauw, wit]`.

Deze indeling gaat ervan uit dat de Ayra op DMX-adres 1 gepatcht is. Bij een ander startadres schuiven alle kanalen op.

## Configuratie van MagicQ

Open **Setup → View Settings → Network** en controleer:

- **IP address:** `192.168.0.121`, het adres van de netwerkkaart van deze pc.

Open **Setup → DMX I/O** en stel in:

| Uni | Status | Out type | Out uni | In type | In uni | Test | Copy |
|---|---|---|---|---|---|---|---|
| 1 | Enabled | Art-Net | Art 0 | Art-Net | Art 0 | **None** | **Uni 10** |
| 10 | Enabled | Art-Net | Art 9 | **sACN** | **100** | **Input** | No |

- **Universum 10** is het universe waarin de lamp gepatcht is. De sACN-input van het script komt hier binnen.
- **Test = Input** betekent dat alle 512 binnenkomende kanalen direct naar de output gaan. Zolang het script draait, heeft wat je in MagicQ programmeert voor dit universe geen effect.
- Kies **Test = Merge** als MagicQ en het script samen moeten werken. Per kanaal wint dan de hoogste waarde (HTP). Let op: als MagicQ zelf rood op 255 heeft, krijg je met Merge rood plus blauw, dus magenta.
- **Universum 1** wordt door de MagicDMX-dongle uitgestuurd en is een kopie van universum 10. Laat **Test** op **None** staan. Op **Input** vult MagicQ dit universe met de (lege) Art-Net-input, en dan blijft de lamp donker.

### Controleren of de input binnenkomt

Kijk in DMX I/O, op de regel van universum 10, naar deze kolommen:

- **In last rx:** tijd sinds het laatste pakket. Zolang het script draait hoort dit onder 1 seconde te blijven.
- **In IP:** het afzenderadres. Hier hoort `192.168.0.121` te staan. `0.0.0.0` betekent dat er nooit iets is ontvangen.
- **In max gap:** de grootste pauze tussen twee pakketten. Rond 1 seconde is normaal.
- **In conflicts:** loopt op als meerdere bronnen op hetzelfde universe zenden.

## Bevindingen

Wat niet werkte en waarom:

1. **ChamSys Remote Ethernet Protocol (UDP-poort 6553).** Dit werkt niet met een MagicDMX Basic. Een MagicDMX ontgrendelt MagicQ niet, dus MagicQ blijft in Demo Mode. In Demo Mode is het Remote Control Protocol uitgeschakeld. Daarnaast bedient dit protocol alleen playbacks, en geen losse kanalen van een fixture.
2. **Poort 6553 binden.** Dit gaf de fout `EADDRINUSE`, omdat MagicQ die poort zelf al gebruikt.
3. **Art-Net vanaf dezelfde pc.** MagicQ ontving niets. **In last rx** bleef 0 en **In IP** bleef `0.0.0.0`. Getest:
   - naar `192.168.0.121`, `127.0.0.1` en broadcast `192.168.0.255`
   - vanaf het tweede adres van de pc, `172.18.192.1`
   - op universe 9 en universe 100

   De pakketten zelf waren geldig; dat is gecontroleerd met een eigen ontvanger. De Windows Firewall stond inkomend UDP voor `mqqt.exe` toe. Vermoedelijk negeert MagicQ Art-Net die van de eigen computer komt. Dit staat niet in de handleiding.
4. **In uni gelijk aan Out uni.** Als **In uni** en **Out uni** van een universe hetzelfde zijn (bijvoorbeeld allebei Art 9), botst de input met de eigen output van MagicQ. De handleiding raadt een apart universe-bereik voor input aan.
5. **Geen Merge-kolom.** Input gaat alleen naar de output via de kolom **Test**, met de waarde **Input** of **Merge**.

Wat wel werkt:

- **sACN via multicast** (`239.255.0.100`, poort 5568) op universe 100, met MagicQ ingesteld op In type sACN, In uni 100 en Test Input. Bij sACN herkent MagicQ een bron aan een unieke ID (CID) in het pakket en niet aan het IP-adres.

## Beperkingen van de MagicDMX Basic

- **Maximaal 5 uur per sessie.** Daarna stuurt de dongle alle kanalen op 0. Om verder te gaan moet je de dongle uit- en weer inpluggen en MagicQ herstarten.
- **Geen remote control.** Playbacks starten via DMX- of netwerkinput werkt niet, en het Remote Control Protocol ook niet.
- **Art-Net/sACN in en uit werkt wel**, voor maximaal 64 universes.

## Bronnen

- [MagicQ Manual – Settings](https://docs.chamsys.co.uk/magicq/1.9.8.x/manual/settings.html) (Input Universes, Testing Output Universes, Merging)
- [MagicQ Software Licensing](https://chamsyslighting.com/software/magicq-software-licensing/)
- [MagicDMX Basic](https://chamsyslighting.com/product/magicdmx-basic/)
- [Blue Room forum – Input artnet to MagicQ](https://www.blue-room.org.uk/index.php?showtopic=62749)
