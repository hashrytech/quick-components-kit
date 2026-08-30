<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';
	import type { PublicProductCard } from '$lib/ui/product-card/product-card-1/ProductCard1.svelte';

	export type FeaturedProducts3Props = {
		products: PublicProductCard[];
		currency: string;
		title?: string;
		titleDescription?: string;
		showArrows?: boolean;
		emptyText?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * A single row that scrolls sideways, with the next card peeking to say
	 * there is more.
	 *
	 * Shows twelve products in the height of four, and sideways is the natural
	 * gesture on a phone. Scrolling is native CSS with snap points, so it works
	 * with a trackpad, a touch screen and the keyboard — no carousel library,
	 * and no timer moving the page while someone is reading it.
	 *
	 * The arrows are an addition for mouse users, never the only way through.
	 */
	import { twMerge } from 'tailwind-merge';
	import { Price1 } from '$lib/ui/price/price-1/index.js';

	let {
		products,
		currency,
		title,
		titleDescription,
		showArrows = true,
		emptyText = 'Nothing to show yet.',
		...restProps
	}: FeaturedProducts3Props = $props();

	let track: HTMLDivElement | undefined = $state();

	function scrollBy(direction: 1 | -1) {
		// One viewport of the track less a card, so the card at the edge stays on
		// screen and the reader keeps their place.
		track?.scrollBy({ left: direction * (track.clientWidth - 96), behavior: 'smooth' });
	}
</script>

<section class={twMerge('py-8', restProps.class)}>
	<div class="mb-5 flex flex-wrap items-end justify-between gap-3 px-4">
		<div>
			{#if title}<h2 class="text-xl font-semibold tracking-tight">{title}</h2>{/if}
			{#if titleDescription}
				<p class="mt-1 max-w-xl text-sm text-neutral-600">{titleDescription}</p>
			{/if}
		</div>
		{#if showArrows && products.length > 0}
			<div class="flex gap-2">
				<button
					type="button"
					aria-label="Scroll left"
					onclick={() => scrollBy(-1)}
					class="hover:border-primary-button flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600"
				>
					&#8592;
				</button>
				<button
					type="button"
					aria-label="Scroll right"
					onclick={() => scrollBy(1)}
					class="hover:border-primary-button flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600"
				>
					&#8594;
				</button>
			</div>
		{/if}
	</div>

	{#if products.length === 0}
		<p class="py-8 text-center text-sm text-neutral-500">{emptyText}</p>
	{:else}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<!-- A scrollable region has to be reachable by keyboard (WCAG 2.1.1), and
		     the only way to give the arrow keys something to scroll is to make
		     the track focusable. It is labelled so it is announced as a region
		     rather than an unexplained stop. -->
		<div
			bind:this={track}
			class="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3"
			tabindex="0"
			role="region"
			aria-label={title || 'Products'}
		>
			{#each products as product (product.uid)}
				<a href={`/products/${product.uid}`} class="w-44 shrink-0 snap-start sm:w-56">
					{#if product.media?.url}
						<img
							src={product.media.url}
							alt={product.media.alt_text || product.name}
							loading="lazy"
							class="aspect-square w-full rounded-xl bg-neutral-100 object-contain"
						/>
					{:else}
						<div
							class="flex aspect-square w-full items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-400"
						>
							No image
						</div>
					{/if}
					<h3 class="mt-3 text-[15px] font-medium text-neutral-900">{product.name}</h3>
					<Price1
						amount={product.price_min}
						{currency}
						class="mt-0.5 text-[15px] text-neutral-700"
					/>
				</a>
			{/each}
		</div>
	{/if}
</section>
