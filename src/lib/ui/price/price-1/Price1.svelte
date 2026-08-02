<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Price1Props = {
		/** Raw decimal amount as a string (e.g. "1250.0000"). */
		amount: string | number;
		/** ISO-4217 alpha-3 code, normally the store's `base_currency`. */
		currency: string;
		/** Optional strike-through "was" price. Hidden when it is not higher. */
		compareAmount?: string | number | null;
		size?: 'sm' | 'md' | 'lg';
		class?: ClassNameValue;
		compareClass?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { formatMoney } from '$lib/modules/money.js';

	let {
		amount,
		currency,
		compareAmount = null,
		size = 'md',
		compareClass,
		...restProps
	}: Price1Props = $props();

	// Formatting is centralized in modules/money so no storefront component
	// ever hardcodes a currency symbol again — a hardcoded "$" silently
	// mispriced every non-dollar store.
	const display = $derived(formatMoney(amount, currency));
	const compareDisplay = $derived(
		compareAmount === null || compareAmount === undefined || compareAmount === ''
			? null
			: formatMoney(compareAmount, currency)
	);
	// Only a genuinely higher "was" price is worth showing; catalogs routinely
	// carry a compare price equal to (or below) the sell price.
	const showCompare = $derived(compareDisplay !== null && Number(compareAmount) > Number(amount));

	const sizeClass = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' } as const;
	const compareSizeClass = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' } as const;
</script>

<span class="inline-flex items-baseline gap-2">
	<span class={twMerge('font-semibold text-neutral-900', sizeClass[size], restProps.class)}>
		{display}
	</span>
	{#if showCompare}
		<span class={twMerge('text-neutral-500 line-through', compareSizeClass[size], compareClass)}>
			{compareDisplay}
		</span>
	{/if}
</span>
