![Logo](../../admin/futterautomat.png)
# ioBroker.futterautomat

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## futterautomat Adapter für ioBroker

Steuerung für (umgebaute) Futterautomaten. Der Adapter schaltet bis zu **5 frei wählbare
Schalter** (vorhandene ioBroker-Objekte) zeitgesteuert für eine einstellbare Dauer ein und
wieder aus („Fütterung"). Optional werden Luft- und Wassertemperatur berücksichtigt, und über
die Geokoordinaten wird der Sonnenstand berechnet, damit nachts nicht gefüttert wird.

### Funktionen

* Bis zu 5 Schalter, jeweils mit frei wählbarem Namen (= eigener Konfigurations-Tab).
* Zwei Fütterungsmodi je Schalter:
  * **Feste Zeiten** (z. B. 08:00 und 18:00).
  * **Intervall innerhalb eines Zeitraums** (z. B. alle 60 Min zwischen 08:00 und 18:00).
* Einstellbare **Fütterungsdauer in Sekunden** je Schalter.
* **Temperatursperren**: Fütterung unter- bzw. oberhalb frei wählbarer Wasser- und/oder
  Lufttemperaturen blockieren.
* **Nachtsperre** über Sonnenauf-/-untergang mit konfigurierbarem Offset (morgens/abends).
* **Manueller Auslöser** (`feedNow`) je Schalter und ein **„Jetzt füttern"-Button** mit
  wählbarer Dauer; optional unter Umgehung aller Sperren.
* **Schaltüberwachung** je Schalter: prüft, ob der Schalter tatsächlich ein- und ausschaltet
  (benötigt einen Schalter mit Status-Rückmeldung, `ack=true`), mit optionalen
  **Telegram-Benachrichtigungen** (erfolgreiche Fütterung / nicht durchführbar / Störung
  Abschaltung).

### Konfiguration

**Tab „Grundeinstellungen"**
* **Standort (verpflichtend)**: Systemeinstellungen übernehmen *oder* spezifisch festlegen –
  per Adresssuche und Markierung auf einer OpenStreetMap-Karte (kein API-Key nötig).
* **Sonnenfenster**: Offsets in Minuten nach Sonnenaufgang / vor Sonnenuntergang.
* **Temperaturquellen**: Luft- und Wassertemperatur aktivieren und das jeweilige Objekt wählen.
* **Schalter**: Schalter hinzufügen (max. 5), Namen vergeben, Objekt auswählen, aktivieren.

**Tab je Schalter** (erscheint dynamisch, beschriftet mit dem Schalternamen)
* Modus (feste Zeiten / Intervall), Zeiten bzw. Zeitfenster + Intervall, Fütterungsdauer,
  Temperatursperren, Nacht-/Manuell-Optionen, Schaltüberwachung, Telegram-Benachrichtigungen,
  manueller Fütter-Button.

### Datenpunkte

Global:
* `info.connection` – Adapter läuft / Konfiguration gültig
* `airTemperature`, `waterTemperature` – aktuell erfasste Temperaturen
* `sunrise`, `sunset` – berechnete Zeiten

Pro Schalter unter `switches.<id>.`:
* `feedingActive` – Fütterung läuft gerade
* `lastFeeding`, `nextFeeding` – letzte / nächste Fütterung
* `blocked`, `blockReason` – aktuell blockiert + Grund
* `lastResult`, `error` – Ergebnis des letzten Versuchs + Störungs-Flag
* `feedNow` – manueller Auslöser (beschreibbar)

> Hinweis: Adresssuche/Geocoding (Nominatim) und die Kartenkacheln benötigen Internetzugang.
> Das Geocoding läuft im Adapter-Backend; die Instanz muss dafür laufen.

---

📖 [Hauptdokumentation (Englisch)](../../README.md)
