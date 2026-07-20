import { afterEach, describe, expect, it, vi } from 'vitest';
import { Decimal } from 'decimal.js';
import {
	CURRENCIES,
	LEGACY_NUMERIC_TO_ALPHA3,
	convert,
	formatBaseMoney,
	formatOrderAmount,
	formatMoney,
	getCurrencyMeta,
	inverseRate,
	normalizeCurrencyCode,
	roundForCurrency,
	type CurrencyCode,
	type CurrencyMeta
} from './money.js';

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
