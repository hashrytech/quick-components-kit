<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';
	import type { PublicProductCard } from '$lib/ui/product-card/product-card-1/ProductCard1.svelte';

	export type FeaturedProducts6Props = {
		products: PublicProductCard[];
		currency: string;
		title?: string;
		buttonLabel?: string;
		showDescription?: boolean;
		alternateSides?: boolean;
		emptyText?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Full-width rows: image one side, a description and a button on the other,
	 * alternating sides down the page.
	 *
	 * Built for a handful of considered products, not forty — each row costs a
	 * screen. It suits made-to-order and service items, where the sentence
	 * matters as much as the picture.
	 *
	 * The button leads to the product page rather than adding straight to the
	 * cart: a product given this much space usually has a choice to make first.
	 */
	import { twMerge } from 'tailwind-merge';
	import { Price1 } from '$lib/ui/price/price-1/index.js';

	let {
		products,
		currency,
		title,
		buttonLabel = 'View product',
		showDescription = true,
		alternateSides = true,
		emptyText = 'Nothing to show yet.',
		...restProps
	}: FeaturedProducts6Props = $props();
</script>

<section class={twMerge('px-4 py-8', restProps.class)}>
	{#if title}
		<h2 class="mb-6 text-xl font-semibold tracking-tight">{title}</h2>
	{/if}

	{#if products.length === 0}
		<p class="py-8 text-center text-sm text-neutral-500">{emptyText}</p>
	{:else}
		<div class="space-y-8">
			{#each products as product, index (product.uid)}
				{@const flipped = alternateSides && index % 2 === 1}
				<div class="grid items-center gap-6 sm:grid-cols-2">
					<a href={`/products/${product.uid}`} class={twMerge('block', flipped && 'sm:order-2')}>
						{#if product.media?.url}
							<img
								src={product.media.url}
								alt={product.media.alt_text || product.name}
								loading="lazy"
								class="aspect-[4/3] w-full rounded-lg bg-neutral-100 object-contain"
							/>
						{:else}
							<div
								class="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400"
							>
								No image
							</div>
						{/if}
					</a>
					<div class={twMerge(flipped && 'sm:order-1')}>
						<h3 class="text-xl font-semibold tracking-tight">
							<a href={`/products/${product.uid}`}>{product.name}</a>
						</h3>
						{#if showDescription && product.description}
							<p class="mt-2 line-clamp-4 text-sm leading-relaxed text-neutral-600">
								{product.description}
							</p>
						{/if}
						<Price1 amount={product.price_min} {currency} size="lg" class="mt-3" />
						<a
							href={`/products/${product.uid}`}
							class="bg-primary-button mt-4 inline-block rounded px-5 py-2 text-sm font-medium text-white"
						>
							{buttonLabel}
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
