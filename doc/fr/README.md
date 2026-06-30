![Logo](../../admin/automatic-feeder.png)
# ioBroker.automatic-feeder

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## Adaptateur automatic-feeder pour ioBroker

Cet adaptateur transforme n'importe quel interrupteur ioBroker déjà existant (une prise, un
relais, une sortie GPIO …) en un **distributeur de nourriture commandé par minuterie**. Il active
la sortie aux heures que tu as définies pendant un nombre de secondes déterminé et peut tenir
compte de la température ainsi que de l'alternance jour/nuit, afin que la distribution n'ait
jamais lieu au mauvais moment.

Ce document est un guide complet. Si tu n'as jamais utilisé l'adaptateur, lis-le de haut en
bas — le **Démarrage rapide** te permet d'effectuer ta première distribution en quelques
minutes, le reste explique chaque réglage en détail.

---

## Table des matières

1. [Ce que fait l'adaptateur](#1-ce-que-fait-ladaptateur)
2. [Prérequis](#2-prérequis)
3. [Installation](#3-installation)
4. [Démarrage rapide](#4-démarrage-rapide--la-première-distribution)
5. [La page de configuration en détail](#5-la-page-de-configuration-en-détail)
6. [Objets / Points de données](#6-objets--points-de-données)
7. [Exemples / Recettes](#7-exemples--recettes)
8. [Notifications Telegram](#8-notifications-telegram)
9. [Dépannage & FAQ](#9-dépannage--faq)
10. [Journalisation & recherche d'erreurs](#10-journalisation--recherche-derreurs)

---

## 1. Ce que fait l'adaptateur

Une « distribution » est au fond très simple : **sortie ACTIVÉE → attendre un nombre de secondes
réglable → DÉSACTIVÉE de nouveau**. Sur un distributeur de nourriture modifié, le moteur tourne
pendant ce temps et distribue la nourriture.

L'adaptateur gère **jusqu'à 5 interrupteurs**, chacun totalement indépendant et doté de son
propre onglet de configuration, nommé d'après l'interrupteur. Pour chaque interrupteur, tu
définis :

* **quand** la distribution a lieu — soit à des **heures fixes** (p. ex. 08:00 et 18:00), soit à
  **intervalle** régulier à l'intérieur d'une plage horaire (p. ex. toutes les 60 minutes entre
  08:00 et 18:00) ;
* **combien de temps** la sortie reste activée (durée de distribution en secondes) ;
* **si la distribution est bloquée** lorsque la température de l'eau ou de l'air est trop
  basse/haute ;
* **si la distribution est interdite la nuit** (selon le lever et le coucher du soleil réels pour
  ton emplacement) ;
* **si le processus de commutation est surveillé** (vérification que l'activation et la
  désactivation ont réellement eu lieu) et, en option, l'envoi d'un message **Telegram** sur le
  résultat.

Tu peux déclencher une distribution **manuellement** à tout moment — directement depuis la page de
configuration (bouton avec durée librement réglable) ou via un point de données (p. ex. un bouton
dans une vue VIS).

> Important : l'adaptateur ne crée pas l'interrupteur lui-même. Il **pilote un objet déjà
> existant** dans ton ioBroker. Cet objet, tu le sélectionnes dans la configuration.

---

## 2. Prérequis

| Tu as besoin de | Détails |
|-------------|---------|
| **ioBroker** avec un **admin** récent (≥ 7) | La page de configuration est réalisée avec React. |
| **Un objet interrupteur** | Un point de données ioBroker accessible en écriture qui active/désactive le distributeur — p. ex. une prise (`shelly.0.…`, `sonoff.0.…`, `zigbee.0.…`), un relais ou une variable de script. |
| **Coordonnées géographiques** | Pour le calcul du lever/coucher du soleil. Soit depuis les paramètres système d'ioBroker, soit via une adresse/carte. **Obligatoire.** |
| *(optionnel)* Objets de température | Des points de données existants avec la température de l'air et/ou de l'eau, si tu souhaites bloquer la distribution selon la température. |
| *(optionnel)* Une instance **Telegram** | L'adaptateur officiel `telegram`, installé et démarré, si tu souhaites des notifications push. |
| Accès Internet sur l'hôte ioBroker | Uniquement pour la recherche d'adresse/la carte dans la configuration. Le fonctionnement normal se fait hors ligne. |

---

## 3. Installation

1. Dans l'**admin** ioBroker, ouvre l'onglet **Adaptateurs**.
2. Recherche **automatic-feeder** dans la liste des adaptateurs et clique sur **Installer**.
3. Crée une **instance** de l'adaptateur.
4. Ouvre les paramètres de l'instance (icône en forme d'engrenage) — la page de configuration avec
   l'onglet **Réglages de base** (Grundeinstellungen) devrait apparaître. Si elle reste vide,
   consulte [Dépannage](#9-dépannage--faq).

---

## 4. Démarrage rapide – la première distribution

Objectif : un interrupteur doit distribuer — immédiatement, pour le test — pendant 5 secondes.

1. **Ouvre les paramètres** de l'instance automatic-feeder.
2. Dans l'onglet **Réglages de base** (Grundeinstellungen) :
   * Sous **Emplacement** (Standort), laisse l'option *Reprendre les paramètres système* si ton
     ioBroker possède déjà des coordonnées. Sinon, choisis *Définir un emplacement spécifique*,
     saisis l'adresse, clique sur **Rechercher** et confirme le marqueur sur la carte.
   * Fais défiler vers le bas jusqu'à **Interrupteurs** (Schalter) et clique sur **Ajouter un
     interrupteur**.
   * Attribue un **Nom** (p. ex. `Koi-Teich`). Ce nom deviendra le titre d'un onglet dédié.
   * À côté de **Objet interrupteur** (Schalter-Objekt), clique sur l'icône de liste et choisis le
     point de données qui commande ton automate (p. ex. ta prise). L'interrupteur doit être
     **actif** (case à gauche cochée).
3. **Enregistre** (disquette/coche en bas). Un nouvel onglet portant le nom de ton interrupteur
   apparaît.
4. Ouvre cet **onglet d'interrupteur**. Tout en haut, sous **Distribution manuelle**, règle une
   durée (p. ex. `5` secondes) et clique sur **Distribuer maintenant**. La sortie devrait
   s'activer pendant 5 secondes puis se désactiver à nouveau.
5. Dans le même onglet, configure le véritable planning sous **Plan de distribution** (p. ex.
   heures fixes 08:00 et 18:00) et règle la **Durée de distribution** sous **Processus de
   distribution**, puis **Enregistre**.

C'est terminé — à partir de maintenant, l'adaptateur distribue automatiquement. La suite explique
les options en détail.

---

## 5. La page de configuration en détail

La configuration comporte un onglet **Réglages de base** (Grundeinstellungen) ainsi qu'**un onglet
par interrupteur** (créé automatiquement dès qu'un interrupteur a un nom). Si une page ne défile
pas, agrandis la fenêtre ou utilise la barre de défilement à droite — toutes les sections sont
accessibles.

### 5.1 Onglet « Réglages de base » (Grundeinstellungen)

#### Emplacement (obligatoire)

L'adaptateur a besoin de ta position géographique pour calculer le lever et le coucher du soleil
(pour le blocage nocturne). Deux possibilités :

* **Reprendre les paramètres système** — utilise la latitude/longitude de la configuration système
  d'ioBroker (recommandé si elles y sont déjà définies). Les valeurs actuelles sont affichées.
* **Définir un emplacement spécifique** — détermine la position toi-même :
  * Saisis une **adresse** et appuie sur **Rechercher**. L'adaptateur la résout (via
    OpenStreetMap / Nominatim) et place un marqueur.
  * Ou **clique sur la carte** / **fais glisser le marqueur** pour choisir l'endroit exact.
  * La latitude/longitude peut aussi être saisie directement ; la carte suit.

> La recherche d'adresse s'effectue dans le backend de l'adaptateur, l'**instance doit donc être
> en cours d'exécution**. La carte et la recherche nécessitent un accès Internet.

#### Fenêtre solaire (pas de distribution la nuit)

Définit la plage horaire pendant laquelle la distribution est autorisée :

* **Minutes après le lever du soleil** — ne distribuer qu'à partir de ce nombre de minutes *après*
  le lever du soleil.
* **Minutes avant le coucher du soleil** — arrêter ce nombre de minutes *avant* le coucher du
  soleil.

Exemple : avec un lever du soleil à 06:30, un coucher à 21:00 et des décalages de 30 / 30, la
distribution n'est autorisée qu'entre **07:00 et 20:30**. Chaque interrupteur peut tenir compte de
cette fenêtre individuellement ou l'ignorer (voir *Restrictions* dans l'onglet de l'interrupteur).
Les heures calculées figurent en outre dans les points de données `sunrise` / `sunset` et sont
recalculées automatiquement chaque nuit.

#### Sources de température

Pour le blocage en fonction de la température, active ici les sources et choisis les objets :

* **Température de l'air** — coche la case et sélectionne le point de données contenant la
  température de l'air.
* **Température de l'eau** — coche la case et sélectionne le point de données contenant la
  température de l'eau.

Seuls les points de données numériques sont pertinents. Les valeurs actuelles sont reflétées dans
les points de données `airTemperature` / `waterTemperature`. Les seuils proprement dits se règlent
**par interrupteur** (voir *Blocage par température*).

#### Interrupteurs

La liste des distributeurs de nourriture (jusqu'à 5). Pour chaque entrée :

* **Actif** (case) — seuls les interrupteurs actifs sont planifiés.
* **Nom** — texte libre ; devient le titre de l'onglet de l'interrupteur et le nom du canal dans
  l'arborescence des objets.
* **Objet interrupteur** — le point de données ioBroker existant qui est piloté. À sélectionner via
  l'icône de liste, à vider via la croix.

Avec **Ajouter un interrupteur**, tu en crées un de plus (max. 5) ; avec l'icône de corbeille, tu
en supprimes un. Lors de la suppression, ses points de données sont également effacés.

### 5.2 Onglets d'interrupteur

Chaque interrupteur configuré reçoit son propre onglet portant son nom. Il contient les sections
suivantes.

#### Distribution manuelle

* **Durée de la distribution manuelle (secondes)** — la durée utilisée par le bouton.
* **Distribuer maintenant** — déclenche immédiatement une distribution avec cette durée. Pratique
  pour tester ou pour une portion supplémentaire. (Le fait que les blocages soient ignorés ou non
  dépend de *Le déclencheur manuel ignore tous les blocages* sous *Restrictions*.)
* Pour le bouton, l'instance doit être en cours d'exécution et la configuration **enregistrée**.

#### Plan de distribution

Choisis **un** mode :

* **Heures fixes** — une liste d'horaires (`HH:mm`). Ajoute-en autant que tu veux ; l'automate
  fonctionne chaque jour à chacun d'eux. Exemple : `08:00` et `18:00`.
* **Intervalle à l'intérieur d'une plage** — distribuer de façon répétée à l'intérieur d'une
  fenêtre :
  * **Début de la plage** / **Fin de la plage** — p. ex. 08:00 à 18:00.
  * **Intervalle (minutes)** — p. ex. 60 → distribue chaque jour à 08:00, 09:00, … jusqu'à la fin
    de la fenêtre.

La prochaine heure planifiée figure à tout moment dans le point de données `nextFeeding`.

#### Processus de distribution

* **Durée de distribution (secondes)** — combien de temps la sortie reste ACTIVÉE lors d'une
  distribution planifiée.
* **Valeur d'activation** / **Valeur de désactivation** — les valeurs écrites dans l'objet
  interrupteur. Par défaut `true` et `false`, ce qui convient à la plupart des prises/relais. Si
  ton appareil attend des nombres ou du texte, saisis ici p. ex. `1` / `0` ou `ON` / `OFF`.

#### Blocage par température

Affiché uniquement pour les sources de température activées dans les réglages de base. Par
interrupteur :

* **Bloquer selon la température de l'eau** — *Bloquer si en dessous de* et/ou *Bloquer si
  au-dessus de* (°C).
* **Bloquer selon la température de l'air** — la même chose pour l'air.

Si la température actuelle se trouve en dehors de la plage autorisée, la distribution est ignorée
et la raison est écrite dans `blockReason`. (Si une valeur de température est inconnue, cette
source ne bloque pas.)

#### Restrictions

* **Ne pas distribuer la nuit** — tient compte de la fenêtre solaire (décalages inclus).
  Désactive-le si cet interrupteur peut distribuer 24 h/24.
* **Le déclencheur manuel ignore tous les blocages** — si activé, le bouton et le point de données
  `feedNow` distribuent même en cas de blocage par température/nocturne actif.

#### Surveillance de la commutation

Après la commutation, l'adaptateur peut vérifier si l'interrupteur a **réellement** atteint l'état
activé puis désactivé, et signale pour chaque distribution l'un des trois résultats suivants :

| Résultat | Signification | Message |
|----------|-----------|---------|
| ✅ Succès | L'interrupteur s'est activé puis désactivé comme prévu | « Distribution déclenchée pour x s. » |
| ❌ Échec de l'activation | L'interrupteur n'a jamais confirmé l'état ACTIVÉ | « La distribution n'a pas pu être effectuée. Vérifiez l'interrupteur ! » |
| ❌ Échec de la désactivation | Il s'est activé mais ne s'est pas désactivé de nouveau | « Défaut : le distributeur ne s'est pas éteint ! » |

> Le message est envoyé dans la langue système ioBroker configurée (anglais par défaut).


* **Vérifier que l'interrupteur s'active et se désactive réellement** — active la surveillance.
* **Délai d'attente de la surveillance (secondes)** — combien de temps attendre la confirmation.

> **Important :** la surveillance ne fonctionne que si l'interrupteur **renvoie son état réel**,
> c.-à-d. que l'objet cible est mis à jour avec `ack=true` (typique des prises/relais avec retour
> d'état). Un simple booléen auxiliaire que personne ne confirme signalerait toujours une
> anomalie — il faut alors désactiver la surveillance pour cet interrupteur.

Le résultat figure en outre dans les points de données `lastResult` (texte) et `error` (boolean),
ce qui te permet d'y réagir (p. ex. déclencher ta propre notification).

#### Notifications Telegram

Envoie les messages de la surveillance de commutation vers Telegram — configuré **par
interrupteur** :

* **Instance Telegram** — choisis l'une des instances `telegram.*` installées (ou *Aucune*, pour
  désactiver Telegram pour cet interrupteur). Si aucune n'est installée, le champ le signale.
* **Destinataire Telegram (optionnel)** — un utilisateur/nom de chat précis, tel que configuré dans
  l'adaptateur telegram ; laisse vide pour envoyer à tous les destinataires configurés.
* **Cases à cocher** — sélectionne quels messages sont envoyés : distribution réussie, distribution
  impossible et/ou anomalie de désactivation.

La configuration complète est décrite sous [Notifications Telegram](#8-notifications-telegram).

---

## 6. Objets / Points de données

L'adaptateur crée les points de données suivants dans son espace de noms
(`automatic-feeder.<instanz>.`).

**Global**

| Point de données | Type | Signification |
|------------|-----|-----------|
| `info.connection` | boolean (ro) | L'adaptateur fonctionne et la configuration est valide. |
| `airTemperature` | number (ro) | Reflet de la source de température de l'air configurée. |
| `waterTemperature` | number (ro) | Reflet de la source de température de l'eau configurée. |
| `sunrise` / `sunset` | string (ro) | Lever/coucher du soleil calculé pour aujourd'hui. |

**Par interrupteur sous `switches.<id>.`** (`<id>` est un ID interne comme `sw-0`)

| Point de données | Type | Signification |
|------------|-----|-----------|
| `feedingActive` | boolean (ro) | Une distribution est en cours. |
| `lastFeeding` | string (ro) | Horodatage de la dernière distribution. |
| `nextFeeding` | string (ro) | Horodatage de la prochaine distribution planifiée. |
| `blocked` | boolean (ro) | La dernière tentative a été bloquée. |
| `blockReason` | string (ro) | Raison du blocage (nuit/température). |
| `lastResult` | string (ro) | Texte du résultat de la dernière tentative de distribution. |
| `error` | boolean (ro) | La dernière tentative a connu une anomalie de commutation. |
| `feedNow` | boolean (rw) | Écrire `true` pour distribuer manuellement. |

Ces points de données peuvent être utilisés dans VIS, des scripts ou d'autres adaptateurs — p. ex.
afficher `nextFeeding` sur un tableau de bord ou déclencher ta propre alarme lorsque `error =
true`.

---

## 7. Exemples / Recettes

**Bassin à koïs, deux fois par jour, uniquement s'il fait assez chaud**
* Mode *Heures fixes* → `08:00`, `18:00` ; durée `6` s.
* Active la température de l'eau dans les réglages de base, puis dans l'onglet de l'interrupteur
  *Bloquer selon la température de l'eau* → *Bloquer si en dessous de* `8` °C (pas de distribution
  si l'eau est trop froide).
* *Ne pas distribuer la nuit* activé.

**Volière, petites portions fréquentes pendant la journée**
* Mode *Intervalle à l'intérieur d'une plage* → 07:00–19:00, intervalle `90` min ; durée `3` s.

**Portion supplémentaire manuelle via un bouton VIS**
* Crée dans VIS un bouton qui écrit `true` sur `automatic-feeder.0.switches.sw-0.feedNow`.
* Active éventuellement *Le déclencheur manuel ignore tous les blocages*, afin que la distribution
  ait toujours lieu.

---

## 8. Notifications Telegram

1. Installe et configure l'adaptateur **telegram** (crée un bot avec @BotFather, saisis le token,
   démarre une conversation avec le bot). L'instance Telegram doit être **en cours d'exécution**.
2. Dans un **onglet d'interrupteur** automatic-feeder, ouvre la section **Notifications Telegram** :
   * Sélectionne l'**instance Telegram** dans la liste déroulante (p. ex. `telegram.0`).
   * Saisis éventuellement un **destinataire** (l'utilisateur/nom de chat affiché dans l'adaptateur
     telegram) ; laisse vide pour notifier tout le monde.
   * Coche les messages souhaités : *distribution réussie*, *distribution impossible*, *anomalie de
     désactivation*.
3. Enregistre. À partir de maintenant, les résultats de surveillance choisis sont envoyés vers
   Telegram (précédés du nom de l'interrupteur). Cela suppose que la *Surveillance de la
   commutation* soit activée pour cet interrupteur.

---

## 9. Dépannage & FAQ

**La page de configuration est vide / blanche.**
Recharge le navigateur avec **Strg+Shift+R**. Si le problème persiste, redémarre l'instance et
rouvre les paramètres.

**Le nouvel icône / une modification n'apparaît pas.**
Cache du navigateur. Effectue un rechargement forcé (Strg+Shift+R).

**Rien n'est distribué du tout.**
Vérifie dans l'ordre : l'interrupteur est **Actif** ; un **objet interrupteur** est sélectionné ;
le **planning** est valide (`nextFeeding` affiche une heure) ; il n'est pas **bloqué** (consulte
`blocked` / `blockReason`) ; la **fenêtre solaire** n'exclut pas cette heure ; règle le
**niveau de journal** de l'instance sur `debug` et observe le journal.

**La distribution n'a jamais lieu la nuit, alors que je le souhaite.**
Soit désactive *Ne pas distribuer la nuit* pour cet interrupteur, soit ajuste les décalages
solaires. Sans coordonnées valides, le blocage nocturne est désactivé (et un avertissement est
journalisé).

**La surveillance signale toujours une anomalie.**
Ton objet interrupteur ne renvoie probablement pas son état réel (`ack=true`). Soit utilise un
interrupteur avec retour d'état, soit désactive la *Surveillance de la commutation* pour cet
interrupteur.

**La recherche d'adresse indique que l'instance doit être en cours d'exécution.**
Démarre l'instance automatic-feeder — le géocodage s'effectue dans le backend.

**Les messages Telegram n'arrivent pas.**
Une instance Telegram est-elle sélectionnée dans l'onglet de l'interrupteur ? L'adaptateur telegram
est-il configuré et démarré ? Au moins un type de message est-il coché et la *Surveillance de la
commutation* activée ?

---

## 10. Journalisation & recherche d'erreurs

L'adaptateur journalise aux niveaux ioBroker habituels. Pour des messages détaillés, élève le
niveau de journal de l'instance (Instances → automatic-feeder.x → Niveau de journal) à **debug** ou
**silly** :

* **error** — erreurs nécessitant une attention (p. ex. échec de l'écriture sur l'interrupteur).
* **warn** — mauvaise configuration (pas de coordonnées, planning invalide …).
* **info** — étapes importantes (démarrage, distribution exécutée ou bloquée, déclencheur manuel).
* **debug** — déroulement détaillé (décisions de planification, mises à jour de température,
  géocodage, valeurs activation/désactivation, vérification confirmée/délai dépassé).
* **silly** — traçage très détaillé (chaque minuterie, chaque vérification de blocage, chaque
  changement d'état).

---

📖 [Documentation principale (anglais)](../../README.md)
