<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';
	import type { PublicProductCard } from '$lib/ui/product-card/product-card-1/ProductCard1.svelte';

	export type FeaturedProducts5Props = {
		products: PublicProductCard[];
		currency: string;
		title?: string;
		titleDescription?: string;
		emptyText?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Staggered: cards drop out of line and the frames alternate shape, so the
	 * row reads as an arrangement rather than a spreadsheet.
	 *
	 * Best with strong photography. It will expose weak product shots that a
	 * uniform grid hides, which is the trade being made.
	 *
	 * The offsets apply from `lg` only. Staggering two columns on a phone gives
	 * a long ragged column with holes in it.
	 */
	import { twMerge } from 'tailwind-merge';
	import { Price1 } from '$lib/ui/price/price-1/index.js';

	let {
		products,
		currency,
		title,
		titleDescription,
		emptyText = 'Nothing to show yet.',
		...restProps
	}: FeaturedProducts5Props = $props();

	// Cycled by position, never random: the same catalogue must lay out the same
	// way on the server and in the browser, or the page rearranges on hydration.
	const OFFSETS = ['lg:mt-10', '', 'lg:mt-16', 'lg:mt-4'];
	const SHAPES = ['aspect-[3/4]', 'aspect-square', 'aspect-[3/4]', 'aspect-square'];
</script>

<section class={twMerge('px-4 py-8 lg:pb-16', restProps.class)}>
	{#if title || titleDescription}
		<div class="mb-6">
			{#if title}<h2 class="text-xl font-semibold tracking-tight">{title}</h2>{/if}
			{#if titleDescription}
				<p class="mt-1 max-w-xl text-sm text-neutral-600">{titleDescription}</p>
			{/if}
		</div>
	{/if}

	{#if products.length === 0}
		<p class="py-8 text-center text-sm text-neutral-500">{emptyText}</p>
	{:else}
		<div class="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
			{#each products as product, index (product.uid)}
				<a href={`/products/${product.uid}`} class={OFFSETS[index % OFFSETS.length]}>
					{#if product.media?.url}
						<img
							src={product.media.url}
							alt={product.media.alt_text || product.name}
							loading="lazy"
							class={twMerge(
								'w-full rounded bg-neutral-100 object-contain',
								SHAPES[index % SHAPES.length]
							)}
						/>
					{:else}
						<div
							class={twMerge(
								'flex w-full items-center justify-center rounded bg-neutral-100 text-sm text-neutral-400',
								SHAPES[index % SHAPES.length]
							)}
						>
							No image
						</div>
					{/if}
					<h3 class="mt-3 text-[13px] tracking-wide text-neutral-900">{product.name}</h3>
					<Price1 amount={product.price_min} {currency} size="sm" class="mt-0.5 text-neutral-500" />
				</a>
			{/each}
		</div>
	{/if}
</section>
