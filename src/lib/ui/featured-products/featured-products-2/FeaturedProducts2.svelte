<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';
	import type { PublicProductCard } from '$lib/ui/product-card/product-card-1/ProductCard1.svelte';

	export type FeaturedProducts2Props = {
		products: PublicProductCard[];
		/** ISO-4217 code the prices are quoted in. Required for the same reason
		 *  ProductList1 requires it: a hardcoded "$" misprices every store whose
		 *  currency is not dollar-symbolled. */
		currency: string;
		title?: string;
		titleDescription?: string;
		columns?: number;
		viewAllLabel?: string;
		showQuickAdd?: boolean;
		showBadges?: boolean;
		emptyText?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Quick-add grid: borderless cards, a badge on anything sold out, and an
	 * Add to cart control that rises on hover.
	 *
	 * The add is a real POST to the product page's `add` action, so it works
	 * without JavaScript and keeps SvelteKit's origin checking. It saves a page
	 * per purchase, which is the reason to pick this design over a plain grid.
	 *
	 * A product priced as a range needs a choice made first, so it gets a link
	 * to its page instead. Adding a variant product without its variant makes a
	 * cart line nobody can fulfil.
	 *
	 * On touch there is no hover, so below `lg` the control is simply always
	 * visible rather than hidden behind a gesture that does not exist.
	 */
	import { twMerge } from 'tailwind-merge';
	import { Price1 } from '$lib/ui/price/price-1/index.js';

	let {
		products,
		currency,
		title,
		titleDescription,
		columns = 4,
		viewAllLabel,
		showQuickAdd = true,
		showBadges = true,
		emptyText = 'Nothing to show yet.',
		...restProps
	}: FeaturedProducts2Props = $props();

	// Fixed class strings, not interpolation: Tailwind ships only the classes it
	// can see in the source, and `lg:grid-cols-${n}` is invisible to it.
	const COLUMN_CLASS: Record<number, string> = {
		2: 'grid-cols-2',
		3: 'grid-cols-2 md:grid-cols-3',
		4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
	};
	const gridColumns = $derived(COLUMN_CLASS[Math.trunc(columns)] ?? COLUMN_CLASS[4]);

	const REVEAL =
		'absolute inset-x-3 bottom-3 rounded py-2 text-center text-sm font-medium transition lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100';

	/** A price range means variants to choose between. */
	function hasOptions(product: PublicProductCard): boolean {
		return Boolean(product.price_max && product.price_max !== product.price_min);
	}
</script>

<section class={twMerge('px-4 py-8', restProps.class)}>
	{#if title || viewAllLabel}
		<div class="mb-5 flex flex-wrap items-end justify-between gap-3">
			<div>
				{#if title}<h2 class="text-xl font-semibold tracking-tight">{title}</h2>{/if}
				{#if titleDescription}
					<p class="mt-1 max-w-xl text-sm text-neutral-600">{titleDescription}</p>
				{/if}
			</div>
			{#if viewAllLabel}
				<a
					href="/products"
					class="text-sm font-medium text-neutral-600 underline underline-offset-4"
				>
					{viewAllLabel}
				</a>
			{/if}
		</div>
	{/if}

	{#if products.length === 0}
		<p class="py-8 text-center text-sm text-neutral-500">{emptyText}</p>
	{:else}
		<div class={twMerge('grid gap-x-5 gap-y-8', gridColumns)}>
			{#each products as product (product.uid)}
				<div class="group">
					<div class="relative overflow-hidden rounded-lg bg-neutral-100">
						<a href={`/products/${product.uid}`} class="block">
							{#if product.media?.url}
								<img
									src={product.media.url}
									alt={product.media.alt_text || product.name}
									loading="lazy"
									class="aspect-[4/5] w-full object-contain transition duration-300 group-hover:scale-105"
								/>
							{:else}
								<div
									class="flex aspect-[4/5] w-full items-center justify-center text-sm text-neutral-400"
								>
									No image
								</div>
							{/if}
						</a>

						{#if showBadges && !product.available}
							<span
								class="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold shadow-sm"
							>
								Sold out
							</span>
						{/if}

						{#if showQuickAdd && product.available}
							{#if hasOptions(product)}
								<a
									href={`/products/${product.uid}`}
									class={twMerge(REVEAL, 'block bg-white text-neutral-900 shadow-sm')}
								>
									Choose options
								</a>
							{:else}
								<form method="POST" action={`/products/${product.uid}?/add`}>
									<input type="hidden" name="product" value={product.uid} />
									<input type="hidden" name="quantity" value="1" />
									<button
										type="submit"
										class={twMerge(REVEAL, 'bg-primary-button w-[calc(100%-1.5rem)] text-white')}
									>
										Add to cart
									</button>
								</form>
							{/if}
						{/if}
					</div>

					<a href={`/products/${product.uid}`} class="block">
						<h3 class="mt-3 text-[15px] font-medium text-neutral-900">{product.name}</h3>
						<Price1
							amount={product.price_min}
							{currency}
							class="mt-0.5 text-[15px] text-neutral-700"
						/>
					</a>
				</div>
			{/each}
		</div>
	{/if}
</section>
