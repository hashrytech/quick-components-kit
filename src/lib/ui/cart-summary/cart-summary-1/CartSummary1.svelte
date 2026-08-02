<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	/** One validated cart line as the public cart-lines endpoint returns it. */
	export type CartLine = {
		product: string;
		variant?: string | null;
		name: string;
		variant_name?: string | null;
		options?: Record<string, string> | null;
		media?: { url: string; alt_text?: string } | null;
		price: string;
		quantity: number;
		/** Sold-out lines stay visible so the shopper sees what changed. */
		available: boolean;
	};

	export type CartSummary1Props = {
		lines: CartLine[];
		currency: string;
		editable?: boolean;
		busy?: boolean;
		onQuantityChange?: (line: CartLine, quantity: number) => void;
		onRemove?: (line: CartLine) => void;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Price1 } from '$lib/ui/price/price-1/index.js';
	import { AvailabilityBadge1 } from '$lib/ui/availability-badge/availability-badge-1/index.js';
	import { QuantityStepper1 } from '$lib/ui/quantity-stepper/quantity-stepper-1/index.js';

	let {
		lines,
		currency,
		editable = true,
		busy = false,
		onQuantityChange,
		onRemove,
		...restProps
	}: CartSummary1Props = $props();

	function lineTotal(line: CartLine): string {
		// Display-only arithmetic. The server re-prices every line at preview
		// and again inside the order transaction; this never authorizes a charge.
		return (Number(line.price) * line.quantity).toString();
	}

	function describe(line: CartLine): string | null {
		if (line.options && Object.keys(line.options).length > 0) {
			return Object.values(line.options).join(' / ');
		}
		return line.variant_name ?? null;
	}
</script>

<ul class={twMerge('divide-y divide-neutral-200', restProps.class)}>
	{#each lines as line (line.product + (line.variant ?? ''))}
		<li class="flex gap-3 py-4">
			{#if line.media?.url}
				<img
					src={line.media.url}
					alt={line.media.alt_text || line.name}
					class="rounded-primary size-20 shrink-0 object-cover"
				/>
			{:else}
				<div class="rounded-primary size-20 shrink-0 bg-neutral-100"></div>
			{/if}

			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0">
						<p class="truncate text-sm font-medium text-neutral-900">{line.name}</p>
						{#if describe(line)}
							<p class="truncate text-xs text-neutral-500">{describe(line)}</p>
						{/if}
					</div>
					<Price1 amount={lineTotal(line)} {currency} size="sm" />
				</div>

				{#if !line.available}
					<AvailabilityBadge1 available={false} />
				{/if}

				<div class="mt-1 flex items-center gap-3">
					{#if editable}
						<QuantityStepper1
							value={line.quantity}
							disabled={busy}
							onchange={(quantity) => onQuantityChange?.(line, quantity)}
						/>
						<button
							type="button"
							class="text-xs text-neutral-500 underline hover:text-neutral-800 disabled:opacity-50"
							disabled={busy}
							onclick={() => onRemove?.(line)}
						>
							Remove
						</button>
					{:else}
						<span class="text-xs text-neutral-500">Qty {line.quantity}</span>
					{/if}
				</div>
			</div>
		</li>
	{/each}
</ul>
