<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	/** Only the remote-shopper types; dining/retail are on-premise. */
	export type WebOrderType = 'pickup' | 'delivery' | 'shipping';

	export type OrderTypeSelector1Props = {
		/**
		 * The intersection the API computed: storefront-supported types ∩ the
		 * store's enabled types, narrowed by its address-order-type preference.
		 * Rendering anything outside this list guarantees a rejected submit.
		 */
		options: WebOrderType[];
		value?: WebOrderType | null;
		label?: string;
		error?: string;
		disabled?: boolean;
		onchange?: (value: WebOrderType) => void;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		options,
		value = $bindable(null),
		label = 'How would you like your order?',
		error,
		disabled = false,
		onchange,
		...restProps
	}: OrderTypeSelector1Props = $props();

	const copy: Record<WebOrderType, { title: string; hint: string }> = {
		pickup: { title: 'Pickup', hint: 'Collect from the store' },
		delivery: { title: 'Delivery', hint: 'Delivered to your address' },
		shipping: { title: 'Shipping', hint: 'Shipped to your address' }
	};

	function select(option: WebOrderType) {
		if (disabled) return;
		value = option;
		onchange?.(option);
	}
</script>

<fieldset class={twMerge('flex flex-col gap-2', restProps.class)}>
	<legend class="text-sm font-medium text-neutral-700">{label}</legend>
	<div class="grid gap-2 sm:grid-cols-3">
		{#each options as option (option)}
			<button
				type="button"
				aria-pressed={value === option}
				{disabled}
				class={twMerge(
					'rounded-primary flex flex-col items-start border px-3 py-2 text-left transition-colors',
					value === option
						? 'border-primary-button bg-primary-50'
						: 'border-primary-input-border hover:border-primary-focus bg-white'
				)}
				onclick={() => select(option)}
			>
				<span class="text-sm font-medium text-neutral-900">{copy[option].title}</span>
				<span class="text-xs text-neutral-500">{copy[option].hint}</span>
			</button>
		{/each}
	</div>
	{#if error}
		<p class="text-xs text-red-600">{error}</p>
	{/if}
</fieldset>
