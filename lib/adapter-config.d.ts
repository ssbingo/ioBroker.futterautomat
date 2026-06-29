// This file extends the AdapterConfig type from "@iobroker/types"
// with the actual configuration properties of this adapter
// in order to provide typings for adapter.config properties.

declare global {
	namespace ioBroker {
		interface FutterautomatSwitchConfig {
			/** Stable internal id used for the datapoint path (e.g. "sw-0"). Never derived from the name. */
			id: string;
			/** User defined name, used as tab label and as common.name of the channel. */
			name: string;
			enabled: boolean;
			/** Foreign object/state id that is switched (feeding). */
			objectId: string;
			/** Value written to activate the switch (default true). */
			onValue: boolean | number | string;
			/** Value written to deactivate the switch (default false). */
			offValue: boolean | number | string;
			/** Feeding duration in seconds. */
			durationSec: number;
			/** "times" = discrete clock times, "interval" = every N minutes inside a window. */
			mode: 'times' | 'interval';
			/** Mode "times": list of "HH:mm" clock times. */
			times: string[];
			/** Mode "interval": window start "HH:mm". */
			windowStart: string;
			/** Mode "interval": window end "HH:mm". */
			windowEnd: string;
			/** Mode "interval": interval in minutes. */
			intervalMin: number;
			/** Block feeding based on water temperature thresholds. */
			blockWaterEnabled: boolean;
			waterMin: number | null;
			waterMax: number | null;
			/** Block feeding based on air temperature thresholds. */
			blockAirEnabled: boolean;
			airMin: number | null;
			airMax: number | null;
			/** Do not feed outside the sun window (night). */
			respectNight: boolean;
			/** Manual trigger ignores temperature/night blocks. */
			manualIgnoresBlocks: boolean;
			/** Verify (read back) that this switch actually turned on and off. */
			verifyEnabled: boolean;
			/** Timeout in seconds to wait for the acknowledged on/off confirmation. */
			verifyTimeoutSec: number;
			/** Telegram instance id used for this switch, e.g. "telegram.0" (empty = off). */
			telegramInstance: string;
			/** Optional Telegram recipient (user/chat name) for this switch; empty = all. */
			telegramUser: string;
			/** Send a Telegram message when a feeding completed successfully. */
			notifySuccess: boolean;
			/** Send a Telegram message when feeding could not be performed (no ON). */
			notifyOnFail: boolean;
			/** Send a Telegram message when the switch did not turn OFF again. */
			notifyOffFail: boolean;
			/** Duration in seconds used by the manual "feed now" button. */
			manualDurationSec: number;
		}

		interface AdapterConfig {
			/** "system" = use coordinates from system.config, "specific" = use latitude/longitude below. */
			coordinateSource: 'system' | 'specific';
			latitude: string;
			longitude: string;
			/** Last resolved address (display only). */
			address: string;
			/** Start feeding only N minutes after sunrise. */
			sunOffsetMorning: number;
			/** Stop feeding N minutes before sunset. */
			sunOffsetEvening: number;
			airTempEnabled: boolean;
			airTempObjectId: string;
			waterTempEnabled: boolean;
			waterTempObjectId: string;
			switches: FutterautomatSwitchConfig[];
		}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
