<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type AvailabilityBadge1Props = {
		/**
		 * Availability as the API computed it: not inventory-tracked OR
		 * keep-selling OR stock > 0, in the bound location's context. The
		 * storefront deliberately keeps sold-out products listed rather than
		 * hiding them, so this badge is what tells the shopper why they cannot
		 * add one to the cart.
		 */
		available: boolean;
		availableText?: string;
		soldOutText?: string;
		/** Render nothing at all while the item is available. */
		onlyWhenSoldOut?: boolean;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		available,
		availableText = 'In stock',
		soldOutText = 'Sold out',
		onlyWhenSoldOut = false,
		...restProps
	}: AvailabilityBadge1Props = $props();
</script>

{#if !available || !onlyWhenSoldOut}
	<span
		class={twMerge(
			'inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium',
			available ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-700',
			restProps.class
		)}
	>
		{available ? availableText : soldOutText}
	</span>
{/if}
