<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';
	// The card shape lives with ProductCard1, which owns it; consumers reach it
	// through that component's barrel rather than through this one.
	import type { PublicProductCard } from '$lib/ui/product-card/product-card-1/ProductCard1.svelte';

	export type ProductList1Props = {
		products: PublicProductCard[];
		/**
		 * ISO-4217 code the prices are quoted in (the store's base currency).
		 * Required: this component previously hardcoded a "$" prefix, which
		 * silently mispriced every store whose currency is not dollar-symbolled.
		 */
		currency: string;
		/** Shown when the catalog (or the current filter) has nothing. */
		emptyText?: string;
		/** Omit to hide the button entirely — e.g. when all pages are loaded. */
		onShowMore?: () => void;
		showMoreText?: string;
		showMoreBusy?: boolean;
		onAddToCart?: (product: PublicProductCard) => void;
		/** Build the detail route; the renderer owns routing. */
		hrefFor?: (product: PublicProductCard) => string;
		class?: ClassNameValue;
		cardClass?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Button } from '$lib/components/button/index.js';
	import { ProductCard1 } from '$lib/ui/product-card/product-card-1/index.js';

	let {
		products,
		currency,
		emptyText = 'No products to show yet.',
		onShowMore,
		showMoreText = 'Show More',
		showMoreBusy = false,
		onAddToCart,
		hrefFor,
		cardClass,
		...restProps
	}: ProductList1Props = $props();
</script>

<section class="flex flex-col gap-16">
	<div class="mx-auto w-full p-2">
		{#if products.length === 0}
			<p class="py-12 text-center text-sm text-neutral-500">{emptyText}</p>
		{:else}
			<div
				class={twMerge(
					'mx-auto grid [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] gap-4',
					restProps.class
				)}
			>
				{#each products as product (product.uid)}
					<ProductCard1
						{product}
						{currency}
						href={hrefFor?.(product)}
						{onAddToCart}
						class={cardClass}
					/>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Previously rendered unconditionally, so every list advertised more
	     products even when it was showing the last page. -->
	{#if onShowMore}
		<Button
			class="mx-auto w-fit justify-center px-4 py-2 text-sm font-semibold text-white"
			loading={showMoreBusy}
			onclick={onShowMore}
		>
			{showMoreText}
		</Button>
	{/if}
</section>
