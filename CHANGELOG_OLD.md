# Older changelog

Changelog entries that were moved out of [README.md](README.md) (it keeps the latest 10) are
collected here.

### 0.5.0 (2026-07-01)
* (ssbingo) New per-switch **Winter pause**: during a recurring season (given as MM-DD dates that repeat every year and may wrap around New Year) feeding can be suspended, run on a reduced own interval, or once daily, each with its own winter feeding duration
* (ssbingo) Optional **Telegram reminders** a configurable number of days before the winter pause starts and ends (sent once daily up to and including the day itself, at a configurable hour), with mode-dependent texts in all 11 languages
* (ssbingo) New status data point `winterActive` per switch

### 0.4.1 (2026-06-30)
* (ssbingo) Admin UI: adding a switch no longer jumps to its (still empty) tab — the focus stays on the General settings tab so the switch object can be selected first; the new row is scrolled into view

### 0.4.0 (2026-06-30)
* (ssbingo) More reliable switch supervision for devices with delayed status feedback (e.g. Homematic radio): each verification now actively reads the current acknowledged state back and performs several staggered re-checks before reporting a fault, instead of failing after a single timeout
* (ssbingo) New per-switch option "Verification attempts" (default 3) to configure the number of staggered re-checks

### 0.3.0 (2026-06-30)
* (ssbingo) Localize the feeding result messages (Telegram and the `lastResult` data point) and the block reasons (`blockReason`) into all 11 ioBroker languages; the text now follows the configured system language and defaults to English
* (ssbingo) Translate the adapter title (`titleLang`) into all 11 languages
* (ssbingo) Clean up the package keywords (removed "Futterautomat"; "Fisch" → "Fish")

### 0.2.0 (2026-06-29)
* (ssbingo) Renamed the adapter to **Automatic Feeder** (technical name `automatic-feeder`, npm `iobroker.automatic-feeder`, namespace `automatic-feeder.0`). This is a new adapter id — reinstall and reconfigure; there is no automatic migration from `futterautomat`.

### 0.1.8 (2026-06-29)
* (ssbingo) Create the intermediate `info` and `switches` objects so every object id path has a parent (repository checker E3009)

### 0.1.7 (2026-06-29)
* (ssbingo) Remove the unsupported custom "comment-overrides" key from package.json (repository checker E0058)

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
