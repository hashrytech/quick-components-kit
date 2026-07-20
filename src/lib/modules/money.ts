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
};

export function orderAmountPaid(payments: PaidPayment[] | null | undefined): number {
	return (payments ?? []).reduce((sum, p) => {
		const amount = Number.parseFloat(p.amount ?? '0');
		if (!Number.isFinite(amount)) return sum;
		const typeId = (p.type ?? p.payment_type)?.id ?? '';
		return typeId === 'refund' ? sum - amount : sum + amount;
	}, 0);
}

// Display formatter — locale-aware grouping via Intl, sign and currency
// adornment applied here.

export type OrderCurrencyStore = {
	base_currency?: CurrencyCode;
	default_exchange_rates?: Record<string, string>;
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

// Format an amount stored in an order's currency, optionally projecting
// it into a different "view currency" using the order's snapshotted
// rate map. When viewCurrency matches the order's currency (or no rate is
// available in the snapshot), behaves identically to formatMoney.
//
// Rate convention: order.exchange_rates[foreign] is base-per-foreign
// (how many base units equal 1 unit of `foreign`), copied verbatim from
// store.default_exchange_rates at order create time. v1 supports JMD<->USD
// on a single-base store. Foreign->foreign is unsupported; in that case
// the projection is skipped.
export function formatOrderAmount(
	amount: string | number,
	order: { currency?: CurrencyCode; exchange_rates?: Record<string, string> | null; store?: OrderCurrencyStore | null },
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

	// Strict snapshot: only currencies present in the order's snapshot
	// at create time are projectable. The store's CURRENT
	// default_exchange_rates is NOT consulted — that would retroactively
	// rewrite historical receipts when the store updates rates
	// (lock-currency/idea-honing.md Q5).
	const rateFor = (currency: CurrencyCode): string | null | undefined => {
		if (currency === baseCurrency) return null;
		return order.exchange_rates?.[currency];
	};

	let rate: string | null | undefined;
	let multiplier: string;
	try {
		if (orderCurrency === baseCurrency && target !== baseCurrency) {
			// base -> foreign: divide
			rate = rateFor(target);
			if (!rate) return renderNative();
			multiplier = inverseRate(rate);
		} else if (orderCurrency !== baseCurrency && target === baseCurrency) {
			// foreign -> base: multiply
			rate = rateFor(orderCurrency);
			if (!rate) return renderNative();
			multiplier = String(rate);
		} else {
			// foreign -> foreign: unsupported in v1
			return renderNative();
		}

		const converted = roundForCurrency(convert(amount, multiplier), target);
		return formatMoney(converted, target, { ...opts, asBase: target === baseCurrency });
	} catch {
		return renderNative();
	}
}
