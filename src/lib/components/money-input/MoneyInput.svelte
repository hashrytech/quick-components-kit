<script lang="ts" module>
	import type { TextInputProps } from '../text-input/TextInput.svelte';

	/**
	 * Props for MoneyInput — a TextInput preset enforcing the 2dp money
	 * entry policy. `type`, `inputmode`, `maxDecimalPlaces`, and
	 * `forcePositiveNumber` are fixed by the preset.
	 */
	export type MoneyInputProps = Omit<
		TextInputProps,
		'type' | 'inputmode' | 'maxDecimalPlaces' | 'forcePositiveNumber'
	> & {
		/** Allow negative amounts (signed adjustments, refunds). Default false. */
		allowNegative?: boolean;
	};
</script>

<script lang="ts">
	import { Decimal } from 'decimal.js';
	import { TextInput } from '../text-input/index.js';

	let {
		value = $bindable(''),
		allowNegative = false,
		step = 0.01,
		min,
		onblur,
		...rest
	}: MoneyInputProps = $props();

	// min=0 (not forcePositiveNumber) so an entered 0 survives — free
	// items are legitimate; typed negatives clamp to the floor on commit.
	const effectiveMin = $derived(allowNegative ? min : (min ?? 0));

	// 2dp-on-entry policy: normalize whatever is committed at blur, so a
	// loaded 4dp value ("1250.0000") becomes "1250.00" the moment the
	// field is touched. Empty stays empty (required-ness is the caller's
	// concern); unparseable input is left to TextInput's own fallback.
	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }): void {
		const raw = value === null || value === undefined ? '' : String(value).trim();
		if (raw !== '') {
			try {
				value = new Decimal(raw).toFixed(2, Decimal.ROUND_HALF_UP);
			} catch {
				// Leave unparseable input as-is.
			}
		}
		onblur?.(event);
	}
</script>

<TextInput
	bind:value
	type="number"
	inputmode="decimal"
	{step}
	min={effectiveMin}
	maxDecimalPlaces={2}
	onblur={handleBlur}
	{...rest}
/>
