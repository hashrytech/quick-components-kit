<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';
	import type { PublicProductCard } from '$lib/ui/product-card/product-card-1/ProductCard1.svelte';

	export type FeaturedProducts4Props = {
		products: PublicProductCard[];
		currency: string;
		title?: string;
		/** Small line over the hero name, e.g. "Pick of the month". */
		heroEyebrow?: string;
		emptyText?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * One product leads at half the section, the rest sit beside it.
	 *
	 * Use it when there is a product worth pushing, rather than four weighted
	 * equally. The hero is the first product in the list: the renderer decides
	 * the order, so promoting a different one is a catalogue change rather than
	 * a setting that can fall out of step with the catalogue.
	 *
	 * With one product it degrades to just the hero, which still reads.
	 */
	import { twMerge } from 'tailwind-merge';
	import { Price1 } from '$lib/ui/price/price-1/index.js';

	let {
		products,
		currency,
		title,
		heroEyebrow,
		emptyText = 'Nothing to show yet.',
		...restProps
	}: FeaturedProducts4Props = $props();

	const hero = $derived(products[0]);
	const rest = $derived(products.slice(1));
</script>

<section class={twMerge('px-4 py-8', restProps.class)}>
	{#if title}
		<h2 class="mb-5 text-xl font-semibold tracking-tight">{title}</h2>
	{/if}

	{#if !hero}
		<p class="py-8 text-center text-sm text-neutral-500">{emptyText}</p>
	{:else}
		<div class="grid gap-5 lg:grid-cols-2">
			<a href={`/products/${hero.uid}`} class="group block">
				{#if hero.media?.url}
					<img
						src={hero.media.url}
						alt={hero.media.alt_text || hero.name}
						class="aspect-[4/3] w-full rounded-xl bg-neutral-100 object-contain lg:aspect-[4/5]"
					/>
				{:else}
					<div
						class="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-400 lg:aspect-[4/5]"
					>
						No image
					</div>
				{/if}
				<div class="mt-4">
					{#if heroEyebrow}
						<p class="text-[11px] tracking-[0.18em] text-neutral-500 uppercase">{heroEyebrow}</p>
					{/if}
					<h3 class="mt-1 text-2xl font-semibold tracking-tight">{hero.name}</h3>
					{#if hero.description}
						<p class="mt-2 line-clamp-3 max-w-sm text-sm leading-relaxed text-neutral-600">
							{hero.description}
						</p>
					{/if}
					<Price1 amount={hero.price_min} {currency} size="lg" class="mt-3" />
				</div>
			</a>

			{#if rest.length}
				<div class="grid grid-cols-2 gap-5 self-start">
					{#each rest as product (product.uid)}
						<a href={`/products/${product.uid}`} class="block">
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
							<h3 class="mt-2 text-sm font-medium text-neutral-900">{product.name}</h3>
							<Price1 amount={product.price_min} {currency} size="sm" class="mt-0.5" />
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</section>
