# Older changelog

Changelog entries that were moved out of [README.md](README.md) (it keeps the latest 10) are
collected here.

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
