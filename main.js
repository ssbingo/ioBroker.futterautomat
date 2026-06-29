'use strict';

/*
 * ioBroker.futterautomat
 * Controls up to 5 user selected switches (existing ioBroker states) on a time
 * schedule for a configurable duration ("feeding"). Optionally evaluates air/water
 * temperature and the sun position (so it never feeds at night).
 *
 * Logging levels used (configurable per instance in the ioBroker admin):
 *   error  - failures that need attention (write failed, unexpected exception)
 *   warn   - misconfiguration / recoverable problems (no coordinates, invalid schedule)
 *   info   - operational milestones (startup, a feeding executed/blocked, manual trigger)
 *   debug  - detailed flow (config, scheduling decisions, temperature updates, geocoding)
 *   silly  - very verbose tracing (every timer, every block check, every state change)
 */

const utils = require('@iobroker/adapter-core');
const SunCalc = require('suncalc');

const MAX_SWITCHES = 5;

class Futterautomat extends utils.Adapter {
	/**
	 * @param {Partial<utils.AdapterOptions>} [options] - Adapter options
	 */
	constructor(options) {
		super({
			...options,
			name: 'futterautomat',
		});

		/** next-feeding timer per switch id */
		this.scheduleTimers = new Map();
		this.midnightTimer = null;

		/** pending switch-state verifications: objectId -> { expected, resolve, timer } */
		this.verifyWatchers = new Map();
		/** switch ids that currently have an active feeding cycle (overlap guard) */
		this.feedingBusy = new Set();
		/** set during onUnload so in-flight feeding cycles abort cleanly */
		this.terminating = false;

		this.coords = null;
		/** effective feeding window (sun +/- offsets) */
		this.window = null;
		// current temperatures (null = unknown); kept as separate fields so the
		// type checker infers a flexible type and feeds it back as number | null
		this.airTemp = null;
		this.waterTemp = null;

		this.switches = [];

		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Readable label for a switch, used in log messages.
	 *
	 * @param {ioBroker.FutterautomatSwitchConfig} sw - switch configuration
	 * @returns {string} formatted label like `"Koi-Teich" (sw-0)`
	 */
	swLabel(sw) {
		return `"${sw.name || sw.id}" (${sw.id})`;
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		this.log.info('Adapter is starting up...');
		try {
			await this.setStateAsync('info.connection', { val: false, ack: true });

			// --- read & sanitize switch configuration ---
			const rawSwitches = Array.isArray(this.config.switches) ? this.config.switches : [];
			this.switches = rawSwitches.filter(s => s && s.id).slice(0, MAX_SWITCHES);
			if (rawSwitches.length !== this.switches.length) {
				this.log.warn(
					`Ignored ${rawSwitches.length - this.switches.length} invalid/excess switch entr(ies) (max. ${MAX_SWITCHES}).`,
				);
			}

			this.log.debug(
				`Configuration: ${JSON.stringify({
					coordinateSource: this.config.coordinateSource,
					latitude: this.config.latitude,
					longitude: this.config.longitude,
					sunOffsetMorning: this.config.sunOffsetMorning,
					sunOffsetEvening: this.config.sunOffsetEvening,
					airTempEnabled: this.config.airTempEnabled,
					airTempObjectId: this.config.airTempObjectId,
					waterTempEnabled: this.config.waterTempEnabled,
					waterTempObjectId: this.config.waterTempObjectId,
					switchCount: this.switches.length,
				})}`,
			);
			for (const sw of this.switches) {
				this.log.silly(`Switch config ${this.swLabel(sw)}: ${JSON.stringify(sw)}`);
			}

			// --- resolve coordinates (mandatory) ---
			this.log.debug('Resolving geolocation...');
			await this.resolveCoordinates();
			if (!this.coords) {
				this.log.warn(
					'No geolocation configured. Night protection (sun window) is disabled until coordinates are set.',
				);
			}

			// --- create / update / clean up objects ---
			this.log.debug('Ensuring adapter objects (global + per switch)...');
			await this.createGlobalObjects();
			await this.syncSwitchObjects();

			// --- recover from an unclean shutdown: turn off switches still marked active ---
			await this.recoverActiveFeeds();

			// --- sun window + daily recalculation ---
			this.recomputeSunWindow();
			this.scheduleMidnightRecalc();

			// --- temperature sources ---
			await this.setupTemperatureSources();

			// --- switch-state supervision: subscribe to the controlled foreign states ---
			for (const sw of this.switches) {
				if (sw.enabled && sw.objectId && sw.verifyEnabled !== false) {
					this.subscribeForeignStates(sw.objectId);
					this.log.debug(
						`Supervision enabled for ${this.swLabel(sw)} (timeout ${Number(sw.verifyTimeoutSec) || 5}s).`,
					);
				}
			}

			// --- subscribe to our own manual trigger states ---
			this.subscribeStates('switches.*.feedNow');
			this.log.silly('Subscribed to switches.*.feedNow');

			// --- schedule feeding for every enabled switch ---
			let planned = 0;
			for (const sw of this.switches) {
				if (sw.enabled && sw.objectId) {
					this.scheduleSwitch(sw);
					planned++;
				} else {
					this.log.debug(
						`Switch ${this.swLabel(sw)} not scheduled (enabled=${!!sw.enabled}, hasObject=${!!sw.objectId}).`,
					);
				}
			}

			await this.setStateAsync('info.connection', { val: true, ack: true });
			this.log.info(`Started. ${this.switches.length} switch(es) configured, ${planned} scheduled.`);
		} catch (e) {
			this.log.error(`Startup failed: ${e.message}`);
			this.log.debug(e.stack || '(no stack)');
			await this.setStateAsync('info.connection', { val: false, ack: true });
		}
	}

	// ----------------------------------------------------------------------------
	// Coordinates & sun
	// ----------------------------------------------------------------------------

	async resolveCoordinates() {
		this.coords = null;
		if (this.config.coordinateSource === 'specific') {
			const lat = parseFloat(this.config.latitude);
			const lon = parseFloat(this.config.longitude);
			this.log.silly(`Specific coordinates parsed: lat=${lat}, lon=${lon}`);
			if (Number.isFinite(lat) && Number.isFinite(lon)) {
				this.coords = { lat, lon };
				this.log.debug(`Using specific coordinates: lat=${lat}, lon=${lon}`);
			} else {
				this.log.warn('Coordinate source is "specific" but latitude/longitude are invalid or empty.');
			}
		} else {
			try {
				const sys = await this.getForeignObjectAsync('system.config');
				const lat = parseFloat(String(sys?.common?.latitude));
				const lon = parseFloat(String(sys?.common?.longitude));
				this.log.silly(`system.config coordinates parsed: lat=${lat}, lon=${lon}`);
				if (Number.isFinite(lat) && Number.isFinite(lon)) {
					this.coords = { lat, lon };
					this.log.debug(`Using system coordinates: lat=${lat}, lon=${lon}`);
				} else {
					this.log.warn('No valid coordinates found in the ioBroker system settings.');
				}
			} catch (e) {
				this.log.warn(`Could not read system coordinates: ${e.message}`);
			}
		}
	}

	/** Computes today's feeding window from sunrise/sunset and the configured offsets. */
	recomputeSunWindow() {
		if (!this.coords) {
			this.window = null;
			this.log.debug('No coordinates -> sun window cleared (night protection inactive).');
			return;
		}
		const now = new Date();
		const times = SunCalc.getTimes(now, this.coords.lat, this.coords.lon);
		if (!times || !times.sunrise || !times.sunset) {
			this.window = null;
			this.log.warn('Could not compute sunrise/sunset for the configured coordinates.');
			return;
		}
		const morning = Number(this.config.sunOffsetMorning) || 0;
		const evening = Number(this.config.sunOffsetEvening) || 0;
		const start = new Date(times.sunrise.getTime() + morning * 60000);
		const end = new Date(times.sunset.getTime() - evening * 60000);
		this.window = { start, end };

		this.setStateAsync('sunrise', { val: times.sunrise.toISOString(), ack: true });
		this.setStateAsync('sunset', { val: times.sunset.toISOString(), ack: true });
		this.log.debug(
			`Sun times: sunrise=${times.sunrise.toISOString()}, sunset=${times.sunset.toISOString()}; ` +
				`offsets +${morning}/-${evening} min -> feeding window ${start.toISOString()} ... ${end.toISOString()}`,
		);
	}

	scheduleMidnightRecalc() {
		const now = new Date();
		const midnight = new Date(now);
		midnight.setHours(24, 0, 30, 0); // 00:00:30 next day
		const delay = midnight.getTime() - now.getTime();
		this.log.debug(
			`Midnight recalculation scheduled for ${midnight.toISOString()} (in ${Math.round(delay / 1000)}s).`,
		);
		this.midnightTimer = setTimeout(() => {
			this.log.debug('Midnight reached: recomputing sun window and rescheduling all switches.');
			this.recomputeSunWindow();
			this.scheduleMidnightRecalc();
			// reschedule all switches so the new window is honored
			for (const sw of this.switches) {
				if (sw.enabled && sw.objectId) {
					this.scheduleSwitch(sw);
				}
			}
		}, delay);
	}

	// ----------------------------------------------------------------------------
	// Objects
	// ----------------------------------------------------------------------------

	async createGlobalObjects() {
		this.log.silly('Ensuring global objects: info.connection, airTemperature, waterTemperature, sunrise, sunset');
		await this.setObjectNotExistsAsync('info.connection', {
			type: 'state',
			common: {
				name: 'Adapter running / configuration valid',
				type: 'boolean',
				role: 'indicator.connected',
				read: true,
				write: false,
				def: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync('airTemperature', {
			type: 'state',
			common: {
				name: 'Air temperature',
				type: 'number',
				role: 'value.temperature',
				unit: '°C',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync('waterTemperature', {
			type: 'state',
			common: {
				name: 'Water temperature',
				type: 'number',
				role: 'value.temperature',
				unit: '°C',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync('sunrise', {
			type: 'state',
			common: { name: 'Sunrise', type: 'string', role: 'date.sunrise', read: true, write: false },
			native: {},
		});
		await this.setObjectNotExistsAsync('sunset', {
			type: 'state',
			common: { name: 'Sunset', type: 'string', role: 'date.sunset', read: true, write: false },
			native: {},
		});
	}

	/** Creates a channel + states for every configured switch and removes obsolete ones. */
	async syncSwitchObjects() {
		const wantedIds = new Set(this.switches.map(s => s.id));
		this.log.silly(`Synchronizing switch objects. Wanted ids: ${[...wantedIds].join(', ') || '(none)'}`);

		// remove channels of switches that no longer exist
		const all = await this.getAdapterObjectsAsync();
		const prefix = `${this.namespace}.switches.`;
		for (const id of Object.keys(all)) {
			if (id.startsWith(prefix) && all[id].type === 'channel') {
				const sid = id.substring(prefix.length);
				if (!wantedIds.has(sid)) {
					await this.delObjectAsync(id, { recursive: true });
					this.log.info(`Removed obsolete switch objects for "${sid}".`);
				}
			}
		}

		for (const sw of this.switches) {
			const base = `switches.${sw.id}`;
			this.log.debug(`Ensuring objects for switch ${this.swLabel(sw)} under ${this.namespace}.${base}`);
			await this.setObjectNotExistsAsync(base, {
				type: 'channel',
				common: { name: sw.name || sw.id },
				native: {},
			});
			// keep the channel name in sync with the configured name
			await this.extendObjectAsync(base, { common: { name: sw.name || sw.id } });

			await this.setObjectNotExistsAsync(`${base}.feedingActive`, {
				type: 'state',
				common: {
					name: 'Feeding active',
					type: 'boolean',
					role: 'indicator.working',
					read: true,
					write: false,
					def: false,
				},
				native: {},
			});
			await this.setObjectNotExistsAsync(`${base}.lastFeeding`, {
				type: 'state',
				common: { name: 'Last feeding', type: 'string', role: 'date', read: true, write: false },
				native: {},
			});
			await this.setObjectNotExistsAsync(`${base}.nextFeeding`, {
				type: 'state',
				common: { name: 'Next feeding', type: 'string', role: 'date', read: true, write: false },
				native: {},
			});
			await this.setObjectNotExistsAsync(`${base}.blocked`, {
				type: 'state',
				common: {
					name: 'Feeding blocked',
					type: 'boolean',
					role: 'indicator',
					read: true,
					write: false,
					def: false,
				},
				native: {},
			});
			await this.setObjectNotExistsAsync(`${base}.blockReason`, {
				type: 'state',
				common: { name: 'Block reason', type: 'string', role: 'text', read: true, write: false, def: '' },
				native: {},
			});
			await this.setObjectNotExistsAsync(`${base}.lastResult`, {
				type: 'state',
				common: {
					name: 'Result of the last feeding attempt',
					type: 'string',
					role: 'text',
					read: true,
					write: false,
					def: '',
				},
				native: {},
			});
			await this.setObjectNotExistsAsync(`${base}.error`, {
				type: 'state',
				common: {
					name: 'Last feeding had a switching fault',
					type: 'boolean',
					role: 'indicator.error',
					read: true,
					write: false,
					def: false,
				},
				native: {},
			});
			await this.setObjectNotExistsAsync(`${base}.feedNow`, {
				type: 'state',
				common: {
					name: 'Feed now (manual trigger)',
					type: 'boolean',
					role: 'button',
					read: false,
					write: true,
					def: false,
				},
				native: {},
			});
		}
	}

	async recoverActiveFeeds() {
		this.log.silly('Checking for switches left active after an unclean shutdown...');
		for (const sw of this.switches) {
			const st = await this.getStateAsync(`switches.${sw.id}.feedingActive`);
			if (st && st.val) {
				this.log.info(`Recovering: switch ${this.swLabel(sw)} was still active, turning it off.`);
				if (sw.objectId) {
					await this.writeSwitch(sw, false);
				}
				await this.setStateAsync(`switches.${sw.id}.feedingActive`, { val: false, ack: true });
			}
		}
	}

	// ----------------------------------------------------------------------------
	// Temperatures
	// ----------------------------------------------------------------------------

	async setupTemperatureSources() {
		if (this.config.airTempEnabled && this.config.airTempObjectId) {
			this.subscribeForeignStates(this.config.airTempObjectId);
			const st = await this.getForeignStateAsync(this.config.airTempObjectId);
			if (st && st.val !== null && st.val !== undefined) {
				this.airTemp = Number(st.val);
				await this.setStateAsync('airTemperature', { val: this.airTemp, ack: true });
			}
			this.log.debug(
				`Air temperature source subscribed: ${this.config.airTempObjectId} (initial value: ${this.airTemp ?? 'unknown'}°C).`,
			);
		} else {
			this.log.debug('Air temperature source disabled.');
		}
		if (this.config.waterTempEnabled && this.config.waterTempObjectId) {
			this.subscribeForeignStates(this.config.waterTempObjectId);
			const st = await this.getForeignStateAsync(this.config.waterTempObjectId);
			if (st && st.val !== null && st.val !== undefined) {
				this.waterTemp = Number(st.val);
				await this.setStateAsync('waterTemperature', { val: this.waterTemp, ack: true });
			}
			this.log.debug(
				`Water temperature source subscribed: ${this.config.waterTempObjectId} (initial value: ${this.waterTemp ?? 'unknown'}°C).`,
			);
		} else {
			this.log.debug('Water temperature source disabled.');
		}
	}

	// ----------------------------------------------------------------------------
	// Scheduling
	// ----------------------------------------------------------------------------

	scheduleSwitch(sw) {
		// clear an existing schedule timer for this switch
		const existing = this.scheduleTimers.get(sw.id);
		if (existing) {
			clearTimeout(existing);
			this.scheduleTimers.delete(sw.id);
			this.log.silly(`Cleared existing schedule timer for ${this.swLabel(sw)}.`);
		}

		const next = this.computeNextFeeding(sw, new Date());
		if (!next) {
			this.setStateAsync(`switches.${sw.id}.nextFeeding`, { val: '', ack: true });
			this.log.warn(`Switch ${this.swLabel(sw)}: no valid schedule (mode=${sw.mode}), not planned.`);
			return;
		}

		this.setStateAsync(`switches.${sw.id}.nextFeeding`, { val: next.toISOString(), ack: true });
		const delay = Math.max(0, next.getTime() - Date.now());
		this.log.debug(
			`Switch ${this.swLabel(sw)}: mode=${sw.mode}, next feeding at ${next.toISOString()} (in ${Math.round(delay / 1000)}s).`,
		);

		const timer = setTimeout(async () => {
			this.scheduleTimers.delete(sw.id);
			this.log.debug(`Scheduled feeding timer fired for ${this.swLabel(sw)}.`);
			await this.feed(sw, false);
			this.scheduleSwitch(sw); // plan the following feeding
		}, delay);
		this.scheduleTimers.set(sw.id, timer);
		this.log.silly(`Schedule timer armed for ${this.swLabel(sw)} (delay ${delay}ms).`);
	}

	/**
	 * @param {ioBroker.FutterautomatSwitchConfig} sw - switch configuration
	 * @param {Date} now - reference time
	 * @returns {Date | null} time of the next feeding or null if none can be planned
	 */
	computeNextFeeding(sw, now) {
		const epsilon = 1000; // ignore times that are essentially "now"
		if (sw.mode === 'interval') {
			return this.nextFromInterval(sw, now);
		}
		// fixed times
		const times = Array.isArray(sw.times) ? sw.times : [];
		let best = null;
		for (const t of times) {
			const d = this.timeToDate(t, now);
			if (!d) {
				this.log.silly(`Switch ${this.swLabel(sw)}: ignoring invalid time "${t}".`);
				continue;
			}
			if (d.getTime() <= now.getTime() + epsilon) {
				d.setDate(d.getDate() + 1); // tomorrow
			}
			this.log.silly(`Switch ${this.swLabel(sw)}: candidate time "${t}" -> ${d.toISOString()}`);
			if (!best || d.getTime() < best.getTime()) {
				best = d;
			}
		}
		return best;
	}

	nextFromInterval(sw, now) {
		const start = this.timeToDate(sw.windowStart, now);
		const end = this.timeToDate(sw.windowEnd, now);
		const interval = (Number(sw.intervalMin) || 0) * 60000;
		if (!start || !end || interval <= 0 || end.getTime() <= start.getTime()) {
			this.log.silly(
				`Switch ${this.swLabel(sw)}: invalid interval config (start=${sw.windowStart}, end=${sw.windowEnd}, intervalMin=${sw.intervalMin}).`,
			);
			return null;
		}
		if (now.getTime() < start.getTime()) {
			this.log.silly(`Switch ${this.swLabel(sw)}: before window -> next is window start ${start.toISOString()}.`);
			return start;
		}
		if (now.getTime() <= end.getTime()) {
			const elapsed = now.getTime() - start.getTime();
			const steps = Math.floor(elapsed / interval) + 1;
			const candidate = new Date(start.getTime() + steps * interval);
			if (candidate.getTime() <= end.getTime()) {
				this.log.silly(
					`Switch ${this.swLabel(sw)}: inside window -> next slot ${candidate.toISOString()} (step ${steps}).`,
				);
				return candidate;
			}
		}
		// past the window -> first slot tomorrow
		const tomorrow = new Date(start);
		tomorrow.setDate(tomorrow.getDate() + 1);
		this.log.silly(`Switch ${this.swLabel(sw)}: after window -> next is tomorrow ${tomorrow.toISOString()}.`);
		return tomorrow;
	}

	/**
	 * Builds a Date for today at "HH:mm".
	 *
	 * @param {string} hhmm - time string in "HH:mm" format
	 * @param {Date} ref - reference date (provides the day)
	 * @returns {Date | null} the resulting date or null if the input is invalid
	 */
	timeToDate(hhmm, ref) {
		if (typeof hhmm !== 'string' || !/^\d{1,2}:\d{2}/.test(hhmm)) {
			return null;
		}
		const [h, m] = hhmm.split(':').map(x => parseInt(x, 10));
		if (h > 23 || m > 59) {
			return null;
		}
		const d = new Date(ref);
		d.setHours(h, m, 0, 0);
		return d;
	}

	// ----------------------------------------------------------------------------
	// Feeding & blocking
	// ----------------------------------------------------------------------------

	/**
	 * @param {ioBroker.FutterautomatSwitchConfig} sw - switch configuration
	 * @param {boolean} ignoreBlocks - if true, temperature/night blocks are skipped
	 * @param {number | null} [durationOverrideSec] - overrides the configured duration (manual button)
	 */
	async feed(sw, ignoreBlocks, durationOverrideSec = null) {
		if (!sw.objectId) {
			this.log.warn(`Switch ${this.swLabel(sw)} has no target object, skipping.`);
			return;
		}
		if (this.feedingBusy.has(sw.id)) {
			this.log.debug(`Switch ${this.swLabel(sw)}: a feeding cycle is already running, ignoring this trigger.`);
			return;
		}

		this.log.debug(`Evaluating feeding for ${this.swLabel(sw)} (ignoreBlocks=${ignoreBlocks}).`);
		const reason = ignoreBlocks ? null : this.getBlockReason(sw);
		const blocked = !!reason;
		await this.setStateAsync(`switches.${sw.id}.blocked`, { val: blocked, ack: true });
		await this.setStateAsync(`switches.${sw.id}.blockReason`, { val: reason || '', ack: true });
		if (blocked) {
			this.log.info(`Feeding of ${this.swLabel(sw)} blocked: ${reason}`);
			return;
		}

		const verify = sw.verifyEnabled !== false;
		const seconds =
			durationOverrideSec !== undefined &&
			durationOverrideSec !== null &&
			!Number.isNaN(Number(durationOverrideSec))
				? Math.max(0, Number(durationOverrideSec))
				: Number(sw.durationSec) || 0;
		this.feedingBusy.add(sw.id);
		try {
			// --- switch ON ---
			this.log.info(`Feeding ${this.swLabel(sw)} for ${seconds}s.`);
			await this.writeSwitch(sw, true);
			await this.setStateAsync(`switches.${sw.id}.feedingActive`, { val: true, ack: true });
			await this.setStateAsync(`switches.${sw.id}.lastFeeding`, { val: new Date().toISOString(), ack: true });

			if (verify) {
				const onConfirmed = await this.verifyState(sw, true);
				if (this.terminating) {
					return;
				}
				if (!onConfirmed) {
					// Scenario 2: the switch never confirmed the ON state
					await this.writeSwitch(sw, false); // safety: try to switch off again
					await this.setStateAsync(`switches.${sw.id}.feedingActive`, { val: false, ack: true });
					this.log.error(
						`Feeding of ${this.swLabel(sw)} could not be performed - switch did not confirm ON. Check the switch!`,
					);
					const failMsg = 'Fütterung konnte nicht durchgeführt werden. Schalter prüfen!';
					await this.reportResult(sw, true, failMsg);
					this.notify(sw, 'onFail', failMsg);
					return;
				}
				this.log.debug(`${this.swLabel(sw)}: ON confirmed by target.`);
			}

			// --- keep on for the configured duration (this.delay is cleared on unload) ---
			this.log.debug(`Switch ${this.swLabel(sw)} is ON, will switch OFF in ${seconds}s.`);
			if (seconds > 0) {
				await this.delay(seconds * 1000);
			}
			if (this.terminating) {
				return;
			}

			// --- switch OFF ---
			await this.writeSwitch(sw, false);
			await this.setStateAsync(`switches.${sw.id}.feedingActive`, { val: false, ack: true });

			if (verify) {
				const offConfirmed = await this.verifyState(sw, false);
				if (this.terminating) {
					return;
				}
				if (!offConfirmed) {
					// Scenario 3: ON worked, but the switch did not turn OFF again
					this.log.error(
						`Fault: ${this.swLabel(sw)} did not switch OFF as planned (still ON?). Check the switch!`,
					);
					const offFailMsg = 'Störung Abschaltung Futterautomat!';
					await this.reportResult(sw, true, offFailMsg);
					this.notify(sw, 'offFail', offFailMsg);
					return;
				}
				this.log.debug(`${this.swLabel(sw)}: OFF confirmed by target.`);
			}

			// --- Scenario 1: everything worked ---
			const okMsg = `Fütterung wurde für ${seconds}s ausgelöst.`;
			await this.reportResult(sw, false, okMsg);
			this.notify(sw, 'success', okMsg);
			this.log.info(`${this.swLabel(sw)}: ${okMsg}`);
		} finally {
			this.feedingBusy.delete(sw.id);
		}
	}

	/**
	 * Waits until the controlled switch reaches the expected (acknowledged) value
	 * within the configured timeout. Requires the target to report its state with
	 * ack=true, otherwise it cannot be distinguished from our own command.
	 *
	 * @param {ioBroker.FutterautomatSwitchConfig} sw - switch configuration
	 * @param {boolean} expectOn - true = wait for the on value, false = off value
	 * @returns {Promise<boolean>} true if confirmed, false on timeout
	 */
	verifyState(sw, expectOn) {
		const expected = coerce(expectOn ? (sw.onValue ?? true) : (sw.offValue ?? false));
		const timeoutMs = Math.max(1, Number(sw.verifyTimeoutSec) || 5) * 1000;
		return new Promise(resolve => {
			const timer = setTimeout(() => {
				this.verifyWatchers.delete(sw.objectId);
				this.log.debug(
					`Verification TIMEOUT for ${this.swLabel(sw)} expecting ${expectOn ? 'ON' : 'OFF'}=${JSON.stringify(expected)} after ${timeoutMs}ms.`,
				);
				resolve(false);
			}, timeoutMs);
			this.verifyWatchers.set(sw.objectId, { expected, resolve, timer });
			this.log.silly(
				`Verification armed for ${this.swLabel(sw)} expecting ${expectOn ? 'ON' : 'OFF'}=${JSON.stringify(expected)} (timeout ${timeoutMs}ms).`,
			);
		});
	}

	/**
	 * Loose comparison of an actual state value against the expected value.
	 *
	 * @param {ioBroker.StateValue} actual - the value reported by the switch
	 * @param {boolean | number | string} expected - the configured target value
	 * @returns {boolean} true if they are considered equal
	 */
	valuesMatch(actual, expected) {
		if (typeof expected === 'boolean') {
			return Boolean(actual) === expected;
		}
		if (typeof expected === 'number') {
			return Number(actual) === expected;
		}
		return String(actual) === String(expected);
	}

	/**
	 * Stores the outcome of a feeding attempt in the per-switch status datapoints.
	 *
	 * @param {ioBroker.FutterautomatSwitchConfig} sw - switch configuration
	 * @param {boolean} isError - true if the attempt had a switching fault
	 * @param {string} message - human readable result text
	 */
	async reportResult(sw, isError, message) {
		await this.setStateAsync(`switches.${sw.id}.lastResult`, { val: message, ack: true });
		await this.setStateAsync(`switches.${sw.id}.error`, { val: isError, ack: true });
	}

	/**
	 * Sends a supervision message to the switch's configured Telegram instance,
	 * if a recipient is configured and the message type is enabled for this switch.
	 *
	 * @param {ioBroker.FutterautomatSwitchConfig} sw - switch configuration
	 * @param {'success' | 'onFail' | 'offFail'} type - message category
	 * @param {string} message - the text to send
	 */
	notify(sw, type, message) {
		const instance = sw.telegramInstance;
		if (!instance) {
			return;
		}
		const want = type === 'success' ? sw.notifySuccess : type === 'onFail' ? sw.notifyOnFail : sw.notifyOffFail;
		if (!want) {
			this.log.silly(`Notification "${type}" for ${this.swLabel(sw)} is disabled.`);
			return;
		}
		const text = `${sw.name || sw.id}: ${message}`;
		const payload = sw.telegramUser ? { text, user: sw.telegramUser } : { text };
		this.log.debug(`Sending Telegram notification via ${instance} for ${this.swLabel(sw)}: ${text}`);
		try {
			this.sendTo(instance, payload);
		} catch (e) {
			this.log.warn(`Could not send Telegram message via ${instance}: ${e.message}`);
		}
	}

	/**
	 * Writes the on/off value to the target foreign state.
	 *
	 * @param {ioBroker.FutterautomatSwitchConfig} sw - switch configuration
	 * @param {boolean} on - true writes the on value, false the off value
	 */
	async writeSwitch(sw, on) {
		const value = coerce(on ? (sw.onValue ?? true) : (sw.offValue ?? false));
		this.log.debug(`Writing ${on ? 'ON' : 'OFF'} value ${JSON.stringify(value)} to ${sw.objectId}.`);
		try {
			await this.setForeignStateAsync(sw.objectId, { val: value, ack: false });
		} catch (e) {
			this.log.error(`Could not write ${sw.objectId}: ${e.message}`);
		}
	}

	/**
	 * Returns a human readable block reason or null if feeding is allowed.
	 *
	 * @param {ioBroker.FutterautomatSwitchConfig} sw - switch configuration
	 * @returns {string | null} block reason or null if feeding is allowed
	 */
	getBlockReason(sw) {
		// night / sun window
		if (sw.respectNight !== false && this.window) {
			const now = Date.now();
			this.log.silly(
				`Block check ${this.swLabel(sw)}: now=${new Date(now).toISOString()} window=${this.window.start.toISOString()}..${this.window.end.toISOString()}`,
			);
			if (now < this.window.start.getTime() || now > this.window.end.getTime()) {
				return 'outside sun window (night)';
			}
		} else if (sw.respectNight !== false) {
			this.log.silly(`Block check ${this.swLabel(sw)}: night protection requested but no sun window available.`);
		}
		// water temperature
		if (sw.blockWaterEnabled) {
			this.log.silly(
				`Block check ${this.swLabel(sw)}: water=${this.waterTemp ?? 'unknown'}°C, min=${sw.waterMin}, max=${sw.waterMax}`,
			);
			if (this.waterTemp !== null) {
				if (sw.waterMin !== null && sw.waterMin !== undefined && this.waterTemp < sw.waterMin) {
					return `water temperature ${this.waterTemp}°C below ${sw.waterMin}°C`;
				}
				if (sw.waterMax !== null && sw.waterMax !== undefined && this.waterTemp > sw.waterMax) {
					return `water temperature ${this.waterTemp}°C above ${sw.waterMax}°C`;
				}
			}
		}
		// air temperature
		if (sw.blockAirEnabled) {
			this.log.silly(
				`Block check ${this.swLabel(sw)}: air=${this.airTemp ?? 'unknown'}°C, min=${sw.airMin}, max=${sw.airMax}`,
			);
			if (this.airTemp !== null) {
				if (sw.airMin !== null && sw.airMin !== undefined && this.airTemp < sw.airMin) {
					return `air temperature ${this.airTemp}°C below ${sw.airMin}°C`;
				}
				if (sw.airMax !== null && sw.airMax !== undefined && this.airTemp > sw.airMax) {
					return `air temperature ${this.airTemp}°C above ${sw.airMax}°C`;
				}
			}
		}
		this.log.silly(`Block check ${this.swLabel(sw)}: no block, feeding allowed.`);
		return null;
	}

	// ----------------------------------------------------------------------------
	// Events
	// ----------------------------------------------------------------------------

	/**
	 * @param {string} id - State ID
	 * @param {ioBroker.State | null | undefined} state - the new state or null on deletion
	 */
	async onStateChange(id, state) {
		if (!state) {
			this.log.silly(`State ${id} deleted.`);
			return;
		}
		this.log.silly(`State change: ${id} = ${state.val} (ack=${state.ack})`);

		// temperature sources (foreign states)
		if (this.config.airTempEnabled && id === this.config.airTempObjectId) {
			this.airTemp = state.val === null ? null : Number(state.val);
			await this.setStateAsync('airTemperature', { val: this.airTemp, ack: true });
			this.log.debug(`Air temperature updated: ${this.airTemp ?? 'unknown'}°C (from ${id}).`);
			return;
		}
		if (this.config.waterTempEnabled && id === this.config.waterTempObjectId) {
			this.waterTemp = state.val === null ? null : Number(state.val);
			await this.setStateAsync('waterTemperature', { val: this.waterTemp, ack: true });
			this.log.debug(`Water temperature updated: ${this.waterTemp ?? 'unknown'}°C (from ${id}).`);
			return;
		}

		// switch-state supervision: confirm an acknowledged on/off transition.
		// Only ack=true counts - our own command (ack=false) must not confirm itself.
		const watcher = this.verifyWatchers.get(id);
		if (watcher && state.ack === true && this.valuesMatch(state.val, watcher.expected)) {
			clearTimeout(watcher.timer);
			this.verifyWatchers.delete(id);
			this.log.debug(
				`Verification CONFIRMED for ${id}: acknowledged value ${state.val} matches expected ${JSON.stringify(watcher.expected)}.`,
			);
			watcher.resolve(true);
			return;
		}

		// manual trigger (own state, command => ack === false)
		const m = id.match(/switches\.([^.]+)\.feedNow$/);
		if (m && state.ack === false && state.val) {
			const sw = this.switches.find(s => s.id === m[1]);
			if (sw) {
				this.log.info(
					`Manual feeding triggered for ${this.swLabel(sw)} (ignoreBlocks=${!!sw.manualIgnoresBlocks}).`,
				);
				await this.feed(sw, !!sw.manualIgnoresBlocks);
			} else {
				this.log.warn(`Manual trigger for unknown switch id "${m[1]}".`);
			}
			await this.setStateAsync(id, { val: false, ack: true });
		}
	}

	/**
	 * Handles "geocode" requests from the admin UI (address -> coordinates via Nominatim).
	 *
	 * @param {ioBroker.Message} obj - the incoming message
	 */
	async onMessage(obj) {
		if (!obj || typeof obj !== 'object' || !obj.command) {
			return;
		}
		this.log.debug(`Message received: command="${obj.command}" from "${obj.from}".`);
		if (obj.command === 'feedNow') {
			const sid = obj.message && obj.message.switchId;
			const durationSec = obj.message && obj.message.durationSec;
			const sw = this.switches.find(s => s.id === sid);
			if (!sw) {
				this.log.warn(`Manual feed request for unknown switch id "${sid}" (save the configuration first?).`);
				if (obj.callback) {
					this.sendTo(
						obj.from,
						obj.command,
						{ error: 'Switch not found. Please save the configuration first.' },
						obj.callback,
					);
				}
				return;
			}
			this.log.info(`Manual feeding (button) for ${this.swLabel(sw)} for ${Number(durationSec) || 0}s.`);
			// run the feeding asynchronously; answer the UI immediately
			this.feed(sw, !!sw.manualIgnoresBlocks, durationSec).catch(e =>
				this.log.error(`Manual feeding failed: ${e.message}`),
			);
			if (obj.callback) {
				this.sendTo(obj.from, obj.command, { ok: true }, obj.callback);
			}
			return;
		}
		if (obj.command === 'geocode') {
			const query = obj.message && obj.message.query;
			if (!query) {
				this.log.warn('Geocode request without query.');
				if (obj.callback) {
					this.sendTo(obj.from, obj.command, { error: 'No query' }, obj.callback);
				}
				return;
			}
			try {
				const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
				const version = this.version || '0.0.1';
				this.log.debug(`Geocoding "${query}" via Nominatim...`);
				const res = await fetch(url, {
					headers: { 'User-Agent': `ioBroker.futterautomat/${version}` },
				});
				const data = await res.json();
				if (Array.isArray(data) && data.length) {
					const hit = data[0];
					this.log.debug(`Geocode result: lat=${hit.lat}, lon=${hit.lon} (${hit.display_name}).`);
					if (obj.callback) {
						this.sendTo(
							obj.from,
							obj.command,
							{ lat: hit.lat, lon: hit.lon, displayName: hit.display_name },
							obj.callback,
						);
					}
				} else {
					this.log.info(`Geocoding "${query}": no location found.`);
					if (obj.callback) {
						this.sendTo(obj.from, obj.command, { error: 'No location found' }, obj.callback);
					}
				}
			} catch (e) {
				this.log.warn(`Geocoding failed: ${e.message}`);
				if (obj.callback) {
					this.sendTo(obj.from, obj.command, { error: e.message }, obj.callback);
				}
			}
		}
	}

	/**
	 * @param {() => void} callback - must be called when teardown is done
	 */
	onUnload(callback) {
		try {
			this.terminating = true;
			this.log.debug(
				`Shutting down: clearing ${this.scheduleTimers.size} schedule timer(s) and ${this.verifyWatchers.size} verification(s).`,
			);
			if (this.midnightTimer) {
				clearTimeout(this.midnightTimer);
				this.midnightTimer = null;
			}
			for (const t of this.scheduleTimers.values()) {
				clearTimeout(t);
			}
			this.scheduleTimers.clear();

			for (const w of this.verifyWatchers.values()) {
				clearTimeout(w.timer);
			}
			this.verifyWatchers.clear();

			// turn off switches that are still in an active feeding cycle (best effort)
			for (const sid of this.feedingBusy) {
				const sw = this.switches.find(s => s.id === sid);
				if (sw && sw.objectId) {
					const value = coerce(sw.offValue ?? false);
					this.log.debug(`Turning off still-active switch ${this.swLabel(sw)} during shutdown.`);
					this.setForeignState(sw.objectId, { val: value, ack: false }, () => {});
				}
			}
			this.feedingBusy.clear();

			this.log.info('Adapter stopped.');
			callback();
		} catch (e) {
			this.log.error(`Error during unloading: ${e.message}`);
			callback();
		}
	}
}

/**
 * Coerces a configured on/off value (which may arrive as a string from the UI)
 * into a boolean, number or string.
 *
 * @param {boolean | number | string} value - the configured value
 * @returns {boolean | number | string} the coerced value
 */
function coerce(value) {
	if (typeof value === 'boolean' || typeof value === 'number') {
		return value;
	}
	if (typeof value === 'string') {
		const v = value.trim();
		if (v.toLowerCase() === 'true') {
			return true;
		}
		if (v.toLowerCase() === 'false') {
			return false;
		}
		if (v !== '' && !Number.isNaN(Number(v))) {
			return Number(v);
		}
		return value;
	}
	return value;
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options] - Adapter options
	 */
	module.exports = options => new Futterautomat(options);
} else {
	// otherwise start the instance directly
	new Futterautomat();
}
