![Logo](admin/futterautomat.png)
# ioBroker.futterautomat

[![NPM version](https://img.shields.io/npm/v/iobroker.futterautomat.svg)](https://www.npmjs.com/package/iobroker.futterautomat)
[![Downloads](https://img.shields.io/npm/dm/iobroker.futterautomat.svg)](https://www.npmjs.com/package/iobroker.futterautomat)
![Number of Installations](https://iobroker.live/badges/futterautomat-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/futterautomat-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.futterautomat.png?downloads=true)](https://nodei.co/npm/iobroker.futterautomat/)

**Tests:** ![Test and Release](https://github.com/ssbingo/ioBroker.futterautomat/workflows/Test%20and%20Release/badge.svg)

---

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

---

## futterautomat adapter for ioBroker

This adapter turns any existing ioBroker switch (a smart plug, a relay, a GPIO output …) into a
scheduled **automatic feeder**. It switches the output on for a defined number of seconds at the
times you configure, and can take temperature and the day/night cycle into account so it never
feeds at the wrong moment.

This document is a complete manual. If you have never used the adapter before, read it from top
to bottom – the **Quick start** gets you to your first feeding in a few minutes, the rest
explains every option in detail.

> 🇩🇪 Deutsche Anleitung: [doc/de/README.md](doc/de/README.md) · other languages: see
> [Documentation](#documentation) at the bottom.

---

## Table of contents

1. [What the adapter does](#1-what-the-adapter-does)
2. [Requirements](#2-requirements)
3. [Installation](#3-installation)
4. [Quick start](#4-quick-start--your-first-feeding)
5. [The settings page in detail](#5-the-settings-page-in-detail)
6. [Objects / data points](#6-objects--data-points)
7. [Examples / recipes](#7-examples--recipes)
8. [Telegram notifications](#8-telegram-notifications)
9. [Troubleshooting & FAQ](#9-troubleshooting--faq)
10. [Logging & debugging](#10-logging--debugging)

---

## 1. What the adapter does

A "feeding" is simply: **switch an output ON → wait a configurable number of seconds → switch it
OFF again**. For a converted feeder the running motor during those seconds dispenses the food.

The adapter can manage **up to 5 switches**, each completely independent and each with its own
configuration tab named after the switch. Per switch you decide:

* **when** it feeds – either at **fixed times** (e.g. 08:00 and 18:00) or in an **interval**
  inside a time window (e.g. every 60 minutes between 08:00 and 18:00);
* **how long** the output stays on (feeding duration in seconds);
* **whether to block** feeding when the water or air temperature is too low/high;
* **whether to skip** feeding at night (based on the real sunrise/sunset for your location);
* **whether to supervise** the switch (check that it really turned on and off) and optionally
  send a **Telegram** message about the result.

You can also trigger a feeding **manually** at any time – from the adapter's settings page
(button with a freely selectable duration) or from a data point (e.g. a button in a VIS view).

> Important: the adapter never creates the switch itself. It **controls an object that already
> exists** in your ioBroker system. You select that object in the configuration.

---

## 2. Requirements

| You need | Details |
|----------|---------|
| **ioBroker** with a recent **admin** (≥ 7) | The configuration page is built with React. |
| **A switch object** | Any writable ioBroker state that turns your feeder on/off – e.g. a smart plug (`shelly.0.…`, `sonoff.0.…`, `zigbee.0.…`), a relay, a script variable. |
| **Geo-coordinates** | Used to calculate sunrise/sunset. Either taken from the ioBroker system settings or entered per address/map. **Mandatory.** |
| *(optional)* Temperature objects | Existing states that hold air and/or water temperature, if you want temperature-based blocking. |
| *(optional)* A **Telegram** instance | The official `telegram` adapter, configured and running, if you want push notifications. |
| Internet access on the ioBroker host | Only for the address search / map in the configuration. Normal operation works offline. |

---

## 3. Installation

1. In the ioBroker **admin**, open the **Adapters** tab.
2. Find **futterautomat** in the list and click **Install**.
3. Create an **instance** of the adapter.
4. Open the instance settings (the gear icon) – you should see the configuration page with the
   **General settings** tab. If it stays blank, see [Troubleshooting](#9-troubleshooting--faq).

---

## 4. Quick start – your first feeding

The goal: make one switch feed for 5 seconds, right now, to prove everything works.

1. **Open the settings** of the futterautomat instance.
2. On the **General settings** tab:
   * Under **Location**, leave *Use system settings* selected if your ioBroker already has
     coordinates. Otherwise pick *Define specific location*, type your address, click
     **Search**, and confirm the marker on the map.
   * Scroll down to **Switches** and click **Add switch**.
   * Give it a **Name** (e.g. `Koi pond`). This name becomes the title of its own tab.
   * Click the list icon next to **Switch object** and choose the state that switches your
     feeder (e.g. your smart plug). Make sure the switch is **Active** (checkbox on the left).
3. **Save** (the disk/checkmark at the bottom). A new tab named after your switch appears.
4. Open that **switch tab**. At the top under **Manual feeding**, set a duration (e.g. `5`
   seconds) and click **Feed now**. The output should turn on for 5 seconds and off again.
5. Still on the switch tab, set up the real schedule under **Feeding schedule** (e.g. fixed
   times 08:00 and 18:00) and the **Feeding duration** under **Feeding action**, then **Save**.

That's it – the adapter will now feed automatically. Everything below explains the options in
depth.

---

## 5. The settings page in detail

The configuration has a **General settings** tab plus **one tab per switch** (created
automatically once a switch has a name). If a page does not scroll, drag the window larger or
use the scrollbar on the right – all sections are reachable.

### 5.1 General settings tab

#### Location (mandatory)

The adapter needs your geographic position to calculate sunrise and sunset (for the night
protection). Two options:

* **Use system settings** – takes latitude/longitude from the ioBroker system configuration
  (the recommended option if those are already set). The current values are shown.
* **Define specific location** – set the position yourself:
  * Type an **address** and press **Search**. The adapter resolves it (via OpenStreetMap /
    Nominatim) and places a marker.
  * Or **click on the map** / **drag the marker** to the exact spot.
  * Latitude/longitude can also be typed directly; the map follows.

> The address search runs in the adapter backend, so the **instance must be running** for it.
> The map tiles and the search need internet access.

#### Sun window (no feeding at night)

This defines the time window in which feeding is allowed:

* **Minutes after sunrise** – start feeding only this many minutes *after* sunrise.
* **Minutes before sunset** – stop feeding this many minutes *before* sunset.

Example: with sunrise 06:30, sunset 21:00 and offsets 30 / 30, feeding is only allowed between
**07:00 and 20:30**. Each switch can individually obey or ignore this window (see *Restrictions*
on the switch tab). The calculated times are also published as the `sunrise` / `sunset` data
points and recalculated automatically every night.

#### Temperature sources

If you want temperature-dependent blocking, enable the sources here and pick the objects:

* **Air temperature** – tick the box and select the state that holds the air temperature.
* **Water temperature** – tick the box and select the state that holds the water temperature.

Only number states make sense here. The current values are mirrored to the `airTemperature` /
`waterTemperature` data points. The actual thresholds are configured **per switch** (see
*Temperature blocking*).

#### Switches

The list of feeders (up to 5). For each entry:

* **Active** (checkbox) – only active switches are scheduled.
* **Name** – free text; becomes the switch's tab title and the channel name in the object tree.
* **Switch object** – the existing ioBroker state to control. Use the list icon to browse, or
  the cross to clear.

Use **Add switch** to create another (max. 5) and the trash icon to remove one. Removing a
switch also deletes its data points.

### 5.2 Switch tabs

Each configured switch gets its own tab, titled with its name. It contains the following
sections.

#### Manual feeding

* **Manual feeding duration (seconds)** – the duration used by the button.
* **Feed now** – triggers a feeding immediately with that duration. Useful for testing or an
  extra portion. (Whether it ignores blocks depends on *Manual trigger ignores all blocks* in
  *Restrictions*.)
* The instance must be running and the configuration **saved** for the button to work.

#### Feeding schedule

Choose **one** mode:

* **Fixed times** – a list of clock times (`HH:mm`). Add as many as you like; the feeder runs
  at each of them every day. Example: `08:00` and `18:00`.
* **Interval within a time window** – feed repeatedly inside a window:
  * **Window start** / **Window end** – e.g. 08:00 to 18:00.
  * **Interval (minutes)** – e.g. 60 → feed at 08:00, 09:00, …, up to the end of the window,
    every day.

The next planned time is always visible in the `nextFeeding` data point.

#### Feeding action

* **Feeding duration (seconds)** – how long the output stays ON during a scheduled feeding.
* **On value** / **Off value** – the values written to the switch object. Defaults are `true`
  and `false`, which fit most smart plugs/relays. If your device expects numbers or text, enter
  e.g. `1` / `0` or `ON` / `OFF` here.

#### Temperature blocking

Only shown for the temperature sources you enabled in the General settings. Per switch you can:

* **Block by water temperature** – set *Block if below* and/or *Block if above* (°C).
* **Block by air temperature** – same, for air.

If the current temperature is outside the allowed range, the feeding is skipped and the reason
is written to `blockReason`. (If a temperature value is unknown, that source does not block.)

#### Restrictions

* **Do not feed at night** – obey the sun window (incl. the offsets). Turn off if this switch
  may feed around the clock.
* **Manual trigger ignores all blocks** – when on, the manual button and the `feedNow` data
  point feed even if a temperature/night block is active.

#### Switching supervision

After switching, the adapter can verify that the switch **actually** reached the on and off
state, and report one of three results per feeding:

| Result | Meaning | Message |
|--------|---------|---------|
| ✅ success | switch turned on and off as expected | "Fütterung wurde für x s ausgelöst." |
| ❌ on failed | the switch never confirmed the ON state | "Fütterung konnte nicht durchgeführt werden. Schalter prüfen!" |
| ❌ off failed | it turned on, but did not turn off again | "Störung Abschaltung Futterautomat!" |

* **Verify that the switch actually turns on and off** – enables the supervision.
* **Verification timeout (seconds)** – how long to wait for the confirmation.

> **Important:** supervision works only if the switch **reports its real state back**, i.e. the
> target object is updated with `ack=true` (typical for smart plugs/relays with status feedback).
> A plain helper boolean that nobody acknowledges would always report a fault – in that case
> turn supervision off for this switch.

The result is also stored in the `lastResult` (text) and `error` (boolean) data points, so you
can react to it (e.g. trigger a notification of your own).

#### Telegram notifications

Send the supervision messages to Telegram – configured **per switch**:

* **Telegram instance** – pick one of the installed `telegram.*` instances (or *None* to
  disable Telegram for this switch). If none is installed, the field tells you so.
* **Telegram recipient (optional)** – a specific user/chat name as configured in the telegram
  adapter; leave empty to send to all configured recipients.
* **Checkboxes** – choose which messages to send: successful feeding, could-not-feed, and/or
  switch-off fault.

See [Telegram notifications](#8-telegram-notifications) for the full setup.

---

## 6. Objects / data points

The adapter creates the following states under its namespace
(`futterautomat.<instance>.`).

**Global**

| Data point | Type | Meaning |
|------------|------|---------|
| `info.connection` | boolean (ro) | Adapter is running and the configuration is valid. |
| `airTemperature` | number (ro) | Mirror of the configured air-temperature source. |
| `waterTemperature` | number (ro) | Mirror of the configured water-temperature source. |
| `sunrise` / `sunset` | string (ro) | Calculated sunrise/sunset for today. |

**Per switch, under `switches.<id>.`** (`<id>` is an internal id like `sw-0`)

| Data point | Type | Meaning |
|------------|------|---------|
| `feedingActive` | boolean (ro) | A feeding is running right now. |
| `lastFeeding` | string (ro) | Timestamp of the last feeding. |
| `nextFeeding` | string (ro) | Timestamp of the next planned feeding. |
| `blocked` | boolean (ro) | The last attempt was blocked. |
| `blockReason` | string (ro) | Why it was blocked (night/temperature). |
| `lastResult` | string (ro) | Result text of the last feeding attempt. |
| `error` | boolean (ro) | The last attempt had a switching fault. |
| `feedNow` | boolean (rw) | Write `true` to trigger a manual feeding. |

You can use these in VIS, scripts or other adapters – for example show `nextFeeding` on a
dashboard, or react on `error = true` to send your own alarm.

---

## 7. Examples / recipes

**Koi pond, twice a day, only when warm enough**
* Mode *Fixed times* → `08:00`, `18:00`; duration `6` s.
* Enable water temperature in General settings, then on the switch tab *Block by water
  temperature* → *Block if below* `8` °C (no feeding when the water is too cold).
* *Do not feed at night* on.

**Aviary, frequent small portions during the day**
* Mode *Interval within a time window* → 07:00–19:00, interval `90` min; duration `3` s.

**Manual extra portion from a VIS button**
* Put a button in VIS that writes `true` to `futterautomat.0.switches.sw-0.feedNow`.
* Optionally set *Manual trigger ignores all blocks* so it always feeds.

---

## 8. Telegram notifications

1. Install and configure the **telegram** adapter (create a bot with @BotFather, enter the
   token, start a chat with your bot). Make sure the telegram instance is **running**.
2. In a futterautomat **switch tab**, open **Telegram notifications**:
   * Select your **Telegram instance** from the dropdown (e.g. `telegram.0`).
   * Optionally enter a **recipient** (the user/chat name shown in the telegram adapter); leave
     empty to notify everyone.
   * Tick the messages you want: *successful feeding*, *could-not-feed*, *switch-off fault*.
3. Save. From now on the chosen supervision results are pushed to Telegram (prefixed with the
   switch name). This requires *Switching supervision* to be enabled for that switch.

---

## 9. Troubleshooting & FAQ

**The settings page is blank / white.**
Reload the browser with **Ctrl+Shift+R** (the admin may have cached an old page). If it
persists, restart the instance and reopen the settings.

**The new icon / a change does not show up.**
Browser cache – hard-reload with **Ctrl+Shift+R**.

**Nothing gets fed.**
Check, in order: the switch is **Active**; a **switch object** is selected; the **schedule** is
valid (`nextFeeding` shows a time); it is not **blocked** (look at `blocked` / `blockReason`);
the **sun window** is not excluding the time; set the instance **log level** to `debug` and
watch the log.

**It never feeds at night although I want it to.**
Either disable *Do not feed at night* for that switch, or adjust the sun offsets. Without valid
coordinates the night protection is disabled (and a warning is logged).

**Supervision always reports a fault.**
Your switch object probably does not report its real state back (`ack=true`). Either use a
switch with status feedback, or disable *Switching supervision* for that switch.

**The address search says the instance must be running.**
Start the futterautomat instance – the geocoding runs in the backend.

**Telegram messages do not arrive.**
Is a Telegram instance selected on the switch tab? Is the telegram adapter configured and
running? Is at least one message type ticked, and is *Switching supervision* enabled?

---

## 10. Logging & debugging

The adapter logs on the standard ioBroker levels. To see detailed messages, raise the instance
log level (Instances → futterautomat.x → log level) to **debug** or **silly**:

* **error** – failures that need attention (e.g. a write to the switch failed).
* **warn** – misconfiguration (no coordinates, invalid schedule …).
* **info** – milestones (startup, a feeding executed or blocked, manual trigger).
* **debug** – detailed flow (scheduling decisions, temperature updates, geocoding, on/off
  values, verification confirmed/timeout).
* **silly** – very verbose tracing (every timer, every block check, every state change).

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

### 0.1.6 (2026-06-29)
* (ssbingo) Resolve repository checker W0083: the pinned UI packages (react, react-dom, @mui/*, @types/react(-dom)) are no longer direct dependencies (kept via peerDependencies of adapter-react-v5 + npm overrides)
* (ssbingo) Replace react-leaflet with plain Leaflet in the location picker (removes the react-leaflet dependency)
* (ssbingo) Upgrade TypeScript to 6.x; exclude test files from the type-check
* (ssbingo) Use cron schedules for Dependabot (S8906)

### 0.1.5 (2026-06-29)
* (ssbingo) Keep the admin UI stack on React 18 / MUI 6 / react-leaflet 4 (required by adapter-react-v5); revert incompatible major dependency updates and block them in dependabot
* (ssbingo) Keep TypeScript on 5.x; adopt ioBroker/testing-action-check@v2 in CI

### 0.1.4 (2026-06-29)
* (ssbingo) Fully translate the admin UI into all supported languages (repository checker E5606)

### 0.1.3 (2026-06-29)
* (ssbingo) Use this.setTimeout/this.clearTimeout instead of global timers (repository checker E5005)
* (ssbingo) CI: run check-and-lint and deploy on Node 24; adapter-tests now needs check-and-lint
* (ssbingo) Migrate Dependabot auto-merge to iobroker-bot-orga/action-automerge-dependabot
* (ssbingo) dependabot.yml: add cooldown, ignore @types/node major updates, raise PR limit to 15
* (ssbingo) README/docs: install via the ioBroker admin (removed GitHub/CLI install instructions)
* (ssbingo) i18n: complete all 11 languages and drop obsolete keys; remove obsolete .prettierignore

### 0.1.2 (2026-06-29)
* (ssbingo) Require admin >= 7.6.20 (repository checker E1057)
* (ssbingo) Add the "ioBroker" keyword (repository checker W0040)
* (ssbingo) Update minor dev dependencies (@emotion/*, @types/leaflet)

### 0.1.1 (2026-06-29)
* (ssbingo) Raised the minimum Node.js version to >= 22 (Node 20 is no longer used)
* (ssbingo) Enabled npm releases via trusted publishing (OIDC) in the GitHub Actions workflow

### 0.1.0 (2026-06-29)
* (ssbingo) Scheduled feeding for up to 5 freely selectable switches (fixed times or interval within a time window)
* (ssbingo) Configurable feeding duration per switch; configurable on/off values
* (ssbingo) Temperature blocking (water/air, below/above) and night protection via sunrise/sunset with offsets
* (ssbingo) Mandatory geolocation: system settings or address search + OpenStreetMap map
* (ssbingo) Switching supervision (verify on/off, ack=true) with per-switch Telegram notifications
* (ssbingo) Manual feeding via a "Feed now" button (selectable duration) and the feedNow data point
* (ssbingo) Status data points (lastResult, error, nextFeeding, …) and detailed level-based logging
* (ssbingo) Full user manual in all 11 languages

---

[Older changelogs can be found there](CHANGELOG_OLD.md)

## Documentation

- 🇩🇪 [Deutsche Dokumentation](doc/de/README.md)
- 🇷🇺 [Документация на русском](doc/ru/README.md)
- 🇳🇱 [Nederlandse documentatie](doc/nl/README.md)
- 🇫🇷 [Documentation française](doc/fr/README.md)
- 🇮🇹 [Documentazione italiana](doc/it/README.md)
- 🇪🇸 [Documentación en español](doc/es/README.md)
- 🇵🇱 [Dokumentacja polska](doc/pl/README.md)
- 🇵🇹 [Documentação portuguesa](doc/pt/README.md)
- 🇺🇦 [Документація українською](doc/uk/README.md)
- 🇨🇳 [简体中文文档](doc/zh-cn/README.md)

## License
MIT License

Copyright (c) 2026 ssbingo <s.sternitzke@online.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
