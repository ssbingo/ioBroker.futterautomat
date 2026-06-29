![Logo](../../admin/futterautomat.png)
# ioBroker.futterautomat

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## futterautomat-adapter voor ioBroker

Besturing voor (omgebouwde) voederautomaten. De adapter schakelt volgens een schema tot
**5 vrij te kiezen schakelaars** (bestaande ioBroker-objecten) voor een instelbare duur in en
weer uit ("voederen"). Optioneel worden lucht- en watertemperatuur meegewogen, en met de
geocoördinaten wordt de zonnestand berekend, zodat er 's nachts niet gevoerd wordt.

### Functies

* Tot 5 schakelaars, elk met een vrij te kiezen naam (= eigen configuratietabblad).
* Twee voedermodi per schakelaar:
  * **Vaste tijden** (bijv. 08:00 en 18:00).
  * **Interval binnen een tijdvenster** (bijv. elke 60 min tussen 08:00 en 18:00).
* Instelbare **voederduur in seconden** per schakelaar.
* **Temperatuurblokkering**: voederen onder of boven vrij te kiezen water- en/of
  luchttemperaturen blokkeren.
* **Nachtbescherming** via zonsopgang/zonsondergang met instelbare offset (ochtend/avond).
* **Handmatige trigger** (`feedNow`) per schakelaar en een **"Nu voeren"-knop** met instelbare
  duur; optioneel met omzeiling van alle blokkeringen.
* **Schakelbewaking** per schakelaar: controleert of de schakelaar daadwerkelijk in- en
  uitschakelt (vereist een schakelaar die zijn status terugmeldt, `ack=true`), met optionele
  **Telegram-meldingen** (succesvol voeren / niet uitgevoerd / uitschakelstoring).

### Configuratie

**Tabblad "Algemene instellingen"**
* **Locatie (verplicht)**: systeeminstellingen gebruiken *of* specifiek instellen – via
  adreszoeken en een markering op een OpenStreetMap-kaart (geen API-sleutel nodig).
* **Zonvenster**: offsets in minuten na zonsopgang / vóór zonsondergang.
* **Temperatuurbronnen**: lucht- en watertemperatuur inschakelen en het betreffende object
  kiezen.
* **Schakelaars**: schakelaars toevoegen (max. 5), namen geven, object selecteren, activeren.

**Tabblad per schakelaar** (dynamisch, met de schakelaarnaam)
* Modus (vaste tijden / interval), tijden of tijdvenster + interval, voederduur,
  temperatuurblokkering, nacht-/handmatige opties, schakelbewaking, Telegram-meldingen,
  handmatige voederknop.

### Datapunten

Globaal:
* `info.connection` – adapter draait / configuratie geldig
* `airTemperature`, `waterTemperature` – actueel gemeten temperaturen
* `sunrise`, `sunset` – berekende tijden

Per schakelaar onder `switches.<id>.`:
* `feedingActive` – voederen bezig
* `lastFeeding`, `nextFeeding` – laatste / volgende voedering
* `blocked`, `blockReason` – momenteel geblokkeerd + reden
* `lastResult`, `error` – resultaat van de laatste poging + storingsvlag
* `feedNow` – handmatige trigger (beschrijfbaar)

> Opmerking: adreszoeken/geocoding (Nominatim) en de kaarttegels vereisen internettoegang.
> Geocoding draait in de adapter-backend; de instantie moet daarvoor draaien.

---

📖 [Hoofddocumentatie (Engels)](../../README.md)
