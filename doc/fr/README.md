![Logo](../../admin/futterautomat.png)
# ioBroker.futterautomat

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## Adaptateur futterautomat pour ioBroker

Commande pour distributeurs automatiques de nourriture (modifiés). L'adaptateur active et
désactive jusqu'à **5 interrupteurs librement sélectionnables** (objets ioBroker existants)
selon un planning pendant une durée configurable (« distribution »). En option, la température
de l'air et de l'eau est prise en compte, et les coordonnées géographiques servent à calculer
la position du soleil afin de ne jamais nourrir la nuit.

### Fonctionnalités

* Jusqu'à 5 interrupteurs, chacun avec un nom libre (= son propre onglet de configuration).
* Deux modes de distribution par interrupteur :
  * **Heures fixes** (p. ex. 08:00 et 18:00).
  * **Intervalle dans une plage horaire** (p. ex. toutes les 60 min entre 08:00 et 18:00).
* **Durée de distribution en secondes** configurable par interrupteur.
* **Blocage par température** : bloquer la distribution en dessous ou au-dessus de
  températures d'eau et/ou d'air librement définissables.
* **Protection nocturne** via lever/coucher du soleil avec décalage configurable (matin/soir).
* **Déclenchement manuel** (`feedNow`) par interrupteur et un **bouton « Nourrir maintenant »**
  avec durée sélectionnable ; en option en ignorant tous les blocages.
* **Surveillance de la commutation** par interrupteur : vérifie que l'interrupteur s'allume et
  s'éteint réellement (nécessite un interrupteur qui renvoie son état, `ack=true`), avec des
  **notifications Telegram** optionnelles (distribution réussie / impossible / défaut d'arrêt).

### Configuration

**Onglet « Réglages généraux »**
* **Emplacement (obligatoire)** : utiliser les réglages système *ou* définir spécifiquement –
  via recherche d'adresse et marqueur sur une carte OpenStreetMap (aucune clé API requise).
* **Fenêtre solaire** : décalages en minutes après le lever / avant le coucher du soleil.
* **Sources de température** : activer la température de l'air et de l'eau et choisir l'objet
  correspondant.
* **Interrupteurs** : ajouter des interrupteurs (max. 5), les nommer, sélectionner l'objet,
  activer.

**Onglet par interrupteur** (créé dynamiquement, intitulé avec le nom de l'interrupteur)
* Mode (heures fixes / intervalle), heures ou plage + intervalle, durée de distribution,
  blocage par température, options nuit/manuel, surveillance de la commutation, notifications
  Telegram, bouton de distribution manuelle.

### Points de données

Global :
* `info.connection` – adaptateur en marche / configuration valide
* `airTemperature`, `waterTemperature` – températures actuellement mesurées
* `sunrise`, `sunset` – heures calculées

Par interrupteur sous `switches.<id>.` :
* `feedingActive` – distribution en cours
* `lastFeeding`, `nextFeeding` – dernière / prochaine distribution
* `blocked`, `blockReason` – actuellement bloqué + motif
* `lastResult`, `error` – résultat de la dernière tentative + indicateur de défaut
* `feedNow` – déclenchement manuel (accessible en écriture)

> Remarque : la recherche d'adresse/le géocodage (Nominatim) et les tuiles de carte nécessitent
> un accès Internet. Le géocodage s'exécute dans le backend de l'adaptateur ; l'instance doit
> donc être en cours d'exécution.

---

📖 [Documentation principale (anglais)](../../README.md)
