![Logo](../../admin/automatic-feeder.png)
# ioBroker.automatic-feeder

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## Adattatore automatic-feeder per ioBroker

Questo adattatore trasforma un qualsiasi interruttore ioBroker già esistente (una presa
elettrica, un relè, un'uscita GPIO …) in un **distributore di mangime a comando temporizzato**.
Accende l'uscita agli orari da te stabiliti per un numero definito di secondi e può tenere conto
della temperatura e dell'alternanza giorno/notte, affinché non venga mai distribuito mangime al
momento sbagliato.

Questo documento è una guida completa. Se non hai mai usato l'adattatore, leggilo dall'inizio
alla fine: l'**Avvio rapido** ti porta alla prima distribuzione di mangime in pochi minuti, il
resto spiega ogni impostazione nel dettaglio.

---

## Indice

1. [Cosa fa l'adattatore](#1-cosa-fa-ladattatore)
2. [Requisiti](#2-requisiti)
3. [Installazione](#3-installazione)
4. [Avvio rapido](#4-avvio-rapido--la-prima-distribuzione-di-mangime)
5. [La pagina delle impostazioni nel dettaglio](#5-la-pagina-delle-impostazioni-nel-dettaglio)
6. [Oggetti / Punti dati](#6-oggetti--punti-dati)
7. [Esempi / Ricette](#7-esempi--ricette)
8. [Notifiche Telegram](#8-notifiche-telegram)
9. [Risoluzione dei problemi & FAQ](#9-risoluzione-dei-problemi--faq)
10. [Logging & Ricerca degli errori](#10-logging--ricerca-degli-errori)

---

## 1. Cosa fa l'adattatore

Una „distribuzione di mangime" è nella sua essenza molto semplice: **uscita ACCESA → attesa di un
numero impostabile di secondi → di nuovo SPENTA**. In un distributore di mangime convertito,
durante questo tempo gira il motore e viene erogato il mangime.

L'adattatore gestisce **fino a 5 interruttori**, ciascuno del tutto indipendente e con una
propria scheda di configurazione, denominata in base all'interruttore. Per ogni interruttore
stabilisci:

* **quando** viene distribuito il mangime – o a **orari fissi** (ad es. 08:00 e 18:00) oppure a
  **intervalli** all'interno di una finestra temporale (ad es. ogni 60 minuti tra le 08:00 e le 18:00);
* **per quanto tempo** l'uscita rimane accesa (durata della distribuzione in secondi);
* **se bloccare** quando la temperatura dell'acqua o dell'aria è troppo bassa/alta;
* **se di notte** non venga distribuito mangime (in base all'alba/tramonto reali per la tua
  posizione);
* **se monitorare la commutazione** (verifica che l'accensione e lo spegnimento siano realmente
  avvenuti) e, facoltativamente, l'invio di un messaggio **Telegram** sull'esito.

Puoi attivare una distribuzione **manualmente** in qualsiasi momento, direttamente dalla pagina
delle impostazioni (pulsante con durata liberamente selezionabile) oppure tramite un punto dati
(ad es. un pulsante in una vista VIS).

> Importante: l'adattatore non crea l'interruttore da solo. **Comanda un oggetto già esistente**
> nel tuo ioBroker. Questo oggetto lo scegli tu nella configurazione.

---

## 2. Requisiti

| Ti serve | Dettagli |
|-------------|---------|
| **ioBroker** con **admin** aggiornato (≥ 7) | La pagina di configurazione è realizzata con React. |
| **Un oggetto interruttore** | Un punto dati ioBroker scrivibile che accende/spegne il distributore di mangime – ad es. una presa elettrica (`shelly.0.…`, `sonoff.0.…`, `zigbee.0.…`), un relè o una variabile di script. |
| **Coordinate geografiche** | Per il calcolo di alba/tramonto. O dalle impostazioni di sistema di ioBroker oppure tramite indirizzo/mappa. **Obbligatorio.** |
| *(facoltativo)* Oggetti di temperatura | Punti dati esistenti con temperatura dell'aria e/o dell'acqua, se vuoi bloccare in base alla temperatura. |
| *(facoltativo)* Un'istanza **Telegram** | L'adattatore ufficiale `telegram`, configurato e avviato, se desideri notifiche push. |
| Accesso a Internet sull'host ioBroker | Solo per la ricerca dell'indirizzo/mappa nella configurazione. Il normale funzionamento avviene offline. |

---

## 3. Installazione

1. Nell'**admin** di ioBroker apri la scheda **Adattatori** (Adapter).
2. Cerca automatic-feeder nell'elenco degli adattatori e fai clic su **Installa**.
3. Crea un'**istanza** dell'adattatore.
4. Apri le impostazioni dell'istanza (icona ingranaggio): dovrebbe comparire la pagina di
   configurazione con la scheda **Impostazioni di base** (Grundeinstellungen). Se rimane vuota,
   vedi [Risoluzione dei problemi](#9-risoluzione-dei-problemi--faq).

---

## 4. Avvio rapido – la prima distribuzione di mangime

Obiettivo: un interruttore deve – subito, come test – distribuire mangime per 5 secondi.

1. **Apri le impostazioni** dell'istanza automatic-feeder.
2. Nella scheda **Impostazioni di base** (Grundeinstellungen):
   * In **Posizione** (Standort) lascia *Acquisisci impostazioni di sistema* se il tuo ioBroker
     ha già le coordinate. Altrimenti scegli *Imposta posizione specifica*, inserisci l'indirizzo,
     fai clic su **Cerca** e conferma il marcatore sulla mappa.
   * Scorri in basso fino a **Interruttori** (Schalter) e fai clic su **Aggiungi interruttore**.
   * Assegna un **nome** (ad es. `Koi-Teich`). Questo nome diventa il titolo di una scheda dedicata.
   * Accanto a **Oggetto interruttore** (Schalter-Objekt) fai clic sull'icona elenco e seleziona
     il punto dati che comanda il tuo distributore (ad es. la tua presa). L'interruttore deve
     essere **attivo** (segno di spunta a sinistra).
3. **Salva** (dischetto/segno di spunta in basso). Compare una nuova scheda con il nome del tuo
   interruttore.
4. Apri questa **scheda dell'interruttore**. In alto, sotto **Distribuzione manuale**, imposta una
   durata (ad es. `5` secondi) e fai clic su **Distribuisci ora**. L'uscita dovrebbe accendersi per
   5 secondi e poi spegnersi di nuovo.
5. Nella stessa scheda configura il vero programma sotto **Programma di distribuzione** (ad es.
   orari fissi 08:00 e 18:00) e imposta la **Durata della distribuzione** sotto **Processo di
   distribuzione**, poi **Salva**.

Fatto – da ora l'adattatore distribuisce il mangime automaticamente. Tutto il resto spiega le
opzioni nel dettaglio.

---

## 5. La pagina delle impostazioni nel dettaglio

La configurazione ha una scheda **Impostazioni di base** (Grundeinstellungen) e **una scheda per
ogni interruttore** (creata automaticamente non appena un interruttore ha un nome). Se una pagina
non scorre, ingrandisci la finestra o usa la barra di scorrimento a destra: tutte le sezioni sono
raggiungibili.

### 5.1 Scheda „Impostazioni di base"

#### Posizione (obbligatoria)

L'adattatore necessita della tua posizione geografica per calcolare alba e tramonto (per il
blocco notturno). Due possibilità:

* **Acquisisci impostazioni di sistema** – prende latitudine/longitudine dalla configurazione di
  sistema di ioBroker (consigliato se già impostate lì). Vengono mostrati i valori attuali.
* **Imposta posizione specifica** – determina tu stesso la posizione:
  * Inserisci un **indirizzo** e premi **Cerca**. L'adattatore lo risolve (tramite
    OpenStreetMap / Nominatim) e posiziona un marcatore.
  * Oppure **fai clic sulla mappa** / **trascina il marcatore** per scegliere il punto esatto.
  * Latitudine/longitudine possono anche essere inserite direttamente; la mappa segue.

> La ricerca dell'indirizzo viene eseguita nel backend dell'adattatore, perciò l'**istanza deve
> essere in esecuzione**. La mappa e la ricerca richiedono l'accesso a Internet.

#### Finestra solare (nessuna distribuzione di notte)

Stabilisce la finestra temporale in cui è consentita la distribuzione:

* **Minuti dopo l'alba** – distribuisci solo dopo questo numero di minuti *dopo* l'alba.
* **Minuti prima del tramonto** – smetti questo numero di minuti *prima* del tramonto.

Esempio: con alba alle 06:30, tramonto alle 21:00 e scarti 30 / 30, la distribuzione è consentita
solo tra le **07:00 e le 20:30**. Ogni interruttore può rispettare o ignorare questa finestra
singolarmente (vedi *Limitazioni* nella scheda dell'interruttore). Gli orari calcolati si trovano
inoltre nei punti dati `sunrise` / `sunset` e vengono ricalcolati automaticamente ogni notte.

#### Sorgenti di temperatura

Per il blocco in base alla temperatura attiva qui le sorgenti e seleziona gli oggetti:

* **Temperatura dell'aria** – metti il segno di spunta e seleziona il punto dati con la
  temperatura dell'aria.
* **Temperatura dell'acqua** – metti il segno di spunta e seleziona il punto dati con la
  temperatura dell'acqua.

Sono utili solo i punti dati numerici. I valori attuali vengono rispecchiati nei punti dati
`airTemperature` / `waterTemperature`. Le soglie vere e proprie si impostano **per ciascun
interruttore** (vedi *Blocco per temperatura*).

#### Interruttori

L'elenco dei distributori di mangime (fino a 5). Per ogni voce:

* **Attivo** (segno di spunta) – vengono programmati solo gli interruttori attivi.
* **Nome** – testo libero; diventa il titolo della scheda dell'interruttore e il nome del canale
  nell'albero degli oggetti.
* **Oggetto interruttore** – il punto dati ioBroker esistente che viene comandato. Selezionalo
  tramite l'icona elenco, svuotalo tramite la croce.

Con **Aggiungi interruttore** ne crei un altro (max. 5), con l'icona del cestino ne rimuovi uno.
Alla rimozione vengono cancellati anche i relativi punti dati.

### 5.2 Schede degli interruttori

Ogni interruttore configurato riceve una propria scheda con il suo nome. Contiene le seguenti
sezioni.

#### Distribuzione manuale

* **Durata della distribuzione manuale (secondi)** – la durata utilizzata dal pulsante.
* **Distribuisci ora** – attiva immediatamente una distribuzione con questa durata. Comodo per
  fare test o per una porzione extra. (Se i blocchi vengano ignorati dipende da *L'attivatore
  manuale ignora tutti i blocchi* sotto *Limitazioni*.)
* Per il pulsante l'istanza deve essere in esecuzione e la configurazione **salvata**.

#### Programma di distribuzione

Scegli **una** modalità:

* **Orari fissi** – un elenco di orari (`HH:mm`). Aggiungine quanti ne vuoi; il distributore
  funziona ogni giorno a ciascuno di essi. Esempio: `08:00` e `18:00`.
* **Intervallo all'interno di un periodo** – distribuisci ripetutamente all'interno di una
  finestra:
  * **Inizio periodo** / **Fine periodo** – ad es. dalle 08:00 alle 18:00.
  * **Intervallo (minuti)** – ad es. 60 → distribuisce ogni giorno alle 08:00, 09:00, … fino alla
    fine della finestra.

Il prossimo orario programmato è sempre presente nel punto dati `nextFeeding`.

#### Processo di distribuzione

* **Durata della distribuzione (secondi)** – per quanto tempo l'uscita rimane ACCESA durante una
  distribuzione programmata.
* **Valore di accensione** / **Valore di spegnimento** – i valori scritti nell'oggetto
  interruttore. Quelli predefiniti sono `true` e `false`, adatti alla maggior parte delle
  prese/relè. Se il tuo dispositivo si aspetta numeri o testo, inserisci qui ad es. `1` / `0`
  oppure `ON` / `OFF`.

#### Blocco per temperatura

Viene mostrato solo per le sorgenti di temperatura attivate nelle impostazioni di base. Per ogni
interruttore:

* **Blocca in base alla temperatura dell'acqua** – *Blocca se inferiore a* e/o *Blocca se
  superiore a* (°C).
* **Blocca in base alla temperatura dell'aria** – lo stesso per l'aria.

Se la temperatura attuale è al di fuori dell'intervallo consentito, la distribuzione viene saltata
e il motivo viene scritto in `blockReason`. (Se un valore di temperatura è sconosciuto, questa
sorgente non blocca.)

#### Limitazioni

* **Non distribuire di notte** – rispetta la finestra solare (compresi gli scarti). Disattivalo se
  questo interruttore può distribuire mangime tutto il giorno.
* **L'attivatore manuale ignora tutti i blocchi** – se attivo, il pulsante e il punto dati
  `feedNow` distribuiscono mangime anche con blocco per temperatura/notturno attivo.

#### Monitoraggio della commutazione

Dopo la commutazione l'adattatore può verificare se l'interruttore ha **effettivamente**
raggiunto lo stato di accensione e spegnimento, e segnala per ogni distribuzione uno di tre
risultati:

| Risultato | Significato | Messaggio |
|----------|-----------|---------|
| ✅ Successo | L'interruttore si è acceso e spento come previsto | „Alimentazione attivata per x s." |
| ❌ Accensione fallita | L'interruttore non ha mai confermato lo stato ACCESO | „Impossibile eseguire l'alimentazione. Controllare l'interruttore!" |
| ❌ Spegnimento fallito | si è acceso ma non si è più spento | „Guasto: l'alimentatore non si è spento!" |

> Il messaggio viene inviato nella lingua di sistema di ioBroker configurata (inglese per impostazione predefinita).


* **Verifica che l'interruttore si accenda e spenga effettivamente** – attiva il monitoraggio.
* **Timeout di monitoraggio (secondi)** – per quanto tempo si attende la conferma.
* **Tentativi di verifica** – quanti controlli scaglionati vengono eseguiti prima di segnalare un guasto (predefinito 3). Ogni tentativo rilegge anche lo stato attuale, così il feedback ritardato (ad es. radio Homematic) non genera più un falso guasto.

> **Importante:** il monitoraggio funziona solo se l'interruttore **restituisce il proprio stato
> reale**, cioè l'oggetto di destinazione viene aggiornato con `ack=true` (tipico per
> prese/relè con conferma di stato). Un semplice booleano ausiliario che nessuno conferma
> segnalerebbe sempre un guasto – in tal caso disattiva il monitoraggio per questo interruttore.

Il risultato è inoltre presente nei punti dati `lastResult` (testo) ed `error` (booleano),
così puoi reagire di conseguenza (ad es. attivare una notifica personalizzata).

#### Notifiche Telegram

Invia i messaggi del monitoraggio della commutazione a Telegram – configurato **per ciascun
interruttore**:

* **Istanza Telegram** – scegli una delle istanze `telegram.*` installate (oppure *Nessuna* per
  disattivare Telegram per questo interruttore). Se non ne è installata nessuna, il campo lo
  segnala.
* **Destinatario Telegram (facoltativo)** – un determinato nome utente/chat, come configurato
  nell'adattatore telegram; lascia vuoto per inviare a tutti i destinatari configurati.
* **Caselle di controllo** – seleziona quali messaggi vengono inviati: distribuzione riuscita, non
  effettuabile e/o guasto dello spegnimento.

La configurazione completa è descritta in [Notifiche Telegram](#8-notifiche-telegram).

---

## 6. Oggetti / Punti dati

L'adattatore crea i seguenti punti dati nel suo namespace
(`automatic-feeder.<instanz>.`).

**Globali**

| Punto dati | Tipo | Significato |
|------------|-----|-----------|
| `info.connection` | boolean (ro) | L'adattatore è in esecuzione e la configurazione è valida. |
| `airTemperature` | number (ro) | Specchio della sorgente di temperatura dell'aria configurata. |
| `waterTemperature` | number (ro) | Specchio della sorgente di temperatura dell'acqua configurata. |
| `sunrise` / `sunset` | string (ro) | Alba/tramonto calcolati per oggi. |

**Per ogni interruttore sotto `switches.<id>.`** (`<id>` è un ID interno come `sw-0`)

| Punto dati | Tipo | Significato |
|------------|-----|-----------|
| `feedingActive` | boolean (ro) | È in corso una distribuzione. |
| `lastFeeding` | string (ro) | Momento dell'ultima distribuzione. |
| `nextFeeding` | string (ro) | Momento della prossima distribuzione programmata. |
| `blocked` | boolean (ro) | L'ultimo tentativo è stato bloccato. |
| `blockReason` | string (ro) | Motivo del blocco (notte/temperatura). |
| `lastResult` | string (ro) | Testo dell'esito dell'ultimo tentativo di distribuzione. |
| `error` | boolean (ro) | L'ultimo tentativo ha avuto un guasto di commutazione. |
| `feedNow` | boolean (rw) | Scrivi `true` per distribuire manualmente. |

Questi punti dati possono essere usati in VIS, negli script o in altri adattatori – ad es.
mostrare `nextFeeding` su una dashboard oppure attivare un allarme personalizzato quando
`error = true`.

---

## 7. Esempi / Ricette

**Laghetto Koi, due volte al giorno, solo con calore sufficiente**
* Modalità *Orari fissi* → `08:00`, `18:00`; durata `6` s.
* Attiva la temperatura dell'acqua nelle impostazioni di base, poi nella scheda dell'interruttore
  *Blocca in base alla temperatura dell'acqua* → *Blocca se inferiore a* `8` °C (nessuna
  distribuzione con acqua troppo fredda).
* Attiva *Non distribuire di notte*.

**Voliera, piccole porzioni frequenti durante il giorno**
* Modalità *Intervallo all'interno di un periodo* → 07:00–19:00, intervallo `90` min; durata `3` s.

**Porzione extra manuale tramite pulsante VIS**
* In VIS crea un pulsante che scrive `true` su `automatic-feeder.0.switches.sw-0.feedNow`.
* Facoltativamente attiva *L'attivatore manuale ignora tutti i blocchi*, affinché venga sempre
  distribuito il mangime.

---

## 8. Notifiche Telegram

1. Installa e configura l'adattatore **telegram** (crea un bot con @BotFather, inserisci il token,
   avvia una chat con il bot). L'istanza Telegram deve essere **in esecuzione**.
2. In una **scheda dell'interruttore** di automatic-feeder apri la sezione **Notifiche Telegram**:
   * Seleziona l'**istanza Telegram** nel menu a tendina (ad es. `telegram.0`).
   * Facoltativamente inserisci un **destinatario** (il nome utente/chat mostrato nell'adattatore
     telegram); lascia vuoto per notificare tutti.
   * Spunta i messaggi desiderati: *distribuzione riuscita*, *non effettuabile*, *guasto dello
     spegnimento*.
3. Salva. Da ora i risultati di monitoraggio selezionati vengono inviati a Telegram (preceduti dal
   nome dell'interruttore). Il presupposto è che il *Monitoraggio della commutazione* sia attivato
   per questo interruttore.

---

## 9. Risoluzione dei problemi & FAQ

**La pagina delle impostazioni è vuota / bianca.**
Ricarica il browser con **Strg+Shift+R**. Se il problema persiste, riavvia l'istanza e riapri le
impostazioni.

**La nuova icona / una modifica non compare.**
Cache del browser. Ricarica forzatamente con **Strg+Shift+R**.

**Non viene distribuito alcun mangime.**
Controlla nell'ordine: l'interruttore è **Attivo**; è selezionato un **Oggetto interruttore**; il
**programma** è valido (`nextFeeding` mostra un orario); non è **bloccato** (controlla `blocked` /
`blockReason`); la **finestra solare** non esclude l'orario; imposta il **livello di log**
dell'istanza su `debug` e osserva il log.

**Non viene mai distribuito mangime di notte, anche se lo desidero.**
Disattiva *Non distribuire di notte* per questo interruttore oppure modifica gli scarti solari.
Senza coordinate valide il blocco notturno è disattivato (e viene registrato un avviso nel log).

**Il monitoraggio segnala sempre un guasto.**
Il tuo oggetto interruttore probabilmente non restituisce il proprio stato reale (`ack=true`).
Usa un interruttore con conferma di stato oppure disattiva il *Monitoraggio della commutazione*
per questo interruttore.

**La ricerca dell'indirizzo dice che l'istanza deve essere in esecuzione.**
Avvia l'istanza automatic-feeder – il geocoding viene eseguito nel backend.

**I messaggi Telegram non arrivano.**
Nella scheda dell'interruttore è selezionata un'istanza Telegram? L'adattatore telegram è
configurato e avviato? È spuntato almeno un tipo di messaggio ed è attivato il *Monitoraggio
della commutazione*?

---

## 10. Logging & Ricerca degli errori

L'adattatore registra ai consueti livelli di ioBroker. Per messaggi dettagliati alza il livello
di log dell'istanza (Istanze → automatic-feeder.x → Livello di log) a **debug** o **silly**:

* **error** – errori che richiedono attenzione (ad es. scrittura sull'interruttore fallita).
* **warn** – errori di configurazione (nessuna coordinata, programma non valido …).
* **info** – traguardi (avvio, una distribuzione eseguita o bloccata, attivatore manuale).
* **debug** – svolgimento dettagliato (decisioni di pianificazione, aggiornamenti di temperatura,
  geocoding, valori di accensione/spegnimento, verifica confermata/timeout).
* **silly** – tracciamento molto dettagliato (ogni timer, ogni controllo di blocco, ogni cambio
  di stato).

---

📖 [Documentazione principale (inglese)](../../README.md)
