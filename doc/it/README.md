![Logo](../../admin/futterautomat.png)
# ioBroker.futterautomat

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## Adattatore futterautomat per ioBroker

Controllo per alimentatori automatici (modificati). L'adattatore accende e spegne fino a
**5 interruttori liberamente selezionabili** (oggetti ioBroker esistenti) secondo una
pianificazione per una durata configurabile (« alimentazione »). Facoltativamente vengono
considerate la temperatura dell'aria e dell'acqua e, tramite le coordinate geografiche, viene
calcolata la posizione del sole per non alimentare di notte.

### Funzioni

* Fino a 5 interruttori, ciascuno con un nome libero (= scheda di configurazione propria).
* Due modalità di alimentazione per interruttore:
  * **Orari fissi** (es. 08:00 e 18:00).
  * **Intervallo all'interno di una finestra oraria** (es. ogni 60 min tra 08:00 e 18:00).
* **Durata di alimentazione in secondi** configurabile per interruttore.
* **Blocco per temperatura**: bloccare l'alimentazione sotto o sopra temperature dell'acqua
  e/o dell'aria liberamente impostabili.
* **Protezione notturna** tramite alba/tramonto con offset configurabile (mattina/sera).
* **Attivazione manuale** (`feedNow`) per interruttore e un **pulsante « Alimenta ora »** con
  durata selezionabile; opzionalmente ignorando tutti i blocchi.
* **Supervisione della commutazione** per interruttore: verifica che l'interruttore si accenda
  e si spenga effettivamente (richiede un interruttore che restituisca il proprio stato,
  `ack=true`), con **notifiche Telegram** opzionali (alimentazione riuscita / non eseguibile /
  guasto allo spegnimento).

### Configurazione

**Scheda « Impostazioni generali »**
* **Posizione (obbligatoria)**: usare le impostazioni di sistema *oppure* definirla
  manualmente – tramite ricerca dell'indirizzo e marcatore su una mappa OpenStreetMap (nessuna
  chiave API necessaria).
* **Finestra solare**: offset in minuti dopo l'alba / prima del tramonto.
* **Sorgenti di temperatura**: abilitare la temperatura dell'aria e dell'acqua e scegliere il
  relativo oggetto.
* **Interruttori**: aggiungere interruttori (max. 5), assegnare i nomi, selezionare l'oggetto,
  attivare.

**Scheda per interruttore** (creata dinamicamente, con il nome dell'interruttore)
* Modalità (orari fissi / intervallo), orari o finestra + intervallo, durata di alimentazione,
  blocco per temperatura, opzioni notte/manuale, supervisione della commutazione, notifiche
  Telegram, pulsante di alimentazione manuale.

### Punti dati

Globale:
* `info.connection` – adattatore in funzione / configurazione valida
* `airTemperature`, `waterTemperature` – temperature attualmente misurate
* `sunrise`, `sunset` – orari calcolati

Per interruttore in `switches.<id>.`:
* `feedingActive` – alimentazione in corso
* `lastFeeding`, `nextFeeding` – ultima / prossima alimentazione
* `blocked`, `blockReason` – attualmente bloccato + motivo
* `lastResult`, `error` – risultato dell'ultimo tentativo + flag di guasto
* `feedNow` – attivazione manuale (scrivibile)

> Nota: la ricerca dell'indirizzo/geocodifica (Nominatim) e le tile della mappa richiedono
> l'accesso a Internet. La geocodifica viene eseguita nel backend dell'adattatore; l'istanza
> deve essere in esecuzione.

---

📖 [Documentazione principale (inglese)](../../README.md)
