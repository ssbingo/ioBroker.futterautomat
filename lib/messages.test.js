'use strict';

const { expect } = require('chai');
const { MESSAGES, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, translate } = require('./messages');

describe('lib/messages', () => {
	it('provides every message in all 11 supported languages', () => {
		expect(SUPPORTED_LANGUAGES).to.have.lengthOf(11);
		for (const key of Object.keys(MESSAGES)) {
			for (const lang of SUPPORTED_LANGUAGES) {
				expect(MESSAGES[key][lang], `${key}.${lang}`).to.be.a('string').and.not.empty;
			}
		}
	});

	it('translates into the requested language', () => {
		expect(translate('feedOnFail', 'de')).to.equal(MESSAGES.feedOnFail.de);
		expect(translate('feedOffFail', 'fr')).to.equal(MESSAGES.feedOffFail.fr);
	});

	it('falls back to English for unset or unsupported languages', () => {
		expect(translate('feedOnFail')).to.equal(MESSAGES.feedOnFail.en);
		expect(translate('feedOnFail', 'xx')).to.equal(MESSAGES.feedOnFail.en);
		expect(DEFAULT_LANGUAGE).to.equal('en');
	});

	it('substitutes placeholders', () => {
		expect(translate('feedSuccess', 'en', { seconds: 12 })).to.equal('Feeding triggered for 12s.');
		expect(translate('feedSuccess', 'de', { seconds: 5 })).to.equal('Fütterung für 5s ausgelöst.');
		expect(translate('blockWaterBelow', 'en', { temp: 8, limit: 10 })).to.equal(
			'water temperature 8°C below 10°C',
		);
		expect(translate('blockAirAbove', 'de', { temp: 32, limit: 30 })).to.equal('Lufttemperatur 32°C über 30°C');
	});

	it('returns the raw key for an unknown message', () => {
		expect(translate('does-not-exist', 'en')).to.equal('does-not-exist');
	});
});
