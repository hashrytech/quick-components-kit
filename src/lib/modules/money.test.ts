import { afterEach, describe, expect, it, vi } from 'vitest';
import { Decimal } from 'decimal.js';
import {
	CURRENCIES,
	LEGACY_NUMERIC_TO_ALPHA3,
	convert,
	formatBaseMoney,
	formatOrderAmount,
	formatMoney,
	formatRateLine,
	getCurrencyMeta,
	inverseRate,
	normalizeCurrencyCode,
	orderAmountPaid,
	projectAmount,
	resolveRate,
	roundForCurrency,
	viewCurrencies,
	type CurrencyCode,
	type CurrencyMeta
} from './money.js';

describe('orderAmountPaid', () => {
	it('counts successful charges and subtracts successful refunds', () => {
		expect(orderAmountPaid([
			{ amount: '100.00', type: { id: 'online_link' }, status: { id: 'success' }, date_created: '2026-08-14' },
			{ amount: '25.00', type: { id: 'refund' }, status: 'success', date_created: '2026-08-14' }
		])).toBe(75);
	});

	it('does not count failed, declined, or pending persisted payments', () => {
		expect(orderAmountPaid([
			{ amount: '100.00', status: { id: 'failed' }, date_created: '2026-08-14' },
			{ amount: '100.00', status: { id: 'declined' }, date_created: '2026-08-14' },
			{ amount: '100.00', status: { id: 'pending' }, date_created: '2026-08-14' }
		])).toBe(0);
	});

	it('does not count a persisted legacy row without a status', () => {
		expect(orderAmountPaid([{ amount: '100.00', status: null, date_created: '2026-08-14' }])).toBe(0);
	});

	it('counts an unsaved client-side payment in the order editor preview', () => {
		expect(orderAmountPaid([{ amount: '100.00', type: { id: 'cash' } }])).toBe(100);
	});
});

describe('CURRENCIES registry', () => {
	it('contains JMD with the expected metadata', () => {
		expect(CURRENCIES.JMD).toEqual({
			code: 'JMD',
			name: 'Jamaican Dollar',
			symbol: 'J$',
			decimals: 2
		});
	});

	it('contains USD with the expected metadata', () => {
		expect(CURRENCIES.USD).toEqual({
			code: 'USD',
			name: 'US Dollar',
			symbol: 'US$',
			decimals: 2
		});
	});

	it('exposes exactly JMD and USD in v1', () => {
		expect(Object.keys(CURRENCIES).sort()).toEqual(['JMD', 'USD']);
	});
});

describe('normalizeCurrencyCode', () => {
	it('maps the legacy numeric JMD code to alpha-3', () => {
		expect(normalizeCurrencyCode('388')).toBe('JMD');
	});

	it('maps the legacy numeric USD code to alpha-3', () => {
		expect(normalizeCurrencyCode('840')).toBe('USD');
	});

	it('passes alpha-3 codes through unchanged', () => {
		expect(normalizeCurrencyCode('JMD')).toBe('JMD');
		expect(normalizeCurrencyCode('USD')).toBe('USD');
	});

	it('passes unknown values through unchanged', () => {
		expect(normalizeCurrencyCode('999')).toBe('999');
		expect(normalizeCurrencyCode('')).toBe('');
	});

	it('covers every legacy mapping in the registry', () => {
		for (const [numeric, alpha3] of Object.entries(LEGACY_NUMERIC_TO_ALPHA3)) {
			expect(normalizeCurrencyCode(numeric)).toBe(alpha3);
			expect(getCurrencyMeta(alpha3)).toBeDefined();
		}
	});
});

describe('getCurrencyMeta', () => {
	it('returns the JMD entry for code "JMD"', () => {
		expect(getCurrencyMeta('JMD')).toBe(CURRENCIES.JMD);
	});

	it('returns the USD entry for code "USD"', () => {
		expect(getCurrencyMeta('USD')).toBe(CURRENCIES.USD);
	});

	it('returns undefined for an unknown code', () => {
		expect(getCurrencyMeta('XYZ')).toBeUndefined();
	});

	it('returns undefined for an empty string', () => {
		expect(getCurrencyMeta('')).toBeUndefined();
	});
});

describe('convert', () => {
	it('is precision-safe for the classic 0.1 * 0.2 case', () => {
		expect(convert('0.1', '0.2')).toBe('0.02');
	});

	it('preserves the input amount at rate 1 (integer)', () => {
		expect(new Decimal(convert('100', 1)).equals(100)).toBe(true);
	});

	it('preserves the input amount at rate 1 (decimal)', () => {
		expect(new Decimal(convert('0.1', 1)).equals('0.1')).toBe(true);
	});

	it('round-trips through inverseRate to recover the original amount', () => {
		const roundTripped = convert(convert('100', '158.5'), inverseRate('158.5'));
		expect(new Decimal(roundTripped).toFixed(6)).toBe('100.000000');
	});
});

describe('inverseRate', () => {
	it('returns 1 / rate so that rate * inverseRate(rate) === 1', () => {
		const product = convert('158.5', inverseRate('158.5'));
		expect(new Decimal(product).toFixed(6)).toBe('1.000000');
	});

	it('throws when rate is zero', () => {
		expect(() => inverseRate(0)).toThrow(/positive/);
	});

	it('throws when rate is negative', () => {
		expect(() => inverseRate(-1)).toThrow(/positive/);
	});
});

describe('roundForCurrency', () => {
	const registry = CURRENCIES as Record<string, CurrencyMeta>;

	afterEach(() => {
		delete registry.XXX;
		vi.restoreAllMocks();
	});

	it('rounds half-up at the boundary for USD (decimals=2)', () => {
		expect(roundForCurrency('1.005', 'USD')).toBe('1.01');
	});

	it('honors a 3-decimal currency from the registry', () => {
		registry.XXX = {
			code: 'XXX' as CurrencyCode,
			name: 'Synthetic',
			symbol: 'X',
			decimals: 3
		};
		expect(roundForCurrency('1.0005', 'XXX')).toBe('1.001');
	});

	it('falls back to 2 decimals on unknown code and warns exactly once', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		expect(roundForCurrency('1.235', 'ZZZ')).toBe('1.24');
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});
});

describe('formatMoney', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders JMD with the locale symbol prefix and grouped amount', () => {
		expect(formatMoney('1234.5', 'JMD')).toBe('J$1,234.50');
	});

	it('renders USD with the US$ prefix', () => {
		expect(formatMoney('23.5', 'USD')).toBe('US$23.50');
	});

	it('renders plain zero without a negative sign', () => {
		expect(formatMoney('0', 'JMD')).toBe('J$0.00');
	});

	it('renders negative-zero without a negative sign', () => {
		expect(formatMoney('-0', 'JMD')).toBe('J$0.00');
	});

	it('renders a small negative that rounds to zero without a negative sign', () => {
		expect(formatMoney('-0.001', 'USD')).toBe('US$0.00');
	});

	it('renders a negative amount with a leading minus', () => {
		expect(formatMoney('-12.34', 'USD')).toBe('-US$12.34');
	});

	it('rounds half-up consistently with roundForCurrency', () => {
		expect(formatMoney('1.005', 'USD')).toBe('US$1.01');
	});

	it('renders base-currency amounts with a plain $ prefix', () => {
		expect(formatMoney('1234.5', 'USD', { asBase: true })).toBe('$1,234.50');
		expect(formatMoney('1234.5', 'JMD', { asBase: true })).toBe('$1,234.50');
	});

	it('keeps the leading minus on negative base-currency amounts', () => {
		expect(formatMoney('-12.34', 'USD', { asBase: true })).toBe('-$12.34');
	});

	it('falls back to ungrouped output for an unknown code and warns', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		expect(formatMoney('1234.5', 'QQQ')).toBe('QQQ 1234.50');
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});

	it('warns only once per unknown code across multiple calls', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		formatMoney('1', 'PPP');
		formatMoney('2', 'PPP');
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});
});

describe('formatBaseMoney', () => {
	it('renders a raw 4dp API string as plain-$ 2dp', () => {
		expect(formatBaseMoney('1250.0000')).toBe('$1,250.00');
	});

	it('rounds half-up to 2dp', () => {
		expect(formatBaseMoney('3.005')).toBe('$3.01');
	});

	it('groups thousands', () => {
		expect(formatBaseMoney('1234567.891')).toBe('$1,234,567.89');
	});

	it('keeps the leading minus on negatives', () => {
		expect(formatBaseMoney('-12.34')).toBe('-$12.34');
	});

	it('renders negative-zero without a sign', () => {
		expect(formatBaseMoney('-0.001')).toBe('$0.00');
	});

	it('accepts numbers as well as strings', () => {
		expect(formatBaseMoney(99.9)).toBe('$99.90');
	});
});

describe('formatOrderAmount', () => {
	it('projects a foreign-currency order back into the store base currency', () => {
		// Legacy non-base order with its rate snapshotted under its own
		// currency key (post-migration-0088 backfill shape). Target equals
		// the store's base currency, so the render strips the ISO/locale
		// adornment and uses a plain $.
		expect(
			formatOrderAmount(
				'600',
				{
					currency: 'USD',
					exchange_rates: { USD: '158.5' },
					store: { base_currency: 'JMD' }
				},
				'JMD'
			)
		).toBe('$95,100.00');
	});

	it('projects a base-currency order into a non-base view with the locale symbol', () => {
		// Post-Step-2 base-currency order — the snapshot copies the
		// store's default_exchange_rates verbatim at create time. The view
		// is in a non-base currency, so the locale symbol prefixes it.
		expect(
			formatOrderAmount(
				'600',
				{
					currency: 'USD',
					exchange_rates: { JMD: '0.00625' },
					store: {}
				},
				'JMD',
				{ store: { base_currency: 'USD' } }
			)
		).toBe('J$96,000.00');
	});

	it('falls back to the native order currency when no projection rate is available', () => {
		// Native USD on a USD-base store: target collapses back to base, so
		// the plain $ render is used.
		expect(
			formatOrderAmount(
				'600',
				{ currency: 'USD', exchange_rates: null, store: { base_currency: 'USD' } },
				'JMD'
			)
		).toBe('$600.00');
	});

	it('ignores the live store default_exchange_rates (strict-snapshot semantics)', () => {
		// Order snapshot has no JMD rate; live store DOES. Strict
		// snapshot means we DON'T fall back to live store rates — the
		// projection is unavailable. Q5 of lock-currency/idea-honing.md.
		expect(
			formatOrderAmount(
				'600',
				{
					currency: 'USD',
					exchange_rates: null,
					store: {}
				},
				'JMD',
				{
					store: {
						base_currency: 'USD',
						default_exchange_rates: { JMD: '0.00625' }
					}
				}
			)
		).toBe('$600.00');
	});

	it('renders a foreign-currency order in its native (non-base) currency with the locale symbol', () => {
		// Order locked in USD on a JMD-base store, viewed natively — the
		// fallback path used by mismatched-target renders. The locale
		// symbol prefixes so the dollar sign still appears.
		expect(
			formatOrderAmount(
				'600',
				{
					currency: 'USD',
					exchange_rates: { USD: '158.5' },
					store: { base_currency: 'JMD' }
				},
				'USD'
			)
		).toBe('US$600.00');
	});
});

describe('resolveRate', () => {
	it('reads a directed entry as saved', () => {
		expect(
			resolveRate({ directed_rates: { JMD: { rate: '155', one: 'USD' } } }, 'JMD')
		).toEqual({ rate: '155', one: 'USD' });
	});

	it('reads a legacy string as 1 <foreign> = N <base>', () => {
		expect(resolveRate({ exchange_rates: { USD: '160' } }, 'USD')).toEqual({
			rate: '160',
			one: 'USD',
			legacy: true
		});
	});

	it('prefers the directed map when a code is in both maps', () => {
		expect(
			resolveRate(
				{
					exchange_rates: { JMD: '0.006452' },
					directed_rates: { JMD: { rate: '155', one: 'USD' } }
				},
				'JMD'
			)
		).toEqual({ rate: '155', one: 'USD' });
	});

	it('returns null for missing, invalid and non-positive rates', () => {
		expect(resolveRate({}, 'JMD')).toBeNull();
		expect(resolveRate({ exchange_rates: { JMD: 'abc' } }, 'JMD')).toBeNull();
		expect(resolveRate({ exchange_rates: { JMD: '0' } }, 'JMD')).toBeNull();
		expect(
			resolveRate({ directed_rates: { JMD: { rate: '-1', one: 'USD' } } }, 'JMD')
		).toBeNull();
		// An object that leaked into the legacy map is not a rate.
		expect(
			resolveRate({ exchange_rates: { JMD: { rate: '155' } as unknown as string } }, 'JMD')
		).toBeNull();
	});
});

describe('projectAmount', () => {
	it('multiplies when the amount is in the "one" currency', () => {
		expect(projectAmount('10', { rate: '155', one: 'USD' }, 'USD', 'JMD')).toBe('1550');
	});

	it('divides when the amount is in the other currency', () => {
		expect(projectAmount('1550', { rate: '155', one: 'USD' }, 'JMD', 'USD')).toBe('10');
	});

	it('keeps the old inverse-multiply for a legacy rate going base -> foreign', () => {
		// 1.19 * (1/14) = 0.08499..., not the exact 0.085 of 1.19 / 14.
		const legacy = projectAmount('1.19', { rate: '14', one: 'USD', legacy: true }, 'JMD', 'USD');
		const directed = projectAmount('1.19', { rate: '14', one: 'USD' }, 'JMD', 'USD');
		expect(roundForCurrency(legacy as string, 'USD')).toBe('0.08');
		expect(roundForCurrency(directed as string, 'USD')).toBe('0.09');
	});

	it('returns null when the rate does not describe the pair', () => {
		expect(
			projectAmount('10', { rate: '155', one: 'EUR' as CurrencyCode }, 'USD', 'JMD')
		).toBeNull();
	});
});

describe('formatOrderAmount with directed rates', () => {
	it('projects a base order exactly when the rate is entered from the base side', () => {
		expect(
			formatOrderAmount(
				'10.00',
				{
					currency: 'USD',
					exchange_rates: {},
					directed_rates: { JMD: { rate: '155', one: 'USD' } },
					store: { base_currency: 'USD' }
				},
				'JMD'
			)
		).toBe('J$1,550.00');
	});

	it('shows the old drift for the rounded legacy inverse, so the two can be told apart', () => {
		expect(
			formatOrderAmount(
				'10.00',
				{
					currency: 'USD',
					exchange_rates: { JMD: '0.006452' },
					store: { base_currency: 'USD' }
				},
				'JMD'
			)
		).toBe('J$1,549.91');
	});

	it('divides a base order when the directed rate is entered from the foreign side', () => {
		expect(
			formatOrderAmount(
				'16000',
				{
					currency: 'JMD',
					directed_rates: { USD: { rate: '160', one: 'USD' } },
					store: { base_currency: 'JMD' }
				},
				'USD'
			)
		).toBe('US$100.00');
	});

	it('still multiplies a legacy foreign-currency order back into the base', () => {
		expect(
			formatOrderAmount(
				'600',
				{ currency: 'USD', exchange_rates: { USD: '158.5' }, store: { base_currency: 'JMD' } },
				'JMD'
			)
		).toBe('$95,100.00');
	});

	it('does not move a historical legacy projection at a rounding boundary', () => {
		// Regression: kit 0.52.0 divided legacy snapshots directly and showed
		// US$0.09 here. Every release before it showed US$0.08.
		const order = {
			currency: 'JMD' as CurrencyCode,
			exchange_rates: { USD: '14' },
			store: { base_currency: 'JMD' as CurrencyCode }
		};
		expect(formatOrderAmount('1.19', order, 'USD')).toBe('US$0.08');
		// The same pair entered as a directed rate is new data and divides exactly.
		expect(
			formatOrderAmount(
				'1.19',
				{ currency: 'JMD', directed_rates: { USD: { rate: '14', one: 'USD' } }, store: { base_currency: 'JMD' } },
				'USD'
			)
		).toBe('US$0.09');
	});

	it('returns to the original amount when the view switches back', () => {
		const order = {
			currency: 'USD' as CurrencyCode,
			directed_rates: { JMD: { rate: '155', one: 'USD' as CurrencyCode } },
			store: { base_currency: 'USD' as CurrencyCode }
		};
		expect(formatOrderAmount('10.01', order, 'JMD')).toBe('J$1,551.55');
		expect(formatOrderAmount('10.01', order, 'USD')).toBe('$10.01');
	});
});

describe('formatRateLine', () => {
	it('prints a base-side rate in the entered direction', () => {
		expect(formatRateLine({ rate: '155', one: 'USD' }, 'JMD', 'USD')).toBe('1 USD = 155.00 JMD');
	});

	it('prints a foreign-side rate in the entered direction', () => {
		expect(formatRateLine({ rate: '158.5', one: 'USD' }, 'USD', 'JMD')).toBe(
			'1 USD = 158.50 JMD'
		);
	});

	it.each(['0.00666667', '0.00000001'])('preserves all eight decimal places in %s', (rate) => {
		expect(formatRateLine({ rate, one: 'JMD' }, 'JMD', 'USD')).toBe(
			'1 JMD = ' + rate + ' USD'
		);
	});

	it('keeps every saved decimal instead of rounding to four', () => {
		expect(formatRateLine({ rate: '0.00625', one: 'JMD' }, 'JMD', 'USD')).toBe(
			'1 JMD = 0.00625 USD'
		);
		expect(formatRateLine({ rate: '0.006452', one: 'JMD' }, 'JMD', 'USD')).toBe(
			'1 JMD = 0.006452 USD'
		);
	});

	it('trims trailing zeros down to two decimals and groups thousands', () => {
		expect(formatRateLine({ rate: '1580.5000', one: 'USD' }, 'USD', 'JMD')).toBe(
			'1 USD = 1,580.50 JMD'
		);
	});

	it('returns an empty string for a missing or non-positive rate', () => {
		expect(formatRateLine(null, 'JMD', 'USD')).toBe('');
		expect(formatRateLine({ rate: '0', one: 'USD' }, 'JMD', 'USD')).toBe('');
	});
});

describe('viewCurrencies', () => {
	it('lists the order currency first, then legacy codes', () => {
		expect(viewCurrencies({ currency: 'JMD', exchange_rates: { USD: '160' } })).toEqual([
			'JMD',
			'USD'
		]);
	});

	it('lists directed codes', () => {
		expect(
			viewCurrencies({ currency: 'USD', directed_rates: { JMD: { rate: '155', one: 'USD' } } })
		).toEqual(['USD', 'JMD']);
	});

	it('merges both maps without duplicates and skips unusable rates', () => {
		expect(
			viewCurrencies({
				currency: 'USD',
				exchange_rates: { JMD: '0.006452', USD: '1' },
				directed_rates: { JMD: { rate: '155', one: 'USD' } }
			})
		).toEqual(['USD', 'JMD']);
		expect(viewCurrencies({ currency: 'USD', exchange_rates: { JMD: '' } })).toEqual(['USD']);
	});

	it('returns only the order currency when there are no rates', () => {
		expect(viewCurrencies({ currency: 'USD', exchange_rates: null })).toEqual(['USD']);
	});
});
