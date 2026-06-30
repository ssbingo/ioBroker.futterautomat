![Logo](../../admin/automatic-feeder.png)
# ioBroker.automatic-feeder

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## automatic-feeder Adapter für ioBroker

Dieser Adapter macht aus einem beliebigen, bereits vorhandenen ioBroker-Schalter (einer
Steckdose, einem Relais, einem GPIO-Ausgang …) einen **zeitgesteuerten Futterautomaten**. Er
schaltet den Ausgang zu den von dir festgelegten Zeiten für eine definierte Anzahl Sekunden ein
und kann dabei Temperatur sowie den Tag-/Nacht-Wechsel berücksichtigen, damit nie zur falschen
Zeit gefüttert wird.

Dieses Dokument ist eine vollständige Anleitung. Wenn du den Adapter noch nie benutzt hast,
lies es von oben nach unten – der **Schnellstart** bringt dich in wenigen Minuten zur ersten
Fütterung, der Rest erklärt jede Einstellung im Detail.

---

## Inhaltsverzeichnis

1. [Was der Adapter macht](#1-was-der-adapter-macht)
2. [Voraussetzungen](#2-voraussetzungen)
3. [Installation](#3-installation)
4. [Schnellstart](#4-schnellstart--die-erste-fütterung)
5. [Die Einstellungsseite im Detail](#5-die-einstellungsseite-im-detail)
6. [Objekte / Datenpunkte](#6-objekte--datenpunkte)
7. [Beispiele / Rezepte](#7-beispiele--rezepte)
8. [Telegram-Benachrichtigungen](#8-telegram-benachrichtigungen)
9. [Fehlerbehebung & FAQ](#9-fehlerbehebung--faq)
10. [Logging & Fehlersuche](#10-logging--fehlersuche)

---

## 1. Was der Adapter macht

Eine „Fütterung" ist im Kern ganz einfach: **Ausgang EIN → eine einstellbare Anzahl Sekunden
warten → wieder AUS**. Bei einem umgebauten Futterautomaten läuft in dieser Zeit der Motor und
gibt Futter aus.

Der Adapter verwaltet **bis zu 5 Schalter**, jeder völlig unabhängig und mit einem eigenen
Konfigurations-Tab, der nach dem Schalter benannt ist. Pro Schalter legst du fest:

* **wann** gefüttert wird – entweder zu **festen Zeiten** (z. B. 08:00 und 18:00) oder im
  **Intervall** innerhalb eines Zeitfensters (z. B. alle 60 Minuten zwischen 08:00 und 18:00);
* **wie lange** der Ausgang eingeschaltet bleibt (Fütterungsdauer in Sekunden);
* **ob blockiert** wird, wenn Wasser- oder Lufttemperatur zu niedrig/hoch ist;
* **ob nachts** nicht gefüttert wird (basierend auf dem echten Sonnenauf-/-untergang für deinen
  Standort);
* **ob der Schaltvorgang überwacht** wird (Prüfung, ob wirklich ein- und ausgeschaltet wurde)
  und optional eine **Telegram**-Nachricht zum Ergebnis gesendet wird.

Du kannst eine Fütterung jederzeit **manuell** auslösen – direkt auf der Einstellungsseite
(Button mit frei wählbarer Dauer) oder über einen Datenpunkt (z. B. ein Button in einer
VIS-Ansicht).

> Wichtig: Der Adapter legt den Schalter nicht selbst an. Er **steuert ein bereits vorhandenes
> Objekt** in deinem ioBroker. Dieses Objekt wählst du in der Konfiguration aus.

---

## 2. Voraussetzungen

| Du brauchst | Details |
|-------------|---------|
| **ioBroker** mit aktuellem **admin** (≥ 7) | Die Konfigurationsseite ist mit React umgesetzt. |
| **Ein Schalter-Objekt** | Ein beschreibbarer ioBroker-Datenpunkt, der den Futterautomaten ein-/ausschaltet – z. B. eine Steckdose (`shelly.0.…`, `sonoff.0.…`, `zigbee.0.…`), ein Relais oder eine Skriptvariable. |
| **Geokoordinaten** | Für die Berechnung von Sonnenauf-/-untergang. Entweder aus den ioBroker-Systemeinstellungen oder per Adresse/Karte. **Verpflichtend.** |
| *(optional)* Temperatur-Objekte | Vorhandene Datenpunkte mit Luft- und/oder Wassertemperatur, falls du temperaturabhängig sperren willst. |
| *(optional)* Eine **Telegram**-Instanz | Der offizielle `telegram`-Adapter, eingerichtet und gestartet, falls du Push-Benachrichtigungen möchtest. |
| Internetzugang auf dem ioBroker-Host | Nur für Adresssuche/Karte in der Konfiguration. Der normale Betrieb läuft offline. |

---

## 3. Installation

1. Im ioBroker-**admin** den Reiter **Adapter** öffnen.
2. In der Adapter-Liste **automatic-feeder** suchen und auf **Installieren** klicken.
3. Eine **Instanz** des Adapters anlegen.
4. Die Instanz-Einstellungen öffnen (Zahnrad-Symbol) – es sollte die Konfigurationsseite mit dem
   Tab **Grundeinstellungen** erscheinen. Bleibt sie leer, siehe [Fehlerbehebung](#9-fehlerbehebung--faq).

---

## 4. Schnellstart – die erste Fütterung

Ziel: Ein Schalter soll – sofort, zum Test – 5 Sekunden lang füttern.

1. **Einstellungen öffnen** der automatic-feeder-Instanz.
2. Auf dem Tab **Grundeinstellungen**:
   * Unter **Standort** *Systemeinstellungen übernehmen* lassen, wenn dein ioBroker bereits
     Koordinaten hat. Andernfalls *Standort spezifisch festlegen* wählen, Adresse eingeben,
     **Suchen** klicken und den Marker auf der Karte bestätigen.
   * Nach unten zu **Schalter** scrollen und **Schalter hinzufügen** klicken.
   * Einen **Namen** vergeben (z. B. `Koi-Teich`). Dieser Name wird zum Titel eines eigenen Tabs.
   * Neben **Schalter-Objekt** das Listen-Symbol anklicken und den Datenpunkt wählen, der deinen
     Automaten schaltet (z. B. deine Steckdose). Der Schalter muss **aktiv** sein (Häkchen links).
3. **Speichern** (Diskette/Haken unten). Ein neuer Tab mit deinem Schalternamen erscheint.
4. Diesen **Schalter-Tab** öffnen. Ganz oben unter **Manuelle Fütterung** eine Dauer einstellen
   (z. B. `5` Sekunden) und **Jetzt füttern** klicken. Der Ausgang sollte 5 Sekunden ein- und
   dann wieder ausschalten.
5. Im selben Tab den echten Zeitplan unter **Fütterungsplan** einrichten (z. B. feste Zeiten
   08:00 und 18:00) und die **Fütterungsdauer** unter **Fütterungsvorgang** setzen, dann
   **Speichern**.

Fertig – ab jetzt füttert der Adapter automatisch. Alles Weitere erklärt die Optionen im Detail.

---

## 5. Die Einstellungsseite im Detail

Die Konfiguration hat einen Tab **Grundeinstellungen** sowie **einen Tab pro Schalter** (wird
automatisch angelegt, sobald ein Schalter einen Namen hat). Falls eine Seite nicht scrollt, das
Fenster vergrößern oder die Scrollleiste rechts nutzen – alle Abschnitte sind erreichbar.

### 5.1 Tab „Grundeinstellungen"

#### Standort (verpflichtend)

Der Adapter benötigt deine geografische Position, um Sonnenauf- und -untergang zu berechnen (für
die Nachtsperre). Zwei Möglichkeiten:

* **Systemeinstellungen übernehmen** – nimmt Breiten-/Längengrad aus der ioBroker-Systemkonfiguration
  (empfohlen, wenn dort bereits gesetzt). Die aktuellen Werte werden angezeigt.
* **Standort spezifisch festlegen** – Position selbst bestimmen:
  * Eine **Adresse** eingeben und **Suchen** drücken. Der Adapter löst sie auf (über
    OpenStreetMap / Nominatim) und setzt einen Marker.
  * Oder **auf die Karte klicken** / den **Marker ziehen**, um die genaue Stelle zu wählen.
  * Breiten-/Längengrad können auch direkt eingetragen werden; die Karte folgt.

> Die Adresssuche läuft im Adapter-Backend, daher muss die **Instanz laufen**. Karte und Suche
> benötigen Internetzugang.

#### Sonnenfenster (keine Fütterung nachts)

Legt das Zeitfenster fest, in dem gefüttert werden darf:

* **Minuten nach Sonnenaufgang** – erst so viele Minuten *nach* Sonnenaufgang füttern.
* **Minuten vor Sonnenuntergang** – so viele Minuten *vor* Sonnenuntergang aufhören.

Beispiel: Bei Sonnenaufgang 06:30, Sonnenuntergang 21:00 und Offsets 30 / 30 ist Fütterung nur
zwischen **07:00 und 20:30** erlaubt. Jeder Schalter kann dieses Fenster einzeln beachten oder
ignorieren (siehe *Einschränkungen* im Schalter-Tab). Die berechneten Zeiten stehen außerdem in
den Datenpunkten `sunrise` / `sunset` und werden jede Nacht automatisch neu berechnet.

#### Temperaturquellen

Für temperaturabhängiges Sperren hier die Quellen aktivieren und die Objekte wählen:

* **Lufttemperatur** – Häkchen setzen und den Datenpunkt mit der Lufttemperatur auswählen.
* **Wassertemperatur** – Häkchen setzen und den Datenpunkt mit der Wassertemperatur auswählen.

Sinnvoll sind nur Zahl-Datenpunkte. Die aktuellen Werte werden in die Datenpunkte
`airTemperature` / `waterTemperature` gespiegelt. Die eigentlichen Schwellen werden **pro
Schalter** eingestellt (siehe *Temperatursperre*).

#### Schalter

Die Liste der Futterautomaten (bis zu 5). Pro Eintrag:

* **Aktiv** (Häkchen) – nur aktive Schalter werden geplant.
* **Name** – freier Text; wird zum Tab-Titel des Schalters und zum Kanalnamen im Objektbaum.
* **Schalter-Objekt** – der vorhandene ioBroker-Datenpunkt, der gesteuert wird. Über das
  Listen-Symbol auswählen, über das Kreuz leeren.

Mit **Schalter hinzufügen** legst du einen weiteren an (max. 5), mit dem Papierkorb-Symbol
entfernst du einen. Beim Entfernen werden auch dessen Datenpunkte gelöscht.

### 5.2 Schalter-Tabs

Jeder konfigurierte Schalter erhält einen eigenen Tab mit seinem Namen. Er enthält folgende
Abschnitte.

#### Manuelle Fütterung

* **Dauer der manuellen Fütterung (Sekunden)** – die vom Button verwendete Dauer.
* **Jetzt füttern** – löst sofort eine Fütterung mit dieser Dauer aus. Praktisch zum Testen oder
  für eine Extraportion. (Ob Sperren ignoriert werden, hängt von *Manueller Auslöser ignoriert
  alle Sperren* unter *Einschränkungen* ab.)
* Für den Button muss die Instanz laufen und die Konfiguration **gespeichert** sein.

#### Fütterungsplan

**Einen** Modus wählen:

* **Feste Zeiten** – eine Liste von Uhrzeiten (`HH:mm`). Beliebig viele hinzufügen; der Automat
  läuft täglich zu jeder davon. Beispiel: `08:00` und `18:00`.
* **Intervall innerhalb eines Zeitraums** – wiederholt innerhalb eines Fensters füttern:
  * **Beginn Zeitraum** / **Ende Zeitraum** – z. B. 08:00 bis 18:00.
  * **Intervall (Minuten)** – z. B. 60 → füttert täglich um 08:00, 09:00, … bis zum Fensterende.

Die nächste geplante Zeit steht jederzeit im Datenpunkt `nextFeeding`.

#### Fütterungsvorgang

* **Fütterungsdauer (Sekunden)** – wie lange der Ausgang bei einer geplanten Fütterung EIN bleibt.
* **Ein-Wert** / **Aus-Wert** – die Werte, die in das Schalter-Objekt geschrieben werden.
  Standard sind `true` und `false`, was zu den meisten Steckdosen/Relais passt. Erwartet dein
  Gerät Zahlen oder Text, hier z. B. `1` / `0` oder `ON` / `OFF` eintragen.

#### Temperatursperre

Wird nur für die in den Grundeinstellungen aktivierten Temperaturquellen angezeigt. Pro Schalter:

* **Nach Wassertemperatur sperren** – *Sperren wenn unter* und/oder *Sperren wenn über* (°C).
* **Nach Lufttemperatur sperren** – dasselbe für die Luft.

Liegt die aktuelle Temperatur außerhalb des erlaubten Bereichs, wird die Fütterung übersprungen
und der Grund in `blockReason` geschrieben. (Ist ein Temperaturwert unbekannt, sperrt diese
Quelle nicht.)

#### Einschränkungen

* **Nachts nicht füttern** – beachtet das Sonnenfenster (inkl. der Offsets). Ausschalten, wenn
  dieser Schalter rund um die Uhr füttern darf.
* **Manueller Auslöser ignoriert alle Sperren** – wenn aktiv, füttern der Button und der
  Datenpunkt `feedNow` auch bei aktiver Temperatur-/Nachtsperre.

#### Schaltüberwachung

Nach dem Schalten kann der Adapter prüfen, ob der Schalter den Ein- und Aus-Zustand
**tatsächlich** erreicht hat, und meldet je Fütterung eines von drei Ergebnissen:

| Ergebnis | Bedeutung | Meldung |
|----------|-----------|---------|
| ✅ Erfolg | Schalter hat wie erwartet ein- und ausgeschaltet | „Fütterung für x s ausgelöst." |
| ❌ Einschalten fehlgeschlagen | der Schalter hat den EIN-Zustand nie bestätigt | „Fütterung konnte nicht durchgeführt werden. Schalter prüfen!" |
| ❌ Ausschalten fehlgeschlagen | er ging an, schaltete aber nicht wieder aus | „Störung: Futterautomat hat nicht abgeschaltet!" |

> Die Meldung wird in der eingestellten ioBroker-Systemsprache gesendet (standardmäßig Englisch).


* **Prüfen, ob der Schalter tatsächlich ein- und ausschaltet** – aktiviert die Überwachung.
* **Überwachungs-Timeout (Sekunden)** – wie lange auf die Bestätigung gewartet wird.
* **Überwachungs-Versuche** – wie viele zeitversetzte Nachprüfungen vor einer Störungsmeldung erfolgen (Standard 3). Jeder Versuch fragt zusätzlich den Ist-Wert aktiv ab, sodass verzögerte Rückmeldungen (z. B. Homematic-Funk) keine Fehlmeldung mehr auslösen.

> **Wichtig:** Die Überwachung funktioniert nur, wenn der Schalter seinen **Ist-Zustand
> zurückmeldet**, d. h. das Zielobjekt wird mit `ack=true` aktualisiert (typisch für
> Steckdosen/Relais mit Statusrückmeldung). Ein einfacher Hilfs-Boolean, den niemand bestätigt,
> würde immer eine Störung melden – dann die Überwachung für diesen Schalter ausschalten.

Das Ergebnis steht außerdem in den Datenpunkten `lastResult` (Text) und `error` (boolean),
sodass du darauf reagieren kannst (z. B. eine eigene Benachrichtigung auslösen).

#### Telegram-Benachrichtigungen

Sendet die Meldungen der Schaltüberwachung an Telegram – **pro Schalter** konfiguriert:

* **Telegram-Instanz** – eine der installierten `telegram.*`-Instanzen wählen (oder *Keine*, um
  Telegram für diesen Schalter zu deaktivieren). Ist keine installiert, weist das Feld darauf hin.
* **Telegram-Empfänger (optional)** – ein bestimmter Benutzer/Chat-Name, wie im telegram-Adapter
  konfiguriert; leer lassen, um an alle konfigurierten Empfänger zu senden.
* **Checkboxen** – auswählen, welche Meldungen gesendet werden: erfolgreiche Fütterung, nicht
  durchführbar und/oder Störung der Abschaltung.

Die vollständige Einrichtung steht unter [Telegram-Benachrichtigungen](#8-telegram-benachrichtigungen).

---

## 6. Objekte / Datenpunkte

Der Adapter legt folgende Datenpunkte in seinem Namespace an
(`automatic-feeder.<instanz>.`).

**Global**

| Datenpunkt | Typ | Bedeutung |
|------------|-----|-----------|
| `info.connection` | boolean (ro) | Adapter läuft und die Konfiguration ist gültig. |
| `airTemperature` | number (ro) | Spiegel der konfigurierten Lufttemperatur-Quelle. |
| `waterTemperature` | number (ro) | Spiegel der konfigurierten Wassertemperatur-Quelle. |
| `sunrise` / `sunset` | string (ro) | Berechneter Sonnenauf-/-untergang für heute. |

**Pro Schalter unter `switches.<id>.`** (`<id>` ist eine interne ID wie `sw-0`)

| Datenpunkt | Typ | Bedeutung |
|------------|-----|-----------|
| `feedingActive` | boolean (ro) | Gerade läuft eine Fütterung. |
| `lastFeeding` | string (ro) | Zeitpunkt der letzten Fütterung. |
| `nextFeeding` | string (ro) | Zeitpunkt der nächsten geplanten Fütterung. |
| `blocked` | boolean (ro) | Der letzte Versuch war blockiert. |
| `blockReason` | string (ro) | Grund der Blockierung (Nacht/Temperatur). |
| `lastResult` | string (ro) | Ergebnistext des letzten Fütterungsversuchs. |
| `error` | boolean (ro) | Der letzte Versuch hatte eine Schaltstörung. |
| `feedNow` | boolean (rw) | `true` schreiben, um manuell zu füttern. |

Diese Datenpunkte lassen sich in VIS, Skripten oder anderen Adaptern nutzen – z. B. `nextFeeding`
auf einem Dashboard anzeigen oder bei `error = true` einen eigenen Alarm auslösen.

---

## 7. Beispiele / Rezepte

**Koi-Teich, zweimal täglich, nur bei genug Wärme**
* Modus *Feste Zeiten* → `08:00`, `18:00`; Dauer `6` s.
* Wassertemperatur in den Grundeinstellungen aktivieren, dann im Schalter-Tab *Nach
  Wassertemperatur sperren* → *Sperren wenn unter* `8` °C (keine Fütterung bei zu kaltem Wasser).
* *Nachts nicht füttern* ein.

**Voliere, häufige kleine Portionen tagsüber**
* Modus *Intervall innerhalb eines Zeitraums* → 07:00–19:00, Intervall `90` min; Dauer `3` s.

**Manuelle Extraportion per VIS-Button**
* In VIS einen Button anlegen, der `true` auf `automatic-feeder.0.switches.sw-0.feedNow` schreibt.
* Optional *Manueller Auslöser ignoriert alle Sperren* aktivieren, damit immer gefüttert wird.

---

## 8. Telegram-Benachrichtigungen

1. Den **telegram**-Adapter installieren und einrichten (Bot mit @BotFather erstellen, Token
   eintragen, Chat mit dem Bot starten). Die Telegram-Instanz muss **laufen**.
2. In einem automatic-feeder-**Schalter-Tab** den Abschnitt **Telegram-Benachrichtigungen** öffnen:
   * Die **Telegram-Instanz** im Dropdown auswählen (z. B. `telegram.0`).
   * Optional einen **Empfänger** eintragen (der im telegram-Adapter angezeigte Benutzer/Chat-Name);
     leer lassen, um alle zu benachrichtigen.
   * Die gewünschten Meldungen ankreuzen: *erfolgreiche Fütterung*, *nicht durchführbar*,
     *Störung Abschaltung*.
3. Speichern. Ab jetzt werden die gewählten Überwachungs-Ergebnisse an Telegram gesendet (mit dem
   Schalternamen davor). Voraussetzung ist, dass die *Schaltüberwachung* für diesen Schalter
   aktiviert ist.

---

## 9. Fehlerbehebung & FAQ

**Die Einstellungsseite ist leer / weiß.**
Den Browser mit **Strg+Shift+R** neu laden. Bleibt die Seite leer, die Instanz neu starten und
die Einstellungen erneut öffnen.

**Das neue Icon / eine Änderung erscheint nicht.**
Browser-Cache. Mit **Strg+Shift+R** hart neu laden.

**Es wird gar nicht gefüttert.**
Der Reihe nach prüfen: Schalter **Aktiv**; ein **Schalter-Objekt** ausgewählt; **Zeitplan**
gültig (`nextFeeding` zeigt eine Zeit); nicht **blockiert** (`blocked` / `blockReason` ansehen);
das **Sonnenfenster** schließt die Zeit nicht aus; das **Log-Level** der Instanz auf `debug`
setzen und das Log beobachten.

**Es wird nie nachts gefüttert, obwohl ich das möchte.**
Entweder *Nachts nicht füttern* für diesen Schalter deaktivieren oder die Sonnen-Offsets
anpassen. Ohne gültige Koordinaten ist die Nachtsperre deaktiviert (und es wird eine Warnung
geloggt).

**Die Überwachung meldet immer eine Störung.**
Dein Schalter-Objekt meldet vermutlich seinen Ist-Zustand nicht zurück (`ack=true`). Entweder
einen Schalter mit Statusrückmeldung verwenden oder die *Schaltüberwachung* für diesen Schalter
deaktivieren.

**Die Adresssuche sagt, die Instanz müsse laufen.**
Die automatic-feeder-Instanz starten – das Geocoding läuft im Backend.

**Telegram-Nachrichten kommen nicht an.**
Ist im Schalter-Tab eine Telegram-Instanz ausgewählt? Ist der telegram-Adapter eingerichtet und
gestartet? Ist mindestens eine Meldungsart angekreuzt und die *Schaltüberwachung* aktiviert?

---

## 10. Logging & Fehlersuche

Der Adapter loggt auf den üblichen ioBroker-Stufen. Für detaillierte Meldungen das Log-Level der
Instanz (Instanzen → automatic-feeder.x → Log-Level) auf **debug** oder **silly** anheben:

* **error** – Fehler, die Aufmerksamkeit brauchen (z. B. Schreiben auf den Schalter
  fehlgeschlagen).
* **warn** – Fehlkonfiguration (keine Koordinaten, ungültiger Zeitplan …).
* **info** – Meilensteine (Start, eine Fütterung ausgeführt oder blockiert, manueller Auslöser).
* **debug** – detaillierter Ablauf (Planungsentscheidungen, Temperatur-Updates, Geocoding,
  Ein-/Aus-Werte, Verifikation bestätigt/Timeout).
* **silly** – sehr ausführliches Tracing (jeder Timer, jede Sperrprüfung, jede Zustandsänderung).

---

📖 [Hauptdokumentation (Englisch)](../../README.md)
