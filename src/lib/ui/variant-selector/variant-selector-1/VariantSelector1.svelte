<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type PublicVariant = {
		uid: string;
		name?: string | null;
		/** Display axes, e.g. `{ Size: "Large", Colour: "Red" }`. */
		options?: Record<string, string> | null;
		price: string;
		price_compare?: string | null;
		available: boolean;
	};

	export type VariantSelector1Props = {
		variants: PublicVariant[];
		/** Selected variant uid, bindable. */
		value?: string | null;
		currency: string;
		label?: string;
		onchange?: (uid: string) => void;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Price1 } from '$lib/ui/price/price-1/index.js';

	let {
		variants,
		value = $bindable(null),
		currency,
		label = 'Options',
		onchange,
		...restProps
	}: VariantSelector1Props = $props();

	function describe(variant: PublicVariant): string {
		if (variant.options && Object.keys(variant.options).length > 0) {
			return Object.values(variant.options).join(' / ');
		}
		return variant.name || 'Option';
	}

	function select(variant: PublicVariant) {
		// Sold-out variants stay visible and selectable-looking but cannot be
		// chosen — the shopper should see the option exists, not wonder where
		// it went (the same reasoning that keeps sold-out products listed).
		if (!variant.available) return;
		value = variant.uid;
		onchange?.(variant.uid);
	}
</script>

<fieldset class={twMerge('flex flex-col gap-2', restProps.class)}>
	<legend class="text-sm font-medium text-neutral-700">{label}</legend>
	<div class="flex flex-wrap gap-2">
		{#each variants as variant (variant.uid)}
			{@const selected = value === variant.uid}
			<button
				type="button"
				aria-pressed={selected}
				disabled={!variant.available}
				class={twMerge(
					'rounded-primary flex flex-col items-start gap-0.5 border px-3 py-2 text-left text-sm transition-colors',
					selected
						? 'border-primary-button bg-primary-50 text-neutral-900'
						: 'border-primary-input-border hover:border-primary-focus bg-white text-neutral-700',
					!variant.available && 'cursor-not-allowed line-through opacity-50'
				)}
				onclick={() => select(variant)}
			>
				<span class="font-medium">{describe(variant)}</span>
				<Price1 amount={variant.price} compareAmount={variant.price_compare} {currency} size="sm" />
			</button>
		{/each}
	</div>
</fieldset>
