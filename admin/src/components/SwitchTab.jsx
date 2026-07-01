import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Paper,
	Typography,
	RadioGroup,
	FormControlLabel,
	Radio,
	TextField,
	Checkbox,
	Button,
	IconButton,
	Tooltip,
	Divider,
	CircularProgress,
	Alert,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/ru';
import 'dayjs/locale/pt';
import 'dayjs/locale/nl';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/es';
import 'dayjs/locale/pl';
import 'dayjs/locale/uk';
import 'dayjs/locale/zh-cn';
import { I18n } from '@iobroker/adapter-react-v5';

import ObjectSelect from './ObjectSelect';
import LocationPicker from './LocationPicker';

const TEMPERATURE_FILTER = (obj) => !!obj.common && obj.common.type === 'number';

// leap year so 29.02. is selectable; only day+month are stored (recurring MM-DD)
const WINTER_REF_YEAR = 2024;

/** Parses a stored recurring "MM-DD" into a dayjs date (fixed reference year), or null. */
function mdToDayjs(md) {
	const m = typeof md === 'string' && md.match(/^(\d{1,2})-(\d{1,2})$/);
	if (!m) {
		return null;
	}
	const mm = String(Number(m[1])).padStart(2, '0');
	const dd = String(Number(m[2])).padStart(2, '0');
	const d = dayjs(`${WINTER_REF_YEAR}-${mm}-${dd}`);
	return d.isValid() ? d : null;
}

/** Formats a dayjs date back to the stored "MM-DD" (empty string when null/invalid). */
function dayjsToMD(d) {
	return d && d.isValid() ? d.format('MM-DD') : '';
}

/** Parses a stored "HH:mm" into a dayjs time (today's date), or null. */
function hhmmToDayjs(hhmm) {
	const m = typeof hhmm === 'string' && hhmm.match(/^(\d{1,2}):(\d{2})$/);
	if (!m) {
		return null;
	}
	const d = dayjs().hour(Number(m[1])).minute(Number(m[2])).second(0).millisecond(0);
	return d.isValid() ? d : null;
}

/** Formats a dayjs time back to the stored "HH:mm" (empty string when null/invalid). */
function dayjsToHHmm(d) {
	return d && d.isValid() ? d.format('HH:mm') : '';
}

function Section({ title, children }) {
	return (
		<Paper elevation={1} sx={{ p: 2, mb: 2 }}>
			<Typography variant="h6" sx={{ mb: 1 }}>
				{title}
			</Typography>
			{children}
		</Paper>
	);
}

Section.propTypes = {
	title: PropTypes.string,
	children: PropTypes.node,
};

/** Converts a text input value to a number or null (empty => null). */
function toNumberOrNull(value) {
	if (value === '' || value === null || value === undefined) {
		return null;
	}
	const n = Number(value);
	return Number.isNaN(n) ? null : n;
}

function SwitchTab(props) {
	const { sw, onChange, native, socket, instanceId, telegramInstances, theme, themeName, themeType } = props;

	const mode = sw.mode || 'times';
	const times = Array.isArray(sw.times) ? sw.times : [];
	const astro = !!sw.astroWindowEnabled;

	// dropdown options for the telegram instance (keep a configured-but-missing one visible)
	const telegramOptions = Array.isArray(telegramInstances) ? [...telegramInstances] : [];
	if (sw.telegramInstance && !telegramOptions.includes(sw.telegramInstance)) {
		telegramOptions.push(sw.telegramInstance);
	}

	const [feedBusy, setFeedBusy] = useState(false);
	const [feedMsg, setFeedMsg] = useState(null); // { severity, text }

	const updateTime = (index, value) => {
		const next = times.slice();
		next[index] = value;
		onChange({ times: next });
	};
	const addTime = () => onChange({ times: [...times, '12:00'] });
	const removeTime = (index) => onChange({ times: times.filter((_, i) => i !== index) });

	const feedNow = async () => {
		setFeedBusy(true);
		setFeedMsg(null);
		try {
			const res = await socket.sendTo(instanceId, 'feedNow', {
				switchId: sw.id,
				durationSec: Number(sw.manualDurationSec ?? sw.durationSec ?? 0),
			});
			if (res && res.error) {
				setFeedMsg({ severity: 'error', text: res.error });
			} else {
				setFeedMsg({ severity: 'success', text: I18n.t('Feeding started') });
			}
		} catch (e) {
			setFeedMsg({ severity: 'error', text: `${I18n.t('Could not start feeding')}: ${e}` });
		}
		setFeedBusy(false);
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={I18n.getLanguage()}>
		<Box>
			{/* Manual feeding */}
			<Section title={I18n.t('Manual feeding')}>
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
					<TextField
						variant="standard"
						type="number"
						label={I18n.t('Manual feeding duration (seconds)')}
						value={sw.manualDurationSec ?? sw.durationSec ?? 5}
						onChange={(e) => onChange({ manualDurationSec: Number(e.target.value) || 0 })}
					/>
					<Button
						variant="contained"
						color="primary"
						size="large"
						startIcon={feedBusy ? <CircularProgress size={20} color="inherit" /> : <RestaurantIcon />}
						disabled={feedBusy || !sw.objectId}
						onClick={feedNow}
					>
						{I18n.t('Feed now')}
					</Button>
				</Box>
				{!sw.objectId ? (
					<Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
						{I18n.t('Select a switch object in the general settings first.')}
					</Typography>
				) : null}
				{feedMsg ? (
					<Alert severity={feedMsg.severity} sx={{ mt: 1 }} onClose={() => setFeedMsg(null)}>
						{feedMsg.text}
					</Alert>
				) : null}
			</Section>

			{/* Mode */}
			<Section title={I18n.t('Feeding schedule')}>
				{sw.dynamicEnabled ? (
					<Box>
						<Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
							{I18n.t('Controlled by dynamic feeding: the interval is computed from temperature within the window below.')}
						</Typography>
						{astro ? (
							<Typography variant="body2" color="textSecondary">
								{I18n.t('The window follows sunrise/sunset (astronomical window enabled under Restrictions).')}
							</Typography>
						) : (
							<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
								<TimePicker label={I18n.t('Window start')} ampm={false} format="HH:mm" value={hhmmToDayjs(sw.windowStart)} onChange={(v) => onChange({ windowStart: dayjsToHHmm(v) })} slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 140 } } }} />
								<TimePicker label={I18n.t('Window end')} ampm={false} format="HH:mm" value={hhmmToDayjs(sw.windowEnd)} onChange={(v) => onChange({ windowEnd: dayjsToHHmm(v) })} slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 140 } } }} />
							</Box>
						)}
					</Box>
				) : (
				<>
				<RadioGroup row value={mode} onChange={(e) => onChange({ mode: e.target.value })}>
					<FormControlLabel value="times" control={<Radio />} label={I18n.t('Fixed times')} />
					<FormControlLabel
						value="interval"
						control={<Radio />}
						label={I18n.t('Interval within a time window')}
					/>
				</RadioGroup>

				{mode === 'times' ? (
					<Box sx={{ mt: 1 }}>
						{times.length === 0 ? (
							<Typography variant="body2" color="textSecondary">
								{I18n.t('No times defined yet.')}
							</Typography>
						) : null}
						{times.map((t, index) => (
							<Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
								<TimePicker
									label={`${I18n.t('Time')} ${index + 1}`}
									ampm={false}
									format="HH:mm"
									value={hhmmToDayjs(t)}
									onChange={(v) => updateTime(index, dayjsToHHmm(v))}
									slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 140 } } }}
								/>
								<Tooltip title={I18n.t('Remove')}>
									<IconButton size="small" color="error" onClick={() => removeTime(index)}>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</Box>
						))}
						<Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addTime}>
							{I18n.t('Add time')}
						</Button>
					</Box>
				) : (
					<Box>
						{astro ? (
							<Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
								{I18n.t('The window follows sunrise/sunset (astronomical window enabled under Restrictions).')}
							</Typography>
						) : null}
						<Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
							{astro ? null : (
								<TimePicker
									label={I18n.t('Window start')}
									ampm={false}
									format="HH:mm"
									value={hhmmToDayjs(sw.windowStart)}
									onChange={(v) => onChange({ windowStart: dayjsToHHmm(v) })}
									slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 140 } } }}
								/>
							)}
							{astro ? null : (
								<TimePicker
									label={I18n.t('Window end')}
									ampm={false}
									format="HH:mm"
									value={hhmmToDayjs(sw.windowEnd)}
									onChange={(v) => onChange({ windowEnd: dayjsToHHmm(v) })}
									slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 140 } } }}
								/>
							)}
							<TextField
								variant="standard"
								type="number"
								label={I18n.t('Interval (minutes)')}
								value={sw.intervalMin ?? 60}
								onChange={(e) => onChange({ intervalMin: Number(e.target.value) || 0 })}
							/>
						</Box>
					</Box>
				)}
				</>
				)}
			</Section>

			{/* Duration & values. The static feeding duration is hidden under dynamic
			    feeding, where it is computed from temperature (it would only confuse);
			    the on/off values stay visible because they are always relevant. */}
			<Section title={I18n.t('Feeding action')}>
				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
					{sw.dynamicEnabled ? null : (
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Feeding duration (seconds)')}
							value={sw.durationSec ?? 5}
							onChange={(e) => onChange({ durationSec: Number(e.target.value) || 0 })}
						/>
					)}
					<TextField
						variant="standard"
						label={I18n.t('On value (default true)')}
						value={sw.onValue === undefined ? 'true' : String(sw.onValue)}
						onChange={(e) => onChange({ onValue: e.target.value })}
					/>
					<TextField
						variant="standard"
						label={I18n.t('Off value (default false)')}
						value={sw.offValue === undefined ? 'false' : String(sw.offValue)}
						onChange={(e) => onChange({ offValue: e.target.value })}
					/>
				</Box>
			</Section>

			{/* Sources (this station) */}
			<Section title={I18n.t('Temperature & oxygen sources')}>
				<Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
					{I18n.t('Assign this feeding station\u2019s own sensors. Used for temperature blocking and dynamic feeding.')}
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
					<FormControlLabel control={<Checkbox checked={!!sw.airTempEnabled} onChange={(e) => onChange({ airTempEnabled: e.target.checked })} />} label={I18n.t('Air temperature')} />
					<Box sx={{ flexGrow: 1 }}>
						<ObjectSelect label={I18n.t('Air temperature object')} value={sw.airTempObjectId} disabled={!sw.airTempEnabled} onChange={(v) => onChange({ airTempObjectId: v })} socket={socket} theme={theme} themeName={themeName} themeType={themeType} filterFunc={TEMPERATURE_FILTER} />
					</Box>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
					<FormControlLabel control={<Checkbox checked={!!sw.waterTempEnabled} onChange={(e) => onChange({ waterTempEnabled: e.target.checked })} />} label={I18n.t('Water temperature')} />
					<Box sx={{ flexGrow: 1 }}>
						<ObjectSelect label={I18n.t('Water temperature object')} value={sw.waterTempObjectId} disabled={!sw.waterTempEnabled} onChange={(v) => onChange({ waterTempObjectId: v })} socket={socket} theme={theme} themeName={themeName} themeType={themeType} filterFunc={TEMPERATURE_FILTER} />
					</Box>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
					<FormControlLabel control={<Checkbox checked={!!sw.o2Enabled} onChange={(e) => onChange({ o2Enabled: e.target.checked })} />} label={I18n.t('Oxygen (O₂)')} />
					<Box sx={{ flexGrow: 1 }}>
						<ObjectSelect label={I18n.t('Oxygen object')} value={sw.o2ObjectId} disabled={!sw.o2Enabled} onChange={(v) => onChange({ o2ObjectId: v })} socket={socket} theme={theme} themeName={themeName} themeType={themeType} filterFunc={TEMPERATURE_FILTER} />
					</Box>
				</Box>
			</Section>

			{/* Temperature blocking */}
			<Section title={I18n.t('Temperature blocking')}>
				{!sw.airTempEnabled && !sw.waterTempEnabled ? (
					<Typography variant="body2" color="textSecondary">
						{I18n.t('Enable a temperature source above to use it here.')}
					</Typography>
				) : null}

				{sw.waterTempEnabled ? (
					<Box sx={{ mb: 1 }}>
						<FormControlLabel
							control={
								<Checkbox
									checked={!!sw.blockWaterEnabled}
									onChange={(e) => onChange({ blockWaterEnabled: e.target.checked })}
								/>
							}
							label={I18n.t('Block by water temperature')}
						/>
						<Box sx={{ display: 'flex', gap: 2 }}>
							<TextField
								variant="standard"
								type="number"
								label={I18n.t('Block if below (°C)')}
								disabled={!sw.blockWaterEnabled}
								value={sw.waterMin ?? ''}
								onChange={(e) => onChange({ waterMin: toNumberOrNull(e.target.value) })}
							/>
							<TextField
								variant="standard"
								type="number"
								label={I18n.t('Block if above (°C)')}
								disabled={!sw.blockWaterEnabled}
								value={sw.waterMax ?? ''}
								onChange={(e) => onChange({ waterMax: toNumberOrNull(e.target.value) })}
							/>
						</Box>
					</Box>
				) : null}

				{sw.airTempEnabled ? (
					<Box>
						{sw.waterTempEnabled ? <Divider sx={{ my: 1 }} /> : null}
						<FormControlLabel
							control={
								<Checkbox
									checked={!!sw.blockAirEnabled}
									onChange={(e) => onChange({ blockAirEnabled: e.target.checked })}
								/>
							}
							label={I18n.t('Block by air temperature')}
						/>
						<Box sx={{ display: 'flex', gap: 2 }}>
							<TextField
								variant="standard"
								type="number"
								label={I18n.t('Block if below (°C)')}
								disabled={!sw.blockAirEnabled}
								value={sw.airMin ?? ''}
								onChange={(e) => onChange({ airMin: toNumberOrNull(e.target.value) })}
							/>
							<TextField
								variant="standard"
								type="number"
								label={I18n.t('Block if above (°C)')}
								disabled={!sw.blockAirEnabled}
								value={sw.airMax ?? ''}
								onChange={(e) => onChange({ airMax: toNumberOrNull(e.target.value) })}
							/>
						</Box>
					</Box>
				) : null}
				{sw.o2Enabled ? (
					<Box>
						<Divider sx={{ my: 1 }} />
						<FormControlLabel
							control={<Checkbox checked={!!sw.blockO2Enabled} onChange={(e) => onChange({ blockO2Enabled: e.target.checked })} />}
							label={I18n.t('Block by oxygen (O₂)')}
						/>
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Block if oxygen below')}
							disabled={!sw.blockO2Enabled}
							value={sw.o2Min ?? ''}
							onChange={(e) => onChange({ o2Min: toNumberOrNull(e.target.value) })}
						/>
					</Box>
				) : null}
			</Section>

			{/* Dynamic feeding */}
			<Section title={I18n.t('Dynamic feeding')}>
				{!sw.airTempEnabled && !sw.waterTempEnabled ? (
					<Typography variant="body2" color="textSecondary">
						{I18n.t('Enable a temperature source above to use it here.')}
					</Typography>
				) : (
					<Box>
						<FormControlLabel
							control={<Checkbox checked={!!sw.dynamicEnabled} onChange={(e) => onChange({ dynamicEnabled: e.target.checked })} />}
							label={I18n.t('Enable dynamic feeding (Q10)')}
						/>
						<Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
							{I18n.t('Adapts interval and duration to temperature; fixed times are replaced by an interval within the window.')}
						</Typography>
						<RadioGroup row value={sw.dynamicSource || 'water'} onChange={(e) => onChange({ dynamicSource: e.target.value })}>
							<FormControlLabel value="water" disabled={!sw.dynamicEnabled || !sw.waterTempEnabled} control={<Radio />} label={I18n.t('Water temperature')} />
							<FormControlLabel value="air" disabled={!sw.dynamicEnabled || !sw.airTempEnabled} control={<Radio />} label={I18n.t('Air temperature')} />
						</RadioGroup>
						<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Reference temperature (°C)')}
							disabled={!sw.dynamicEnabled}
							value={sw.dynamicTRef ?? 20}
							onChange={(e) => onChange({ dynamicTRef: Number(e.target.value) || 0 })}
						/>
						<TextField
							variant="standard"
							type="number"
							inputProps={{ step: 0.1 }}
							label={I18n.t('Q10 coefficient')}
							disabled={!sw.dynamicEnabled}
							value={sw.dynamicQ10 ?? 2.2}
							onChange={(e) => onChange({ dynamicQ10: Number(e.target.value) || 0 })}
						/>
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Averaging window (hours)')}
							disabled={!sw.dynamicEnabled}
							value={sw.dynamicBufferHours ?? 24}
							onChange={(e) => onChange({ dynamicBufferHours: Number(e.target.value) || 0 })}
						/>
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Hysteresis (%)')}
							disabled={!sw.dynamicEnabled}
							value={sw.dynamicHysteresisPct ?? 15}
							onChange={(e) => onChange({ dynamicHysteresisPct: Number(e.target.value) || 0 })}
						/>
						</Box>
						<Typography variant="subtitle2" sx={{ mt: 1 }}>{I18n.t('Interval (minutes)')}</Typography>
						<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Base (at reference)')}
							disabled={!sw.dynamicEnabled}
							value={sw.dynamicBaseIntervalMin ?? 60}
							onChange={(e) => onChange({ dynamicBaseIntervalMin: Number(e.target.value) || 0 })}
						/>
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Minimum')}
							disabled={!sw.dynamicEnabled}
							value={sw.dynamicMinIntervalMin ?? 30}
							onChange={(e) => onChange({ dynamicMinIntervalMin: Number(e.target.value) || 0 })}
						/>
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Maximum')}
							disabled={!sw.dynamicEnabled}
							value={sw.dynamicMaxIntervalMin ?? 480}
							onChange={(e) => onChange({ dynamicMaxIntervalMin: Number(e.target.value) || 0 })}
						/>
						</Box>
						<Typography variant="subtitle2" sx={{ mt: 1 }}>{I18n.t('Duration (seconds)')}</Typography>
						<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Base (at reference)')}
							disabled={!sw.dynamicEnabled}
							value={sw.dynamicBaseDurationSec ?? 5}
							onChange={(e) => onChange({ dynamicBaseDurationSec: Number(e.target.value) || 0 })}
						/>
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Minimum')}
							disabled={!sw.dynamicEnabled}
							value={sw.dynamicMinDurationSec ?? 2}
							onChange={(e) => onChange({ dynamicMinDurationSec: Number(e.target.value) || 0 })}
						/>
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Maximum')}
							disabled={!sw.dynamicEnabled}
							value={sw.dynamicMaxDurationSec ?? 15}
							onChange={(e) => onChange({ dynamicMaxDurationSec: Number(e.target.value) || 0 })}
						/>
						</Box>
					</Box>
				)}
			</Section>

			{/* Astronomical window & manual */}
			<Section title={I18n.t('Restrictions')}>
				<FormControlLabel
					control={
						<Checkbox
							checked={astro}
							onChange={(e) => onChange({ astroWindowEnabled: e.target.checked })}
						/>
					}
					label={I18n.t('Restrict feeding to the astronomical day window (sunrise/sunset + offsets)')}
				/>
				{astro ? (
					<Box sx={{ mt: 1 }}>
						<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
							<TextField
								variant="standard"
								type="number"
								label={I18n.t('Minutes after sunrise')}
								value={sw.sunOffsetMorning ?? 0}
								onChange={(e) => onChange({ sunOffsetMorning: Number(e.target.value) || 0 })}
							/>
							<TextField
								variant="standard"
								type="number"
								label={I18n.t('Minutes before sunset')}
								value={sw.sunOffsetEvening ?? 0}
								onChange={(e) => onChange({ sunOffsetEvening: Number(e.target.value) || 0 })}
							/>
						</Box>
						{native.locationMode === 'individual' ? (
							<Box sx={{ mt: 2 }}>
								<Typography variant="subtitle2" sx={{ mb: 0.5 }}>
									{I18n.t('Location for this switch')}
								</Typography>
								<RadioGroup
									value={sw.coordinateSource || 'system'}
									onChange={(e) => onChange({ coordinateSource: e.target.value })}
								>
									<FormControlLabel
										value="system"
										control={<Radio />}
										label={I18n.t('Use system settings (system.config)')}
									/>
									<FormControlLabel
										value="specific"
										control={<Radio />}
										label={I18n.t('Define specific location')}
									/>
								</RadioGroup>
								{sw.coordinateSource === 'specific' ? (
									<LocationPicker
										latitude={sw.latitude}
										longitude={sw.longitude}
										address={sw.address}
										socket={socket}
										instanceId={instanceId}
										onChange={onChange}
									/>
								) : null}
							</Box>
						) : null}
					</Box>
				) : null}
				<br />
				<FormControlLabel
					control={
						<Checkbox
							checked={!!sw.manualIgnoresBlocks}
							onChange={(e) => onChange({ manualIgnoresBlocks: e.target.checked })}
						/>
					}
					label={I18n.t('Manual trigger ignores all blocks')}
				/>
			</Section>

			{/* Winter pause */}
			<Section title={I18n.t('Winter pause')}>
				<FormControlLabel
					control={
						<Checkbox
							checked={!!sw.winterEnabled}
							onChange={(e) => onChange({ winterEnabled: e.target.checked })}
						/>
					}
					label={I18n.t('Enable winter pause')}
				/>
				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
					<DatePicker
						label={I18n.t('Winter start')}
						views={['month', 'day']}
						format="DD.MM"
						disabled={!sw.winterEnabled}
						value={mdToDayjs(sw.winterStart)}
						onChange={(v) => onChange({ winterStart: dayjsToMD(v) })}
						slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 160 } } }}
					/>
					<DatePicker
						label={I18n.t('Winter end')}
						views={['month', 'day']}
						format="DD.MM"
						disabled={!sw.winterEnabled}
						value={mdToDayjs(sw.winterEnd)}
						onChange={(v) => onChange({ winterEnd: dayjsToMD(v) })}
						slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 160 } } }}
					/>
				</Box>

				<RadioGroup
					row
					value={sw.winterMode || 'suspend'}
					onChange={(e) => onChange({ winterMode: e.target.value })}
					sx={{ mt: 1 }}
				>
					<FormControlLabel
						value="suspend"
						disabled={!sw.winterEnabled}
						control={<Radio />}
						label={I18n.t('Suspend feeding')}
					/>
					<FormControlLabel
						value="reduced"
						disabled={!sw.winterEnabled}
						control={<Radio />}
						label={I18n.t('Reduced feeding (own interval)')}
					/>
					<FormControlLabel
						value="onceDaily"
						disabled={!sw.winterEnabled}
						control={<Radio />}
						label={I18n.t('Once daily')}
					/>
				</RadioGroup>

				{sw.winterEnabled && sw.winterMode !== 'suspend' ? (
					<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
						{sw.winterMode === 'reduced' ? (
							<TextField
								variant="standard"
								type="number"
								label={I18n.t('Winter interval (minutes)')}
								value={sw.winterIntervalMin ?? 240}
								onChange={(e) => onChange({ winterIntervalMin: Number(e.target.value) || 0 })}
							/>
						) : null}
						{sw.winterMode === 'onceDaily' ? (
							<TimePicker
								label={I18n.t('Winter feeding time')}
								ampm={false}
								format="HH:mm"
								value={hhmmToDayjs(sw.winterTime)}
								onChange={(v) => onChange({ winterTime: dayjsToHHmm(v) })}
								slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 160 } } }}
							/>
						) : null}
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Winter feeding duration (seconds)')}
							value={sw.winterDurationSec ?? 5}
							onChange={(e) => onChange({ winterDurationSec: Number(e.target.value) || 0 })}
						/>
					</Box>
				) : null}

				<Divider sx={{ my: 2 }} />
				<Typography variant="subtitle2" sx={{ mb: 1 }}>
					{I18n.t('Reminders (Telegram)')}
				</Typography>
				<TextField
					variant="standard"
					type="number"
					label={I18n.t('Reminder time (hour 0-23)')}
					disabled={!sw.winterEnabled}
					value={sw.winterReminderHour ?? 9}
					onChange={(e) =>
						onChange({ winterReminderHour: Math.min(23, Math.max(0, Number(e.target.value) || 0)) })
					}
					sx={{ mb: 1, width: 200 }}
				/>
				<Box>
					<FormControlLabel
						control={
							<Checkbox
								checked={!!sw.winterStartReminderEnabled}
								disabled={!sw.winterEnabled}
								onChange={(e) => onChange({ winterStartReminderEnabled: e.target.checked })}
							/>
						}
						label={I18n.t('Remind before the pause starts')}
					/>
					<TextField
						variant="standard"
						type="number"
						label={I18n.t('Days before')}
						disabled={!sw.winterEnabled || !sw.winterStartReminderEnabled}
						value={sw.winterStartReminderDays ?? 7}
						onChange={(e) => onChange({ winterStartReminderDays: Number(e.target.value) || 0 })}
						sx={{ ml: 2, width: 120 }}
					/>
				</Box>
				<Box sx={{ mt: 1 }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={!!sw.winterEndReminderEnabled}
								disabled={!sw.winterEnabled}
								onChange={(e) => onChange({ winterEndReminderEnabled: e.target.checked })}
							/>
						}
						label={I18n.t('Remind before the pause ends')}
					/>
					<TextField
						variant="standard"
						type="number"
						label={I18n.t('Days before')}
						disabled={!sw.winterEnabled || !sw.winterEndReminderEnabled}
						value={sw.winterEndReminderDays ?? 7}
						onChange={(e) => onChange({ winterEndReminderDays: Number(e.target.value) || 0 })}
						sx={{ ml: 2, width: 120 }}
					/>
				</Box>
				<Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
					{I18n.t('Reminders need a configured Telegram instance (see below).')}
				</Typography>
			</Section>

			{/* Switching supervision */}
			<Section title={I18n.t('Switching supervision')}>
				<FormControlLabel
					control={
						<Checkbox
							checked={sw.verifyEnabled !== false}
							onChange={(e) => onChange({ verifyEnabled: e.target.checked })}
						/>
					}
					label={I18n.t('Verify that the switch actually turns on and off')}
				/>
				<Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
					{I18n.t('Only works if the switch reports its real state back (acknowledged / ack=true).')}
				</Typography>
				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
					<TextField
						variant="standard"
						type="number"
						label={I18n.t('Verification timeout (seconds)')}
						disabled={sw.verifyEnabled === false}
						value={sw.verifyTimeoutSec ?? 5}
						onChange={(e) => onChange({ verifyTimeoutSec: Number(e.target.value) || 0 })}
					/>
					<TextField
						variant="standard"
						type="number"
						label={I18n.t('Verification attempts')}
						disabled={sw.verifyEnabled === false}
						value={sw.verifyRetries ?? 3}
						onChange={(e) => onChange({ verifyRetries: Math.max(1, Number(e.target.value) || 1) })}
					/>
				</Box>
				<Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
					{I18n.t(
						'Staggered re-checks before a fault is reported - useful for devices with delayed radio feedback (e.g. Homematic).',
					)}
				</Typography>
			</Section>

			{/* Telegram notifications */}
			<Section title={I18n.t('Telegram notifications')}>
				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
					<FormControl variant="standard" sx={{ minWidth: 220 }}>
						<InputLabel>{I18n.t('Telegram instance')}</InputLabel>
						<Select
							value={sw.telegramInstance || ''}
							onChange={(e) => onChange({ telegramInstance: e.target.value })}
						>
							<MenuItem value="">
								<em>{I18n.t('None (disabled)')}</em>
							</MenuItem>
							{telegramOptions.map((id) => (
								<MenuItem key={id} value={id}>
									{id}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField
						variant="standard"
						label={I18n.t('Telegram recipient (optional)')}
						value={sw.telegramUser || ''}
						onChange={(e) => onChange({ telegramUser: e.target.value })}
						sx={{ minWidth: 200 }}
					/>
				</Box>
				<Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
					{telegramOptions.length === 0
						? I18n.t('No Telegram instance installed.')
						: I18n.t('Leave the instance empty to disable Telegram for this switch.')}
				</Typography>
				<FormControlLabel
					control={
						<Checkbox
							checked={!!sw.notifySuccess}
							disabled={!sw.telegramInstance}
							onChange={(e) => onChange({ notifySuccess: e.target.checked })}
						/>
					}
					label={I18n.t('Notify on successful feeding')}
				/>
				<br />
				<FormControlLabel
					control={
						<Checkbox
							checked={sw.notifyOnFail !== false}
							disabled={!sw.telegramInstance}
							onChange={(e) => onChange({ notifyOnFail: e.target.checked })}
						/>
					}
					label={I18n.t('Notify if feeding could not be performed')}
				/>
				<br />
				<FormControlLabel
					control={
						<Checkbox
							checked={sw.notifyOffFail !== false}
							disabled={!sw.telegramInstance}
							onChange={(e) => onChange({ notifyOffFail: e.target.checked })}
						/>
					}
					label={I18n.t('Notify on switch-off fault')}
				/>
			</Section>
		</Box>
		</LocalizationProvider>
	);
}

SwitchTab.propTypes = {
	sw: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired,
	native: PropTypes.object.isRequired,
	socket: PropTypes.object.isRequired,
	instanceId: PropTypes.string.isRequired,
	telegramInstances: PropTypes.array,
	theme: PropTypes.object,
	themeName: PropTypes.string,
	themeType: PropTypes.string,
};

export default SwitchTab;
