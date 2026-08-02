<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	/** Exactly the preview endpoint's response shape. */
	export type CheckoutTotals = {
		subtotal: string;
		fees: string;
		tax: string;
		total: string;
		currency: string;
	};

	export type TotalsBreakdown1Props = {
		totals: CheckoutTotals;
		/** ISO-8601 instant the signed quote stops being valid. */
		quoteExpiresAt?: string | null;
		busy?: boolean;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Price1 } from '$lib/ui/price/price-1/index.js';
	import { Spinner1 } from '$lib/ui/spinner/spinner-1/index.js';

	let {
		totals,
		quoteExpiresAt = null,
		busy = false,
		...restProps
	}: TotalsBreakdown1Props = $props();

	// Zero fees/tax are common and a row of "$0.00" is noise; the total is
	// always shown because it is the number the shopper is authorizing.
	const showFees = $derived(Number(totals.fees) > 0);
	const showTax = $derived(Number(totals.tax) > 0);
</script>

<div class={twMerge('flex flex-col gap-2 text-sm', restProps.class)}>
	<div class="flex items-center justify-between">
		<span class="text-neutral-600">Subtotal</span>
		<Price1 amount={totals.subtotal} currency={totals.currency} size="sm" />
	</div>

	{#if showFees}
		<div class="flex items-center justify-between">
			<span class="text-neutral-600">Fees</span>
			<Price1 amount={totals.fees} currency={totals.currency} size="sm" />
		</div>
	{/if}

	{#if showTax}
		<div class="flex items-center justify-between">
			<span class="text-neutral-600">Tax</span>
			<Price1 amount={totals.tax} currency={totals.currency} size="sm" />
		</div>
	{/if}

	<div class="mt-1 flex items-center justify-between border-t border-neutral-200 pt-2">
		<span class="font-semibold text-neutral-900">Total</span>
		{#if busy}
			<Spinner1 size="sm" label="Updating total" />
		{:else}
			<Price1 amount={totals.total} currency={totals.currency} size="lg" />
		{/if}
	</div>

	{#if quoteExpiresAt}
		<p class="text-xs text-neutral-500">
			This price is held until {new Date(quoteExpiresAt).toLocaleTimeString()}.
		</p>
	{/if}
</div>
