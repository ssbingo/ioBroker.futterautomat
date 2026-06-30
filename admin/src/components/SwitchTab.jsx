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
import { I18n } from '@iobroker/adapter-react-v5';

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
	const { sw, onChange, native, socket, instanceId, telegramInstances } = props;

	const mode = sw.mode || 'times';
	const times = Array.isArray(sw.times) ? sw.times : [];

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
								<TextField
									variant="standard"
									type="time"
									label={`${I18n.t('Time')} ${index + 1}`}
									value={t || ''}
									onChange={(e) => updateTime(index, e.target.value)}
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
					<Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
						<TextField
							variant="standard"
							type="time"
							label={I18n.t('Window start')}
							value={sw.windowStart || ''}
							onChange={(e) => onChange({ windowStart: e.target.value })}
						/>
						<TextField
							variant="standard"
							type="time"
							label={I18n.t('Window end')}
							value={sw.windowEnd || ''}
							onChange={(e) => onChange({ windowEnd: e.target.value })}
						/>
						<TextField
							variant="standard"
							type="number"
							label={I18n.t('Interval (minutes)')}
							value={sw.intervalMin ?? 60}
							onChange={(e) => onChange({ intervalMin: Number(e.target.value) || 0 })}
						/>
					</Box>
				)}
			</Section>

			{/* Duration & values */}
			<Section title={I18n.t('Feeding action')}>
				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
					<TextField
						variant="standard"
						type="number"
						label={I18n.t('Feeding duration (seconds)')}
						value={sw.durationSec ?? 5}
						onChange={(e) => onChange({ durationSec: Number(e.target.value) || 0 })}
					/>
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

			{/* Temperature blocking */}
			<Section title={I18n.t('Temperature blocking')}>
				{!native.airTempEnabled && !native.waterTempEnabled ? (
					<Typography variant="body2" color="textSecondary">
						{I18n.t('Enable a temperature source in the general settings to use this.')}
					</Typography>
				) : null}

				{native.waterTempEnabled ? (
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

				{native.airTempEnabled ? (
					<Box>
						{native.waterTempEnabled ? <Divider sx={{ my: 1 }} /> : null}
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
			</Section>

			{/* Night & manual */}
			<Section title={I18n.t('Restrictions')}>
				<FormControlLabel
					control={
						<Checkbox
							checked={sw.respectNight !== false}
							onChange={(e) => onChange({ respectNight: e.target.checked })}
						/>
					}
					label={I18n.t('Do not feed at night (between sunset and sunrise, incl. offsets)')}
				/>
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
	);
}

SwitchTab.propTypes = {
	sw: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired,
	native: PropTypes.object.isRequired,
	socket: PropTypes.object.isRequired,
	instanceId: PropTypes.string.isRequired,
	telegramInstances: PropTypes.array,
};

export default SwitchTab;
