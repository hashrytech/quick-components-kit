<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';
	import type { PublicVariant } from '$lib/ui/variant-selector/variant-selector-1/VariantSelector1.svelte';

	export type PublicProductDetail = {
		uid: string;
		name: string;
		description?: string;
		media?: { url: string; alt_text?: string }[];
		/** Base price for variantless products. */
		price?: string | null;
		price_compare?: string | null;
		price_min?: string | null;
		price_max?: string | null;
		available: boolean;
		variants: PublicVariant[];
	};

	export type ProductDetail1Props = {
		product: PublicProductDetail;
		currency: string;
		/** Selected variant uid (bindable); null for variantless products. */
		selectedVariantUid?: string | null;
		quantity?: number;
		busy?: boolean;
		onAddToCart?: (payload: {
			product: PublicProductDetail;
			variantUid: string | null;
			quantity: number;
		}) => void;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Button } from '$lib/components/button/index.js';
	import { Price1 } from '$lib/ui/price/price-1/index.js';
	import { AvailabilityBadge1 } from '$lib/ui/availability-badge/availability-badge-1/index.js';
	import { VariantSelector1 } from '$lib/ui/variant-selector/variant-selector-1/index.js';
	import { QuantityStepper1 } from '$lib/ui/quantity-stepper/quantity-stepper-1/index.js';

	let {
		product,
		currency,
		selectedVariantUid = $bindable(null),
		quantity = $bindable(1),
		busy = false,
		onAddToCart,
		...restProps
	}: ProductDetail1Props = $props();

	const hasVariants = $derived(product.variants.length > 0);
	const selectedVariant = $derived(
		product.variants.find((variant) => variant.uid === selectedVariantUid) ?? null
	);

	// A variant product must have a chosen variant before it can be bought —
	// the API rejects a variantless submission for such a product outright.
	const needsChoice = $derived(hasVariants && !selectedVariant);
	const activePrice = $derived(selectedVariant?.price ?? product.price ?? product.price_min ?? '0');
	const activeCompare = $derived(selectedVariant?.price_compare ?? product.price_compare ?? null);
	const activeAvailable = $derived(selectedVariant ? selectedVariant.available : product.available);

	let activeImage = $state(0);
</script>

<div class={twMerge('grid gap-8 md:grid-cols-2', restProps.class)}>
	<div class="flex flex-col gap-3">
		{#if product.media && product.media.length > 0}
			<img
				src={product.media[activeImage]?.url}
				alt={product.media[activeImage]?.alt_text || product.name}
				class="rounded-primary w-full object-cover"
			/>
			{#if product.media.length > 1}
				<div class="flex flex-wrap gap-2">
					{#each product.media as media, index (media.url)}
						<button
							type="button"
							class={twMerge(
								'rounded-primary size-16 overflow-hidden border',
								index === activeImage ? 'border-primary-button' : 'border-primary-card-border'
							)}
							aria-label={`Show image ${index + 1}`}
							onclick={() => (activeImage = index)}
						>
							<img
								src={media.url}
								alt={media.alt_text || product.name}
								class="size-full object-cover"
							/>
						</button>
					{/each}
				</div>
			{/if}
		{:else}
			<!-- Decorative: the <h1> below already announces the product name. -->
			<div
				class="rounded-primary flex h-72 w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400"
				aria-hidden="true"
			>
				No image
			</div>
		{/if}
	</div>

	<div class="flex flex-col gap-4">
		<div class="flex items-start justify-between gap-3">
			<h1 class="text-2xl font-semibold text-neutral-900">{product.name}</h1>
			<AvailabilityBadge1 available={activeAvailable} />
		</div>

		<Price1 amount={activePrice} compareAmount={activeCompare} {currency} size="lg" />

		{#if product.description}
			<p class="text-sm leading-relaxed text-neutral-700">{product.description}</p>
		{/if}

		{#if hasVariants}
			<VariantSelector1 variants={product.variants} bind:value={selectedVariantUid} {currency} />
		{/if}

		<div class="flex flex-wrap items-center gap-3">
			<QuantityStepper1 bind:value={quantity} disabled={!activeAvailable} />
			<Button
				class="justify-center px-5 py-2 text-sm text-white"
				loading={busy}
				disabled={!activeAvailable || needsChoice}
				onclick={() => onAddToCart?.({ product, variantUid: selectedVariantUid ?? null, quantity })}
			>
				{#if !activeAvailable}
					Sold out
				{:else if needsChoice}
					Select an option
				{:else}
					Add to cart
				{/if}
			</Button>
		</div>
	</div>
</div>
