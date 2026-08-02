<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	/**
	 * The public product-card payload as the storefront API serves it. It is a
	 * deliberately bounded shape: no cost, MSRP, SKU, staff notes, or inventory
	 * counts, and no embedded variants (detail carries those).
	 */
	export type PublicProductCard = {
		uid: string;
		name: string;
		description?: string;
		media?: { url: string; alt_text?: string } | null;
		price_min: string;
		price_max?: string | null;
		available: boolean;
	};

	export type ProductCard1Props = {
		product: PublicProductCard;
		currency: string;
		/** App route for the detail page; the renderer owns routing. */
		href?: string;
		/** Omitted entirely on listings that don't sell inline. */
		onAddToCart?: (product: PublicProductCard) => void;
		addToCartText?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Button } from '$lib/components/button/index.js';
	import { Price1 } from '$lib/ui/price/price-1/index.js';
	import { AvailabilityBadge1 } from '$lib/ui/availability-badge/availability-badge-1/index.js';

	let {
		product,
		currency,
		href,
		onAddToCart,
		addToCartText = 'Add to cart',
		...restProps
	}: ProductCard1Props = $props();

	// A range only reads as a range when the ends actually differ.
	const hasRange = $derived(
		!!product.price_max && Number(product.price_max) > Number(product.price_min)
	);
</script>

<div
	class={twMerge(
		'rounded-primary border-primary-card-border shadow-primary flex flex-col overflow-hidden border bg-white',
		restProps.class
	)}
>
	<a href={href ?? `/products/${product.uid}`} class="block aspect-[4/3] overflow-hidden">
		{#if product.media?.url}
			<img
				src={product.media.url}
				alt={product.media.alt_text || product.name}
				class="h-[250px] w-full object-cover"
				loading="lazy"
			/>
		{:else}
			<!-- Products legitimately ship without media; a placeholder keeps the
			     grid aligned instead of collapsing the card. Decorative on
			     purpose — repeating the product name here would announce it
			     twice to a screen reader, since the heading below already
			     carries it. -->
			<div
				class="flex h-[250px] w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400"
				aria-hidden="true"
			>
				No image
			</div>
		{/if}
	</a>

	<div class="flex flex-1 flex-col gap-2 p-3">
		<div class="flex items-start justify-between gap-2">
			<h3 class="text-base font-medium text-neutral-900">
				<a href={href ?? `/products/${product.uid}`}>{product.name}</a>
			</h3>
			<AvailabilityBadge1 available={product.available} onlyWhenSoldOut />
		</div>

		{#if product.description}
			<p class="line-clamp-3 text-sm font-normal text-neutral-600">{product.description}</p>
		{/if}

		<div class="mt-auto pt-1">
			{#if hasRange}
				<span class="inline-flex items-baseline gap-1 text-base font-semibold text-neutral-900">
					<Price1 amount={product.price_min} {currency} />
					<span class="text-neutral-500">&ndash;</span>
					<Price1 amount={product.price_max!} {currency} />
				</span>
			{:else}
				<Price1 amount={product.price_min} {currency} />
			{/if}
		</div>
	</div>

	{#if onAddToCart}
		<Button
			class="w-full justify-center !rounded-none py-1 text-sm text-white"
			disabled={!product.available}
			onclick={() => onAddToCart?.(product)}
		>
			{product.available ? addToCartText : 'Sold out'}
		</Button>
	{/if}
</div>
