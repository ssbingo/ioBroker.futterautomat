import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Tabs, Tab } from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';

import GeneralTab from './GeneralTab';
import SwitchTab from './SwitchTab';

const MAX_SWITCHES = 5;

/** Creates a stable, collision-free internal id for a new switch. */
function nextSwitchId(switches) {
	const usedNums = switches
		.map((s) => parseInt(String(s.id || '').replace('sw-', ''), 10))
		.filter((n) => !Number.isNaN(n));
	const next = usedNums.length ? Math.max(...usedNums) + 1 : 0;
	return `sw-${next}`;
}

function createSwitch(switches) {
	return {
		id: nextSwitchId(switches),
		name: '',
		enabled: true,
		objectId: '',
		onValue: true,
		offValue: false,
		durationSec: 5,
		mode: 'times',
		times: ['08:00'],
		windowStart: '08:00',
		windowEnd: '18:00',
		intervalMin: 60,
		blockWaterEnabled: false,
		waterMin: null,
		waterMax: null,
		blockAirEnabled: false,
		airMin: null,
		airMax: null,
		respectNight: true,
		manualIgnoresBlocks: false,
		verifyEnabled: true,
		verifyTimeoutSec: 5,
		telegramInstance: '',
		telegramUser: '',
		notifySuccess: false,
		notifyOnFail: true,
		notifyOffFail: true,
		manualDurationSec: 5,
	};
}

function Settings(props) {
	const { native, onChange, socket, theme, themeName, themeType, instanceId } = props;
	const [tab, setTab] = useState(0);

	const switches = Array.isArray(native.switches) ? native.switches : [];

	const updateSwitch = (index, patch) => {
		const next = switches.map((s, i) => (i === index ? { ...s, ...patch } : s));
		onChange('switches', next);
	};

	const addSwitch = () => {
		if (switches.length >= MAX_SWITCHES) {
			return;
		}
		const next = [...switches, createSwitch(switches)];
		onChange('switches', next);
		setTab(next.length); // focus the new switch tab
	};

	const removeSwitch = (index) => {
		const next = switches.filter((_, i) => i !== index);
		onChange('switches', next);
		// clamp active tab into the new range (general tab + one per switch)
		setTab((current) => Math.min(current, next.length));
	};

	const activeSwitchIndex = tab - 1;
	const activeSwitch = activeSwitchIndex >= 0 ? switches[activeSwitchIndex] : null;

	return (
		<Box sx={{ p: 2 }}>
			<Tabs
				value={Math.min(tab, switches.length)}
				onChange={(_e, v) => setTab(v)}
				variant="scrollable"
				scrollButtons="auto"
				sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
			>
				<Tab label={I18n.t('General settings')} />
				{switches.map((sw, index) => (
					<Tab key={sw.id || index} label={sw.name && sw.name.trim() ? sw.name : `${I18n.t('Switch')} ${index + 1}`} />
				))}
			</Tabs>

			{tab === 0 ? (
				<GeneralTab
					native={native}
					onChange={onChange}
					updateSwitch={updateSwitch}
					addSwitch={addSwitch}
					removeSwitch={removeSwitch}
					socket={socket}
					theme={theme}
					themeName={themeName}
					themeType={themeType}
					instanceId={instanceId}
				/>
			) : null}

			{activeSwitch ? (
				<SwitchTab
					sw={activeSwitch}
					native={native}
					onChange={(patch) => updateSwitch(activeSwitchIndex, patch)}
					socket={socket}
					instanceId={instanceId}
				/>
			) : null}
		</Box>
	);
}

Settings.propTypes = {
	native: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired,
	socket: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
	themeName: PropTypes.string,
	themeType: PropTypes.string,
	instanceId: PropTypes.string.isRequired,
};

export default Settings;
