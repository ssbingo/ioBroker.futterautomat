![Logo](../../admin/automatic-feeder.png)
# ioBroker.automatic-feeder

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## automatic-feeder-adapter voor ioBroker

Deze adapter maakt van een willekeurige, reeds aanwezige ioBroker-schakelaar (een
stopcontact, een relais, een GPIO-uitgang …) een **tijdgestuurde voederautomaat**. Hij
schakelt de uitgang op de door jou ingestelde tijden in voor een vastgelegd aantal seconden
en kan daarbij rekening houden met temperatuur en de dag-/nachtwisseling, zodat er nooit op het
verkeerde moment wordt gevoerd.

Dit document is een volledige handleiding. Als je de adapter nog nooit hebt gebruikt,
lees het dan van boven naar beneden – de **snelstart** brengt je in enkele minuten tot de eerste
voedering, de rest legt elke instelling in detail uit.

---

## Inhoudsopgave

1. [Wat de adapter doet](#1-wat-de-adapter-doet)
2. [Vereisten](#2-vereisten)
3. [Installatie](#3-installatie)
4. [Snelstart](#4-snelstart--de-eerste-voedering)
5. [De instellingenpagina in detail](#5-de-instellingenpagina-in-detail)
6. [Objecten / datapunten](#6-objecten--datapunten)
7. [Voorbeelden / recepten](#7-voorbeelden--recepten)
8. [Telegram-meldingen](#8-telegram-meldingen)
9. [Probleemoplossing & FAQ](#9-probleemoplossing--faq)
10. [Logging & foutopsporing](#10-logging--foutopsporing)

---

## 1. Wat de adapter doet

Een „voedering" is in de kern heel eenvoudig: **uitgang AAN → een instelbaar aantal seconden
wachten → weer UIT**. Bij een omgebouwde voederautomaat draait in die tijd de motor en
geeft voer af.

De adapter beheert **tot 5 schakelaars**, elk volledig onafhankelijk en met een eigen
configuratie-tabblad dat naar de schakelaar is genoemd. Per schakelaar leg je vast:

* **wanneer** er wordt gevoerd – ofwel op **vaste tijden** (bijv. 08:00 en 18:00) of in een
  **interval** binnen een tijdvenster (bijv. elke 60 minuten tussen 08:00 en 18:00);
* **hoe lang** de uitgang ingeschakeld blijft (voederduur in seconden);
* **of er wordt geblokkeerd** wanneer de water- of luchttemperatuur te laag/hoog is;
* **of er 's nachts niet** wordt gevoerd (gebaseerd op de werkelijke zonsop-/-ondergang voor jouw
  locatie);
* **of het schakelproces wordt bewaakt** (controle of er werkelijk is in- en uitgeschakeld)
  en optioneel een **Telegram**-bericht over het resultaat wordt verzonden.

Je kunt een voedering op elk moment **handmatig** activeren – rechtstreeks op de instellingenpagina
(knop met vrij te kiezen duur) of via een datapunt (bijv. een knop in een
VIS-weergave).

> Belangrijk: De adapter legt de schakelaar niet zelf aan. Hij **stuurt een reeds aanwezig
> object** in jouw ioBroker aan. Dit object kies je in de configuratie.

---

## 2. Vereisten

| Je hebt nodig | Details |
|-------------|---------|
| **ioBroker** met actuele **admin** (≥ 7) | De configuratiepagina is met React gerealiseerd. |
| **Een schakelaar-object** | Een beschrijfbaar ioBroker-datapunt dat de voederautomaat in-/uitschakelt – bijv. een stopcontact (`shelly.0.…`, `sonoff.0.…`, `zigbee.0.…`), een relais of een scriptvariabele. |
| **Geocoördinaten** | Voor de berekening van zonsop-/-ondergang. Ofwel uit de ioBroker-systeeminstellingen of via adres/kaart. **Verplicht.** |
| *(optioneel)* Temperatuur-objecten | Aanwezige datapunten met lucht- en/of watertemperatuur, als je temperatuurafhankelijk wilt blokkeren. |
| *(optioneel)* Een **Telegram**-instantie | De officiële `telegram`-adapter, ingericht en gestart, als je push-meldingen wilt. |
| Internettoegang op de ioBroker-host | Alleen voor adres zoeken/kaart in de configuratie. Het normale gebruik werkt offline. |

---

## 3. Installatie

1. In de ioBroker-**admin** het tabblad **Adapter** openen.
2. In de lijst met adapters **automatic-feeder** opzoeken en op **Installeren** klikken.
3. Een **instantie** van de adapter aanmaken.
4. De instantie-instellingen openen (tandwiel-symbool) – er zou de configuratiepagina met het
   tabblad **Basisinstellingen** moeten verschijnen. Blijft deze leeg, zie [Probleemoplossing](#9-probleemoplossing--faq).

---

## 4. Snelstart – de eerste voedering

Doel: Een schakelaar moet – meteen, ter test – 5 seconden lang voeren.

1. **Instellingen openen** van de automatic-feeder-instantie.
2. Op het tabblad **Basisinstellingen**:
   * Onder **Locatie** *Systeeminstellingen overnemen* laten, als jouw ioBroker al
     coördinaten heeft. Anders *Locatie specifiek vastleggen* kiezen, adres invoeren,
     **Zoeken** klikken en de marker op de kaart bevestigen.
   * Naar beneden scrollen naar **Schakelaars** en **Schakelaar toevoegen** klikken.
   * Een **naam** toekennen (bijv. `Koi-vijver`). Deze naam wordt de titel van een eigen tabblad.
   * Naast **Schakelaar-object** het lijst-symbool aanklikken en het datapunt kiezen dat jouw
     automaat schakelt (bijv. jouw stopcontact). De schakelaar moet **actief** zijn (vinkje links).
3. **Opslaan** (diskette/vinkje onderaan). Een nieuw tabblad met jouw schakelaarnaam verschijnt.
4. Dit **schakelaar-tabblad** openen. Helemaal bovenaan onder **Handmatige voedering** een duur instellen
   (bijv. `5` seconden) en **Nu voeren** klikken. De uitgang zou 5 seconden moeten inschakelen en
   dan weer uitschakelen.
5. In hetzelfde tabblad het echte schema onder **Voederschema** inrichten (bijv. vaste tijden
   08:00 en 18:00) en de **voederduur** onder **Voederproces** instellen, dan
   **Opslaan**.

Klaar – vanaf nu voert de adapter automatisch. Al het overige legt de opties in detail uit.

---

## 5. De instellingenpagina in detail

De configuratie heeft een tabblad **Basisinstellingen** evenals **een tabblad per schakelaar** (wordt
automatisch aangemaakt zodra een schakelaar een naam heeft). Als een pagina niet scrolt, het
venster vergroten of de scrollbalk rechts gebruiken – alle secties zijn bereikbaar.

### 5.1 Tabblad „Basisinstellingen"

#### Locatie (verplicht)

De adapter heeft jouw geografische positie nodig om zonsop- en -ondergang te berekenen (voor
de nachtblokkering). Twee mogelijkheden:

* **Systeeminstellingen overnemen** – neemt breedte-/lengtegraad uit de ioBroker-systeemconfiguratie
  (aanbevolen wanneer daar al ingesteld). De huidige waarden worden weergegeven.
* **Locatie specifiek vastleggen** – positie zelf bepalen:
  * Een **adres** invoeren en **Zoeken** drukken. De adapter lost het op (via
    OpenStreetMap / Nominatim) en plaatst een marker.
  * Of **op de kaart klikken** / de **marker slepen** om de exacte plek te kiezen.
  * Breedte-/lengtegraad kunnen ook direct worden ingevoerd; de kaart volgt.

> Het adres zoeken loopt in de adapter-backend, daarom moet de **instantie draaien**. Kaart en zoeken
> hebben internettoegang nodig.

#### Zonvenster (geen voedering 's nachts)

Legt het tijdvenster vast waarin gevoerd mag worden:

* **Minuten na zonsopgang** – pas zoveel minuten *na* zonsopgang voeren.
* **Minuten voor zonsondergang** – zoveel minuten *voor* zonsondergang stoppen.

Voorbeeld: Bij zonsopgang 06:30, zonsondergang 21:00 en offsets 30 / 30 is voedering alleen
tussen **07:00 en 20:30** toegestaan. Elke schakelaar kan dit venster afzonderlijk in acht nemen of
negeren (zie *Beperkingen* in het schakelaar-tabblad). De berekende tijden staan bovendien in
de datapunten `sunrise` / `sunset` en worden elke nacht automatisch opnieuw berekend.

#### Temperatuurbronnen

Voor temperatuurafhankelijk blokkeren hier de bronnen activeren en de objecten kiezen:

* **Luchttemperatuur** – vinkje zetten en het datapunt met de luchttemperatuur selecteren.
* **Watertemperatuur** – vinkje zetten en het datapunt met de watertemperatuur selecteren.

Alleen getal-datapunten zijn zinvol. De huidige waarden worden naar de datapunten
`airTemperature` / `waterTemperature` gespiegeld. De eigenlijke drempels worden **per
schakelaar** ingesteld (zie *Temperatuurblokkering*).

#### Schakelaars

De lijst met voederautomaten (tot 5). Per item:

* **Actief** (vinkje) – alleen actieve schakelaars worden ingepland.
* **Naam** – vrije tekst; wordt de tabblad-titel van de schakelaar en de kanaalnaam in de objectboom.
* **Schakelaar-object** – het aanwezige ioBroker-datapunt dat wordt aangestuurd. Via het
  lijst-symbool selecteren, via het kruis leegmaken.

Met **Schakelaar toevoegen** maak je er nog een aan (max. 5), met het prullenbak-symbool
verwijder je er een. Bij het verwijderen worden ook diens datapunten gewist.

### 5.2 Schakelaar-tabbladen

Elke geconfigureerde schakelaar krijgt een eigen tabblad met zijn naam. Het bevat de volgende
secties.

#### Handmatige voedering

* **Duur van de handmatige voedering (seconden)** – de door de knop gebruikte duur.
* **Nu voeren** – activeert meteen een voedering met deze duur. Handig om te testen of
  voor een extra portie. (Of blokkeringen worden genegeerd, hangt af van *Handmatige trigger negeert
  alle blokkeringen* onder *Beperkingen*.)
* Voor de knop moet de instantie draaien en de configuratie **opgeslagen** zijn.

#### Voederschema

**Eén** modus kiezen:

* **Vaste tijden** – een lijst met tijdstippen (`HH:mm`). Willekeurig veel toevoegen; de automaat
  loopt dagelijks op elk daarvan. Voorbeeld: `08:00` en `18:00`.
* **Interval binnen een periode** – herhaald binnen een venster voeren:
  * **Begin periode** / **Einde periode** – bijv. 08:00 tot 18:00.
  * **Interval (minuten)** – bijv. 60 → voert dagelijks om 08:00, 09:00, … tot het einde van het venster.

De volgende geplande tijd staat op elk moment in het datapunt `nextFeeding`.

#### Voederproces

* **Voederduur (seconden)** – hoe lang de uitgang bij een geplande voedering AAN blijft.
* **Aan-waarde** / **Uit-waarde** – de waarden die naar het schakelaar-object worden geschreven.
  Standaard zijn `true` en `false`, wat bij de meeste stopcontacten/relais past. Verwacht jouw
  apparaat getallen of tekst, hier bijv. `1` / `0` of `ON` / `OFF` invoeren.

#### Temperatuurblokkering

Wordt alleen weergegeven voor de in de basisinstellingen geactiveerde temperatuurbronnen. Per schakelaar:

* **Blokkeren op watertemperatuur** – *Blokkeren wanneer onder* en/of *Blokkeren wanneer boven* (°C).
* **Blokkeren op luchttemperatuur** – hetzelfde voor de lucht.

Ligt de huidige temperatuur buiten het toegestane bereik, dan wordt de voedering overgeslagen
en de reden in `blockReason` geschreven. (Is een temperatuurwaarde onbekend, dan blokkeert deze
bron niet.)

#### Beperkingen

* **'s Nachts niet voeren** – houdt rekening met het zonvenster (incl. de offsets). Uitschakelen wanneer
  deze schakelaar rond de klok mag voeren.
* **Handmatige trigger negeert alle blokkeringen** – wanneer actief, voeren de knop en het
  datapunt `feedNow` ook bij actieve temperatuur-/nachtblokkering.

#### Schakelbewaking

Na het schakelen kan de adapter controleren of de schakelaar de in- en uit-toestand
**daadwerkelijk** heeft bereikt, en meldt per voedering een van drie resultaten:

| Resultaat | Betekenis | Melding |
|----------|-----------|---------|
| ✅ Succes | Schakelaar heeft zoals verwacht in- en uitgeschakeld | „Voeding geactiveerd voor x s." |
| ❌ Inschakelen mislukt | de schakelaar heeft de AAN-toestand nooit bevestigd | „Voeding kon niet worden uitgevoerd. Controleer de schakelaar!" |
| ❌ Uitschakelen mislukt | hij ging aan, maar schakelde niet weer uit | „Storing: de voederautomaat is niet uitgeschakeld!" |

> Het bericht wordt verzonden in de ingestelde ioBroker-systeemtaal (standaard Engels).


* **Controleren of de schakelaar daadwerkelijk in- en uitschakelt** – activeert de bewaking.
* **Bewakings-timeout (seconden)** – hoe lang op de bevestiging wordt gewacht.
* **Verificatiepogingen** – hoeveel gespreide hercontroles worden uitgevoerd voordat een storing wordt gemeld (standaard 3). Elke poging leest ook de huidige toestand terug, zodat vertraagde terugmelding (bijv. Homematic-radio) geen valse storing meer veroorzaakt.

> **Belangrijk:** De bewaking werkt alleen wanneer de schakelaar zijn **werkelijke toestand
> terugmeldt**, d.w.z. het doelobject wordt met `ack=true` bijgewerkt (typisch voor
> stopcontacten/relais met statusterugmelding). Een eenvoudige hulp-boolean die niemand bevestigt,
> zou altijd een storing melden – schakel dan de bewaking voor deze schakelaar uit.

Het resultaat staat bovendien in de datapunten `lastResult` (tekst) en `error` (boolean),
zodat je erop kunt reageren (bijv. een eigen melding activeren).

#### Telegram-meldingen

Verzendt de meldingen van de schakelbewaking naar Telegram – **per schakelaar** geconfigureerd:

* **Telegram-instantie** – een van de geïnstalleerde `telegram.*`-instanties kiezen (of *Geen*, om
  Telegram voor deze schakelaar uit te schakelen). Is er geen geïnstalleerd, dan wijst het veld erop.
* **Telegram-ontvanger (optioneel)** – een bepaalde gebruikers-/chat-naam, zoals in de telegram-adapter
  geconfigureerd; leeg laten om naar alle geconfigureerde ontvangers te verzenden.
* **Selectievakjes** – kiezen welke meldingen worden verzonden: succesvolle voedering, niet
  uitvoerbaar en/of storing van het uitschakelen.

De volledige inrichting staat onder [Telegram-meldingen](#8-telegram-meldingen).

---

## 6. Objecten / datapunten

De adapter legt de volgende datapunten in zijn namespace aan
(`automatic-feeder.<instanz>.`).

**Globaal**

| Datapunt | Type | Betekenis |
|------------|-----|-----------|
| `info.connection` | boolean (ro) | Adapter draait en de configuratie is geldig. |
| `airTemperature` | number (ro) | Spiegel van de geconfigureerde luchttemperatuur-bron. |
| `waterTemperature` | number (ro) | Spiegel van de geconfigureerde watertemperatuur-bron. |
| `sunrise` / `sunset` | string (ro) | Berekende zonsop-/-ondergang voor vandaag. |

**Per schakelaar onder `switches.<id>.`** (`<id>` is een interne ID zoals `sw-0`)

| Datapunt | Type | Betekenis |
|------------|-----|-----------|
| `feedingActive` | boolean (ro) | Er loopt nu een voedering. |
| `lastFeeding` | string (ro) | Tijdstip van de laatste voedering. |
| `nextFeeding` | string (ro) | Tijdstip van de volgende geplande voedering. |
| `blocked` | boolean (ro) | De laatste poging was geblokkeerd. |
| `blockReason` | string (ro) | Reden van de blokkering (nacht/temperatuur). |
| `lastResult` | string (ro) | Resultaattekst van de laatste voederpoging. |
| `error` | boolean (ro) | De laatste poging had een schakelstoring. |
| `feedNow` | boolean (rw) | `true` schrijven om handmatig te voeren. |

Deze datapunten kunnen in VIS, scripts of andere adapters worden gebruikt – bijv. `nextFeeding`
op een dashboard weergeven of bij `error = true` een eigen alarm activeren.

---

## 7. Voorbeelden / recepten

**Koi-vijver, tweemaal daags, alleen bij voldoende warmte**
* Modus *Vaste tijden* → `08:00`, `18:00`; duur `6` s.
* Watertemperatuur in de basisinstellingen activeren, dan in het schakelaar-tabblad *Blokkeren
  op watertemperatuur* → *Blokkeren wanneer onder* `8` °C (geen voedering bij te koud water).
* *'s Nachts niet voeren* aan.

**Volière, frequente kleine porties overdag**
* Modus *Interval binnen een periode* → 07:00–19:00, interval `90` min; duur `3` s.

**Handmatige extra portie via VIS-knop**
* In VIS een knop aanmaken die `true` op `automatic-feeder.0.switches.sw-0.feedNow` schrijft.
* Optioneel *Handmatige trigger negeert alle blokkeringen* activeren, zodat er altijd wordt gevoerd.

---

## 8. Telegram-meldingen

1. De **telegram**-adapter installeren en inrichten (bot met @BotFather aanmaken, token
   invoeren, chat met de bot starten). De Telegram-instantie moet **draaien**.
2. In een automatic-feeder-**schakelaar-tabblad** de sectie **Telegram-meldingen** openen:
   * De **Telegram-instantie** in de dropdown selecteren (bijv. `telegram.0`).
   * Optioneel een **ontvanger** invoeren (de in de telegram-adapter weergegeven gebruikers-/chat-naam);
     leeg laten om iedereen te informeren.
   * De gewenste meldingen aankruisen: *succesvolle voedering*, *niet uitvoerbaar*,
     *storing uitschakelen*.
3. Opslaan. Vanaf nu worden de gekozen bewakings-resultaten naar Telegram verzonden (met de
   schakelaarnaam ervoor). Voorwaarde is dat de *schakelbewaking* voor deze schakelaar
   geactiveerd is.

---

## 9. Probleemoplossing & FAQ

**De instellingenpagina is leeg / wit.**
De browser met **Strg+Shift+R** opnieuw laden. Blijft het probleem bestaan, de instantie
opnieuw starten en de instellingen opnieuw openen.

**Het nieuwe icoon / een wijziging verschijnt niet.**
Browser-cache. Hard opnieuw laden met **Strg+Shift+R**.

**Er wordt helemaal niet gevoerd.**
Op volgorde controleren: schakelaar **Actief**; een **schakelaar-object** geselecteerd; **schema**
geldig (`nextFeeding` toont een tijd); niet **geblokkeerd** (`blocked` / `blockReason` bekijken);
het **zonvenster** sluit de tijd niet uit; het **log-level** van de instantie op `debug`
zetten en het log volgen.

**Er wordt nooit 's nachts gevoerd, hoewel ik dat wil.**
Ofwel *'s Nachts niet voeren* voor deze schakelaar deactiveren of de zon-offsets
aanpassen. Zonder geldige coördinaten is de nachtblokkering gedeactiveerd (en wordt een waarschuwing
gelogd).

**De bewaking meldt altijd een storing.**
Jouw schakelaar-object meldt vermoedelijk zijn werkelijke toestand niet terug (`ack=true`). Ofwel
een schakelaar met statusterugmelding gebruiken of de *schakelbewaking* voor deze schakelaar
deactiveren.

**Het adres zoeken zegt dat de instantie moet draaien.**
De automatic-feeder-instantie starten – de geocoding loopt in de backend.

**Telegram-berichten komen niet aan.**
Is er in het schakelaar-tabblad een Telegram-instantie geselecteerd? Is de telegram-adapter ingericht en
gestart? Is ten minste één meldingssoort aangekruist en de *schakelbewaking* geactiveerd?

---

## 10. Logging & foutopsporing

De adapter logt op de gebruikelijke ioBroker-niveaus. Voor gedetailleerde meldingen het log-level van de
instantie (Instanties → automatic-feeder.x → log-level) op **debug** of **silly** verhogen:

* **error** – fouten die aandacht nodig hebben (bijv. schrijven naar de schakelaar
  mislukt).
* **warn** – verkeerde configuratie (geen coördinaten, ongeldig schema …).
* **info** – mijlpalen (start, een voedering uitgevoerd of geblokkeerd, handmatige trigger).
* **debug** – gedetailleerd verloop (planningsbeslissingen, temperatuur-updates, geocoding,
  aan-/uit-waarden, verificatie bevestigd/timeout).
* **silly** – zeer uitgebreide tracing (elke timer, elke blokkeringscontrole, elke toestandswijziging).

---

📖 [Hoofddocumentatie (Engels)](../../README.md)
