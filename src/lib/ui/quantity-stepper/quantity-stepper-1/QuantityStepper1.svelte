<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type QuantityStepper1Props = {
		value: number;
		min?: number;
		/** Server caps aggregate quantity per line identity at 999. */
		max?: number;
		disabled?: boolean;
		label?: string;
		onchange?: (value: number) => void;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		value = $bindable(),
		min = 1,
		max = 999,
		disabled = false,
		label = 'Quantity',
		onchange,
		...restProps
	}: QuantityStepper1Props = $props();

	function clamp(next: number): number {
		if (!Number.isFinite(next)) return min;
		return Math.min(max, Math.max(min, Math.trunc(next)));
	}

	function set(next: number) {
		const clamped = clamp(next);
		if (clamped === value) return;
		value = clamped;
		onchange?.(clamped);
	}

	function handleInput(event: Event) {
		const raw = (event.currentTarget as HTMLInputElement).value;
		// Quantities are strict positive integers server-side; anything else
		// falls back to the minimum rather than posting a rejected value.
		set(Number.parseInt(raw, 10));
	}
</script>

<div
	class={twMerge(
		'rounded-primary border-primary-input-border inline-flex items-center border',
		restProps.class
	)}
>
	<button
		type="button"
		class="px-3 py-1 text-lg leading-none text-neutral-700 disabled:opacity-40"
		aria-label="Decrease quantity"
		disabled={disabled || value <= min}
		onclick={() => set(value - 1)}
	>
		&minus;
	</button>
	<input
		type="number"
		class="w-14 [appearance:textfield] border-0 bg-transparent p-0 text-center text-sm focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
		aria-label={label}
		{min}
		{max}
		{disabled}
		{value}
		oninput={handleInput}
	/>
	<button
		type="button"
		class="px-3 py-1 text-lg leading-none text-neutral-700 disabled:opacity-40"
		aria-label="Increase quantity"
		disabled={disabled || value >= max}
		onclick={() => set(value + 1)}
	>
		+
	</button>
</div>
