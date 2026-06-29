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

Control for (converted) automatic feeders. The adapter switches up to **5 freely selectable
switches** (existing ioBroker objects) on a schedule for a configurable duration ("feeding").
Optionally it evaluates air and water temperature, and uses your geo-coordinates to calculate
the sun position so it never feeds at night.

### Features

* Up to 5 switches, each with a free name (= its own configuration tab).
* Two feeding modes per switch:
  * **Fixed times** (e.g. 08:00 and 18:00).
  * **Interval within a time window** (e.g. every 60 min between 08:00 and 18:00).
* Configurable **feeding duration in seconds** per switch.
* **Temperature blocking**: block feeding below or above freely selectable water and/or air
  temperatures.
* **Night protection** via sunrise/sunset with a configurable offset (morning/evening).
* **Manual trigger** (`feedNow`) per switch and a **"Feed now" button** with a selectable
  duration; optionally ignoring all blocks.
* **Switching supervision** per switch: verifies that the switch actually turns on and off
  (needs a switch that reports its state back, `ack=true`), with optional **Telegram
  notifications** (successful feeding / could-not-feed / switch-off fault).

### Configuration

**"General settings" tab**
* **Location (mandatory)**: use the ioBroker system settings *or* define it specifically –
  via address search and a marker on an OpenStreetMap map (no API key needed).
* **Sun window**: offsets in minutes after sunrise / before sunset.
* **Temperature sources**: enable air and water temperature and pick the respective object.
* **Switches**: add switches (max. 5), name them, select the object, activate.

**Per-switch tab** (created dynamically, labelled with the switch name)
* Mode (fixed times / interval), times resp. time window + interval, feeding duration,
  temperature blocking, night/manual options, switching supervision, Telegram notifications,
  and a manual feed button.

### Data points

Global:
* `info.connection` – adapter running / configuration valid
* `airTemperature`, `waterTemperature` – currently measured temperatures
* `sunrise`, `sunset` – calculated times

Per switch under `switches.<id>.`:
* `feedingActive` – feeding currently running
* `lastFeeding`, `nextFeeding` – last / next feeding
* `blocked`, `blockReason` – currently blocked + reason
* `lastResult`, `error` – result of the last feeding attempt + fault flag
* `feedNow` – manual trigger (writable)

> Note: address search/geocoding (Nominatim) and the map tiles need internet access. Geocoding
> runs in the adapter backend; the instance must be running for it.

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

### **WORK IN PROGRESS**
* (ssbingo) initial release

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
