import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { I18n } from '@iobroker/adapter-react-v5';

import ObjectSelect from './ObjectSelect';
import LocationPicker from './LocationPicker';

const MAX_SWITCHES = 5;
const TEMPERATURE_FILTER = (obj) => !!obj.common && obj.common.type === 'number';

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

function GeneralTab(props) {
	const { native, onChange, updateSwitch, addSwitch, removeSwitch, socket, theme, themeName, themeType, instanceId } =
		props;

	const [sysCoords, setSysCoords] = useState(null);

	useEffect(() => {
		let active = true;
		socket
			.getObject('system.config')
			.then((obj) => {
				if (active && obj && obj.common) {
					setSysCoords({ lat: obj.common.latitude, lon: obj.common.longitude });
				}
			})
			.catch(() => {
				/* ignore */
			});
		return () => {
			active = false;
		};
	}, [socket]);

	const switches = Array.isArray(native.switches) ? native.switches : [];

	return (
		<Box>
			{/* Geolocation */}
			<Section title={I18n.t('Geolocation (mandatory)')}>
				<RadioGroup
					value={native.coordinateSource || 'system'}
					onChange={(e) => onChange('coordinateSource', e.target.value)}
				>
					<FormControlLabel
						value="system"
						control={<Radio />}
						label={I18n.t('Use system settings (system.config)')}
					/>
					<FormControlLabel value="specific" control={<Radio />} label={I18n.t('Define specific location')} />
				</RadioGroup>

				{native.coordinateSource === 'specific' ? (
					<Box sx={{ mt: 1 }}>
						<LocationPicker
							latitude={native.latitude}
							longitude={native.longitude}
							address={native.address}
							socket={socket}
							instanceId={instanceId}
							onChange={(patch) => {
								if (patch.latitude !== undefined) {
									onChange('latitude', patch.latitude);
								}
								if (patch.longitude !== undefined) {
									onChange('longitude', patch.longitude);
								}
								if (patch.address !== undefined) {
									onChange('address', patch.address);
								}
							}}
						/>
					</Box>
				) : (
					<Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
						{sysCoords && sysCoords.lat !== undefined && sysCoords.lat !== ''
							? `${I18n.t('Latitude')}: ${sysCoords.lat}, ${I18n.t('Longitude')}: ${sysCoords.lon}`
							: I18n.t('No coordinates configured in the ioBroker system settings!')}
					</Typography>
				)}
			</Section>

			{/* Sun offsets */}
			<Section title={I18n.t('Sun window (no feeding at night)')}>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<TextField
						variant="standard"
						type="number"
						label={I18n.t('Minutes after sunrise')}
						value={native.sunOffsetMorning ?? 0}
						onChange={(e) => onChange('sunOffsetMorning', Number(e.target.value) || 0)}
					/>
					<TextField
						variant="standard"
						type="number"
						label={I18n.t('Minutes before sunset')}
						value={native.sunOffsetEvening ?? 0}
						onChange={(e) => onChange('sunOffsetEvening', Number(e.target.value) || 0)}
					/>
				</Box>
			</Section>

			{/* Temperatures */}
			<Section title={I18n.t('Temperature sources')}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={!!native.airTempEnabled}
								onChange={(e) => onChange('airTempEnabled', e.target.checked)}
							/>
						}
						label={I18n.t('Air temperature')}
					/>
					<ObjectSelect
						label={I18n.t('Air temperature object')}
						value={native.airTempObjectId}
						disabled={!native.airTempEnabled}
						onChange={(v) => onChange('airTempObjectId', v)}
						socket={socket}
						theme={theme}
						themeName={themeName}
						themeType={themeType}
						filterFunc={TEMPERATURE_FILTER}
					/>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={!!native.waterTempEnabled}
								onChange={(e) => onChange('waterTempEnabled', e.target.checked)}
							/>
						}
						label={I18n.t('Water temperature')}
					/>
					<ObjectSelect
						label={I18n.t('Water temperature object')}
						value={native.waterTempObjectId}
						disabled={!native.waterTempEnabled}
						onChange={(v) => onChange('waterTempObjectId', v)}
						socket={socket}
						theme={theme}
						themeName={themeName}
						themeType={themeType}
						filterFunc={TEMPERATURE_FILTER}
					/>
				</Box>
			</Section>

			{/* Switches roster */}
			<Section title={`${I18n.t('Switches')} (${switches.length}/${MAX_SWITCHES})`}>
				{switches.length === 0 ? (
					<Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
						{I18n.t('No switches configured yet. Add one to create its own tab.')}
					</Typography>
				) : null}
				{switches.map((sw, index) => (
					<Box key={sw.id || index}>
						{index > 0 ? <Divider sx={{ my: 1 }} /> : null}
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<Tooltip title={I18n.t('Active')}>
								<Checkbox
									checked={!!sw.enabled}
									onChange={(e) => updateSwitch(index, { enabled: e.target.checked })}
								/>
							</Tooltip>
							<TextField
								variant="standard"
								label={I18n.t('Name')}
								value={sw.name || ''}
								sx={{ minWidth: 180 }}
								onChange={(e) => updateSwitch(index, { name: e.target.value })}
							/>
							<Box sx={{ flexGrow: 1 }}>
								<ObjectSelect
									label={I18n.t('Switch object')}
									value={sw.objectId}
									onChange={(v) => updateSwitch(index, { objectId: v })}
									socket={socket}
									theme={theme}
									themeName={themeName}
									themeType={themeType}
								/>
							</Box>
							<Tooltip title={I18n.t('Remove switch')}>
								<IconButton color="error" onClick={() => removeSwitch(index)}>
									<DeleteIcon />
								</IconButton>
							</Tooltip>
						</Box>
					</Box>
				))}
				<Button
					variant="outlined"
					startIcon={<AddIcon />}
					sx={{ mt: 2 }}
					disabled={switches.length >= MAX_SWITCHES}
					onClick={addSwitch}
				>
					{I18n.t('Add switch')}
				</Button>
			</Section>
		</Box>
	);
}

GeneralTab.propTypes = {
	native: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired,
	updateSwitch: PropTypes.func.isRequired,
	addSwitch: PropTypes.func.isRequired,
	removeSwitch: PropTypes.func.isRequired,
	socket: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
	themeName: PropTypes.string,
	themeType: PropTypes.string,
	instanceId: PropTypes.string.isRequired,
};

export default GeneralTab;
