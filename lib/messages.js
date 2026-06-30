'use strict';

/**
 * Backend notification / status texts in every language ioBroker supports.
 *
 * These strings are user facing: they are stored in the per-switch `lastResult`
 * datapoint and sent to Telegram. The configured system language
 * (system.config.common.language) selects the variant; English is the fallback
 * when the language is unset or unsupported.
 *
 * Use `{placeholder}` tokens and pass the values to {@link translate}.
 */
const MESSAGES = {
	feedSuccess: {
		en: 'Feeding triggered for {seconds}s.',
		de: 'Fütterung für {seconds}s ausgelöst.',
		ru: 'Кормление запущено на {seconds} с.',
		pt: 'Alimentação acionada por {seconds}s.',
		nl: 'Voeding geactiveerd voor {seconds}s.',
		fr: 'Distribution déclenchée pour {seconds}s.',
		it: 'Alimentazione attivata per {seconds}s.',
		es: 'Alimentación activada durante {seconds}s.',
		pl: 'Karmienie uruchomione na {seconds}s.',
		uk: 'Годування запущено на {seconds} с.',
		'zh-cn': '已触发投喂 {seconds} 秒。',
	},
	feedOnFail: {
		en: 'Feeding could not be performed. Check the switch!',
		de: 'Fütterung konnte nicht durchgeführt werden. Schalter prüfen!',
		ru: 'Не удалось выполнить кормление. Проверьте переключатель!',
		pt: 'Não foi possível alimentar. Verifique o interruptor!',
		nl: 'Voeding kon niet worden uitgevoerd. Controleer de schakelaar!',
		fr: "La distribution n'a pas pu être effectuée. Vérifiez l'interrupteur !",
		it: "Impossibile eseguire l'alimentazione. Controllare l'interruttore!",
		es: 'No se pudo realizar la alimentación. ¡Compruebe el interruptor!',
		pl: 'Nie udało się przeprowadzić karmienia. Sprawdź przełącznik!',
		uk: 'Не вдалося виконати годування. Перевірте перемикач!',
		'zh-cn': '无法执行投喂。请检查开关！',
	},
	feedOffFail: {
		en: 'Fault: the feeder did not switch off!',
		de: 'Störung: Futterautomat hat nicht abgeschaltet!',
		ru: 'Неисправность: кормушка не выключилась!',
		pt: 'Falha: o alimentador não desligou!',
		nl: 'Storing: de voederautomaat is niet uitgeschakeld!',
		fr: "Défaut : le distributeur ne s'est pas éteint !",
		it: "Guasto: l'alimentatore non si è spento!",
		es: 'Avería: ¡el comedero no se apagó!',
		pl: 'Awaria: automat do karmienia nie wyłączył się!',
		uk: 'Несправність: годівниця не вимкнулася!',
		'zh-cn': '故障：喂食器未关闭！',
	},
	blockNight: {
		en: 'outside sun window (night)',
		de: 'außerhalb des Sonnenfensters (Nacht)',
		ru: 'вне светового окна (ночь)',
		pt: 'fora da janela solar (noite)',
		nl: 'buiten het zonvenster (nacht)',
		fr: 'en dehors de la fenêtre solaire (nuit)',
		it: 'fuori dalla finestra solare (notte)',
		es: 'fuera de la ventana solar (noche)',
		pl: 'poza oknem słonecznym (noc)',
		uk: 'поза сонячним вікном (ніч)',
		'zh-cn': '不在日照时段内（夜间）',
	},
	blockWaterBelow: {
		en: 'water temperature {temp}°C below {limit}°C',
		de: 'Wassertemperatur {temp}°C unter {limit}°C',
		ru: 'температура воды {temp}°C ниже {limit}°C',
		pt: 'temperatura da água {temp}°C abaixo de {limit}°C',
		nl: 'watertemperatuur {temp}°C onder {limit}°C',
		fr: "température de l'eau {temp}°C inférieure à {limit}°C",
		it: "temperatura dell'acqua {temp}°C inferiore a {limit}°C",
		es: 'temperatura del agua {temp}°C por debajo de {limit}°C',
		pl: 'temperatura wody {temp}°C poniżej {limit}°C',
		uk: 'температура води {temp}°C нижче {limit}°C',
		'zh-cn': '水温 {temp}°C 低于 {limit}°C',
	},
	blockWaterAbove: {
		en: 'water temperature {temp}°C above {limit}°C',
		de: 'Wassertemperatur {temp}°C über {limit}°C',
		ru: 'температура воды {temp}°C выше {limit}°C',
		pt: 'temperatura da água {temp}°C acima de {limit}°C',
		nl: 'watertemperatuur {temp}°C boven {limit}°C',
		fr: "température de l'eau {temp}°C supérieure à {limit}°C",
		it: "temperatura dell'acqua {temp}°C superiore a {limit}°C",
		es: 'temperatura del agua {temp}°C por encima de {limit}°C',
		pl: 'temperatura wody {temp}°C powyżej {limit}°C',
		uk: 'температура води {temp}°C вище {limit}°C',
		'zh-cn': '水温 {temp}°C 高于 {limit}°C',
	},
	blockAirBelow: {
		en: 'air temperature {temp}°C below {limit}°C',
		de: 'Lufttemperatur {temp}°C unter {limit}°C',
		ru: 'температура воздуха {temp}°C ниже {limit}°C',
		pt: 'temperatura do ar {temp}°C abaixo de {limit}°C',
		nl: 'luchttemperatuur {temp}°C onder {limit}°C',
		fr: "température de l'air {temp}°C inférieure à {limit}°C",
		it: "temperatura dell'aria {temp}°C inferiore a {limit}°C",
		es: 'temperatura del aire {temp}°C por debajo de {limit}°C',
		pl: 'temperatura powietrza {temp}°C poniżej {limit}°C',
		uk: 'температура повітря {temp}°C нижче {limit}°C',
		'zh-cn': '气温 {temp}°C 低于 {limit}°C',
	},
	blockAirAbove: {
		en: 'air temperature {temp}°C above {limit}°C',
		de: 'Lufttemperatur {temp}°C über {limit}°C',
		ru: 'температура воздуха {temp}°C выше {limit}°C',
		pt: 'temperatura do ar {temp}°C acima de {limit}°C',
		nl: 'luchttemperatuur {temp}°C boven {limit}°C',
		fr: "température de l'air {temp}°C supérieure à {limit}°C",
		it: "temperatura dell'aria {temp}°C superiore a {limit}°C",
		es: 'temperatura del aire {temp}°C por encima de {limit}°C',
		pl: 'temperatura powietrza {temp}°C powyżej {limit}°C',
		uk: 'температура повітря {temp}°C вище {limit}°C',
		'zh-cn': '气温 {temp}°C 高于 {limit}°C',
	},
};

/** All languages ioBroker offers for system.config.common.language. */
const SUPPORTED_LANGUAGES = ['en', 'de', 'ru', 'pt', 'nl', 'fr', 'it', 'es', 'pl', 'uk', 'zh-cn'];

/** Language used when the system language is unset or not supported. */
const DEFAULT_LANGUAGE = 'en';

/**
 * Translates a message key into the requested language and fills in any
 * `{placeholder}` tokens. Falls back to English (and finally to the raw key)
 * when a translation is missing.
 *
 * @param {string} key - message key from {@link MESSAGES}
 * @param {string} [lang] - target language code (e.g. "de")
 * @param {Record<string, string | number>} [params] - placeholder values
 * @returns {string} the localized, interpolated message
 */
function translate(key, lang, params) {
	const entry = MESSAGES[key];
	if (!entry) {
		return key;
	}
	let text = (lang && entry[lang]) || entry[DEFAULT_LANGUAGE] || key;
	if (params) {
		for (const name of Object.keys(params)) {
			text = text.split(`{${name}}`).join(String(params[name]));
		}
	}
	return text;
}

module.exports = { MESSAGES, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, translate };
