// Fiat-currency registry, lookup, arithmetic helpers, and formatters.
// Shared across admin / POS / storefront so every surface renders money
// identically (2dp, ROUND_HALF_UP, $ for base currency, J$/US$ otherwise).

import { Decimal } from 'decimal.js';

export type CurrencyCode = 'JMD' | 'USD';

export interface CurrencyMeta {
	code: CurrencyCode;
	name: string;
	symbol: string;
	decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
	JMD: { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', decimals: 2 },
	USD: { code: 'USD', name: 'US Dollar', symbol: 'US$', decimals: 2 }
};

// Legacy ISO 4217 numeric codes still present in older records (e.g. tip
// balances). Mirrors LEGACY_TO_ALPHA3 in the API's services/currency.py.
export const LEGACY_NUMERIC_TO_ALPHA3: Record<string, string> = {
	'388': 'JMD',
	'840': 'USD'
};

// Returns the alpha-3 form of a currency code, mapping legacy numeric
// codes; unknown values pass through unchanged for the caller's
// unknown-currency handling.
export function normalizeCurrencyCode(code: string): string {
	return LEGACY_NUMERIC_TO_ALPHA3[code] ?? code;
}

// Accepts arbitrary strings so API/I/O values can flow through; returns
// undefined for codes not in the registry. Callers decide how to handle
// the miss (downstream helpers like roundForCurrency / formatMoney warn).
export function getCurrencyMeta(code: string): CurrencyMeta | undefined {
	return (CURRENCIES as Record<string, CurrencyMeta>)[code];
}

// Arithmetic helpers — Decimal throughout; never raw Number math.

export function convert(amount: string | number, rate: string | number): string {
	return new Decimal(amount).mul(new Decimal(rate)).toString();
}

// Deduplicates the unknown-currency warning across all helpers so a
// tight loop with a bad code doesn't spam the console.
const warnedUnknownCurrencies = new Set<string>();

function warnUnknownCurrencyOnce(code: string): void {
	if (warnedUnknownCurrencies.has(code)) return;
	warnedUnknownCurrencies.add(code);
	console.warn(`[money] Unknown currency code "${code}"; falling back to 2 decimals.`);
}

export function roundForCurrency(amount: string | number, currency: string): string {
	const meta = getCurrencyMeta(currency);
	if (!meta) {
		warnUnknownCurrencyOnce(currency);
	}
	const decimals = meta?.decimals ?? 2;
	return new Decimal(amount).toFixed(decimals, Decimal.ROUND_HALF_UP);
}

export function inverseRate(rate: string | number): string {
	const d = new Decimal(rate);
	if (d.lte(0)) {
		throw new Error(`Exchange rate must be positive, got ${rate}`);
	}
	return new Decimal(1).div(d).toString();
}

// "Money received" against an order, in the order's own currency. Real
// payments and store-credit count toward the balance; refunds count
// against it. Single source of truth shared by the payments progress bar
// and the Add-Payment "paid in full" gate so the two never disagree.
// Payment amounts are recorded in the order currency, so summing the raw
// strings is correct; projecting to a view currency is a display concern.
type PaidPayment = {
	amount?: string;
	type?: { id?: string } | null;
	payment_type?: { id?: string } | null;
	status?: { id?: string } | string | null;
	date_created?: string | Date | null;
};

export function orderAmountPaid(payments: PaidPayment[] | null | undefined): number {
	return (payments ?? []).reduce((sum, p) => {
		const statusId = typeof p.status === 'string' ? p.status : p.status?.id;
		// Persisted rows count only after the API confirms success. A new
		// client-side payment has no status or date yet and must still update
		// the order editor preview before it is submitted.
		if (statusId ? statusId !== 'success' : Boolean(p.date_created)) return sum;
		const amount = Number.parseFloat(p.amount ?? '0');
		if (!Number.isFinite(amount)) return sum;
		const typeId = (p.type ?? p.payment_type)?.id ?? '';
		return typeId === 'refund' ? sum - amount : sum + amount;
	}, 0);
}

// Display formatter — locale-aware grouping via Intl, sign and currency
// adornment applied here.

// A directed rate names the currency that equals 1 in the equation:
// { rate: "155", one: "USD" } under key "JMD" means 1 USD = 155 JMD.
// `one` is either the map key or the store's base currency.
export type DirectedRate = { rate: string; one: CurrencyCode };
export type DirectedRateMap = Record<string, DirectedRate>;

export type OrderCurrencyStore = {
	base_currency?: CurrencyCode;
	// Legacy direction, strings only: 1 <key> = N <base>.
	default_exchange_rates?: Record<string, string>;
	// Directed rates. A code lives in at most one of the two maps.
	default_directed_rates?: DirectedRateMap;
};

// The rate maps an order carries. Both are snapshots taken at create time.
export type OrderRateMaps = {
	currency?: CurrencyCode;
	exchange_rates?: Record<string, string> | null;
	directed_rates?: DirectedRateMap | null;
};

export function formatMoney(
	amount: string | number,
	currency: string,
	opts?: { asBase?: boolean }
): string {
	const asBase = opts?.asBase ?? false;
	const meta = getCurrencyMeta(currency);

	if (!meta) {
		warnUnknownCurrencyOnce(currency);
		const rounded = new Decimal(amount).toFixed(2, Decimal.ROUND_HALF_UP);
		// Strip a negative-zero sign at the boundary (e.g. "-0.00" -> "0.00").
		const cleaned = new Decimal(rounded).isZero() ? rounded.replace(/^-/, '') : rounded;
		return `${currency} ${cleaned}`;
	}

	const rounded = new Decimal(amount).toFixed(meta.decimals, Decimal.ROUND_HALF_UP);
	const roundedDecimal = new Decimal(rounded);
	const isNeg = roundedDecimal.isNeg() && !roundedDecimal.isZero();
	const absRoundedStr = rounded.replace(/^-/, '');
	// Number() is safe here: the value is already rounded to currency precision.
	const grouped = new Intl.NumberFormat('en-JM', {
		minimumFractionDigits: meta.decimals,
		maximumFractionDigits: meta.decimals
	}).format(Number(absRoundedStr));
	const sign = isNeg ? '-' : '';

	// Base-currency display uses a generic `$` — readers already know
	// this store quotes in its base. Non-base renders use the
	// locale-disambiguated symbol (`US$`, `J$`) which carries both the
	// dollar sign and the locale, so no trailing ISO code is needed.
	const prefix = asBase ? '$' : meta.symbol;
	return `${sign}${prefix}${grouped}`;
}

// For amounts known to be in the store's base currency when no currency
// object is in scope (product prices, fee/tax flat values, campaign
// budgets). Under asBase the currency code only selects the decimal
// count, and every registry currency is 2dp, so the output is
// code-independent: plain `$`, grouped, 2dp.
export function formatBaseMoney(amount: string | number): string {
	return formatMoney(amount, 'JMD', { asBase: true });
}

// Find the rate between the order's base and `foreign`. The directed map
// wins; a legacy string means 1 <foreign> = N <base>, so `one` is the
// foreign code. Returns null for a missing, invalid or non-positive rate.
export function resolveRate(order: OrderRateMaps, foreign: CurrencyCode): DirectedRate | null {
	const valid = (rate: unknown): rate is string | number => {
		if (typeof rate !== 'string' && typeof rate !== 'number') return false;
		if (rate === '') return false;
		try {
			return new Decimal(rate).gt(0);
		} catch {
			return false;
		}
	};
	const directed = order.directed_rates?.[foreign];
	if (directed && typeof directed === 'object' && valid(directed.rate) && directed.one) {
		return { rate: String(directed.rate), one: directed.one };
	}
	const legacy = order.exchange_rates?.[foreign];
	if (valid(legacy)) return { rate: String(legacy), one: foreign };
	return null;
}

// Convert `amount` from one side of the pair to the other. Multiplies when
// the amount is in the rate's "one" currency, divides when it is in the
// other. No inverse rate is ever built. Returns the unrounded result, or
// null when the rate does not describe this pair.
export function projectAmount(
	amount: string | number,
	rate: DirectedRate,
	from: CurrencyCode,
	to: CurrencyCode
): string | null {
	if (from === to) return new Decimal(amount).toString();
	const value = new Decimal(rate.rate);
	if (value.lte(0)) return null;
	if (rate.one === from) return new Decimal(amount).mul(value).toString();
	if (rate.one === to) return new Decimal(amount).div(value).toString();
	return null;
}

// Currencies an order can be viewed in: its own currency first, then every
// code present in either rate map. The toggle and the projection both go
// through the same maps, so they can never disagree.
export function viewCurrencies(order: OrderRateMaps): CurrencyCode[] {
	const own = (order.currency ?? 'JMD') as CurrencyCode;
	const out: CurrencyCode[] = [own];
	const keys = [
		...Object.keys(order.exchange_rates ?? {}),
		...Object.keys(order.directed_rates ?? {})
	] as CurrencyCode[];
	for (const code of keys) {
		if (!out.includes(code) && resolveRate(order, code)) out.push(code);
	}
	return out;
}

// A rate is not money, so it is never rounded to currency decimals. Every
// saved decimal is kept (the API allows 6); trailing zeros are trimmed down
// to the conventional minimum of 2.
function formatRateValue(rate: string): string {
	const d = new Decimal(rate);
	const places = Math.min(Math.max(d.decimalPlaces(), 2), 6);
	const fixed = d.toFixed(places, Decimal.ROUND_HALF_UP);
	const [whole, frac = ''] = fixed.split('.');
	const grouped = new Intl.NumberFormat('en-JM', { maximumFractionDigits: 0 }).format(
		Number(whole)
	);
	return `${grouped}.${frac.padEnd(2, '0')}`;
}

// "1 USD = 155.00 JMD", in the direction the rate was entered. `foreign` is
// the map key the rate was found under; `base` is the other side.
export function formatRateLine(
	rate: DirectedRate | null | undefined,
	foreign: CurrencyCode,
	base: CurrencyCode
): string {
	if (!rate) return '';
	try {
		if (new Decimal(rate.rate).lte(0)) return '';
		const other = rate.one === foreign ? base : foreign;
		return `1 ${rate.one} = ${formatRateValue(rate.rate)} ${other}`;
	} catch {
		return '';
	}
}

// Format an amount stored in an order's currency, optionally projecting
// it into a different "view currency" using the order's snapshotted
// rate maps. When viewCurrency matches the order's currency (or no rate is
// available in the snapshot), behaves identically to formatMoney.
//
// Rates come from resolveRate: order.directed_rates first, then the legacy
// order.exchange_rates string (1 <foreign> = N <base>). v1 supports
// JMD<->USD on a single-base store. Foreign->foreign is unsupported; in
// that case the projection is skipped.
export function formatOrderAmount(
	amount: string | number,
	order: OrderRateMaps & { store?: OrderCurrencyStore | null },
	viewCurrency: CurrencyCode | undefined,
	opts?: { store?: OrderCurrencyStore | null }
): string {
	const orderCurrency = (order.currency ?? 'JMD') as CurrencyCode;
	const target = (viewCurrency ?? orderCurrency) as CurrencyCode;
	const store = opts?.store ?? order.store ?? null;
	const baseCurrency = (store?.base_currency ?? order.store?.base_currency ?? 'JMD') as CurrencyCode;

	const renderNative = (): string =>
		formatMoney(amount, orderCurrency, { ...opts, asBase: orderCurrency === baseCurrency });

	if (target === orderCurrency) return renderNative();

	// Exactly one side of the pair must be the base. Foreign -> foreign is
	// unsupported in v1.
	if (orderCurrency !== baseCurrency && target !== baseCurrency) return renderNative();
	const foreign = orderCurrency === baseCurrency ? target : orderCurrency;

	try {
		// Strict snapshot: only currencies present in the order's snapshot
		// at create time are projectable. The store's CURRENT rates are NOT
		// consulted — that would retroactively rewrite historical receipts
		// when the store updates rates (lock-currency/idea-honing.md Q5).
		const rate = resolveRate(order, foreign);
		if (!rate) return renderNative();
		const projected = projectAmount(amount, rate, orderCurrency, target);
		if (projected === null) return renderNative();
		const converted = roundForCurrency(projected, target);
		return formatMoney(converted, target, { ...opts, asBase: target === baseCurrency });
	} catch {
		return renderNative();
	}
}
