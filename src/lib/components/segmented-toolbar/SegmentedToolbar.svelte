<!--
@component SegmentedToolbar

A multi-select segmented toolbar: a connected bar of options where any number can be toggled
on. Each active segment fills with the accent colour. Behaves like a group of checkboxes —
`value` reflects the selected values as an array.

Mobile responsive by default: on narrow screens the bar wraps into a tidy connected grid
(segments grow to fill each row, label stacked under the icon); from the `sm` breakpoint up it
collapses to a single inline bar with the icon beside the label. The connected look is drawn
with a 1px gap over the border colour (rather than `divide-x`, which leaves stray borders on
wrapped rows). The wrapper is `role="group"` wired to the label via `aria-labelledby`, and each
segment is a `role="checkbox"` button (native Space / Enter toggles it). When `name` is set, a
hidden input is emitted per selected value.

## Props

- `id?: string` — Links the label and generates the error/hidden-field ids. Defaults to `name`; one of the two must be provided.
- `name?: string` — Form field name; defaults to `id`. When provided, one hidden input per selected value is emitted.
- `labelText?: string` — Label text rendered above the toolbar in a `<p>`.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `value?: (string | number)[]` — Bindable array of selected values. Default: `[]`.
- `options: SegmentedToolbarOption[]` — Segments to render (see type below).
- `size?: 'sm' | 'md' | 'lg'` — Padding and text/icon size. Default: `'md'`.
- `wrap?: boolean` — Allow the bar to wrap into a grid on narrow screens. Default: `true`. Set `false` to keep one inline row at all widths.
- `fullWidth?: boolean` — Stretch the track to fill its container and size every segment equally. Default: `false`.
- `disabled?: boolean` — Disables the whole toolbar.
- `error?: string` — Error message shown below; also sets `aria-invalid`/`aria-describedby`.
- `iconClass?: ClassNameValue` — Extra classes on every segment icon (merged before each option's `iconClass`).
- `onchange?: (value: (string | number)[]) => void` — Called with the new selected-values array.
- `rootClass?: ClassNameValue` — Extra classes on the outer wrapper.
- `containerClass?: ClassNameValue` — Extra classes on the track (`role="group"`).
- `segmentClass?: ClassNameValue` — Extra classes on **every** segment `<button>` (both states).
- `selectedClass?: ClassNameValue` — Extra classes on selected segments only; overrides the built-in selected colours.
- `unselectedClass?: ClassNameValue` — Extra classes on unselected segments only.
- `labelClass?: ClassNameValue` — Extra classes on the `<p>` label.
- `errorClass?: ClassNameValue` — Extra classes on the error message.

## SegmentedToolbarOption type

```ts
type SegmentedToolbarOption = {
  value: string | number;     // selected value
  label: string;              // display label
  icon?: string;              // Iconify class string for the glyph (from your installed icon set)
  iconClass?: ClassNameValue; // extra classes for this segment's icon
  disabled?: boolean;         // disables this individual segment
};
```

## Example

```svelte
<script>
  import { SegmentedToolbar } from '$lib/components/segmented-toolbar';
  let orderTypes = $state([]);
</script>

<SegmentedToolbar
  id="order-types"
  labelText="Order types"
  bind:value={orderTypes}
  options={[
    { value: 'pickup', label: 'Pickup' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'dining', label: 'Dining' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'retail', label: 'Retail' },
  ]}
/>
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { ClassNameValue } from 'tailwind-merge';

	export type SegmentedToolbarSize = 'sm' | 'md' | 'lg';

	export type SegmentedToolbarOption = {
		value: string | number;
		label: string;
		icon?: string;
		iconClass?: ClassNameValue;
		disabled?: boolean;
	};

	export type SegmentedToolbarProps = {
		id?: string;
		name?: string;
		labelText?: string;
		label?: Snippet;
		value?: (string | number)[];
		options: SegmentedToolbarOption[];
		size?: SegmentedToolbarSize;
		wrap?: boolean;
		fullWidth?: boolean;
		disabled?: boolean;
		error?: string;
		iconClass?: ClassNameValue;
		onchange?: (value: (string | number)[]) => void;
		rootClass?: ClassNameValue;
		containerClass?: ClassNameValue;
		segmentClass?: ClassNameValue;
		selectedClass?: ClassNameValue;
		unselectedClass?: ClassNameValue;
		labelClass?: ClassNameValue;
		errorClass?: ClassNameValue;
		'aria-label'?: string;
	};

	type SizeTokens = { segment: string; icon: string };

	// On mobile (wrapped) the segment stacks icon-over-label at a compact size; from `sm`
	// up it switches to an inline row at the full size.
	const sizeMap: Record<SegmentedToolbarSize, SizeTokens> = {
		sm: {
			segment: 'gap-0.5 px-2 py-1.5 text-xs sm:gap-1.5 sm:px-3 sm:py-1.5',
			icon: 'size-4'
		},
		md: {
			segment: 'gap-1 px-2 py-2.5 text-xs sm:gap-1.5 sm:px-4 sm:py-2 sm:text-sm',
			icon: 'size-5'
		},
		lg: {
			segment: 'gap-1 px-3 py-3 text-sm sm:gap-2 sm:px-5 sm:py-2.5 sm:text-base',
			icon: 'size-5'
		}
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Icon } from '$lib/components/icon/index.js';

	let {
		id,
		name,
		labelText = '',
		label,
		value = $bindable([]),
		options,
		size = 'md',
		wrap = true,
		fullWidth = false,
		disabled = false,
		error,
		iconClass,
		onchange,
		rootClass,
		containerClass,
		segmentClass,
		selectedClass,
		unselectedClass,
		labelClass,
		errorClass,
		'aria-label': ariaLabel
	}: SegmentedToolbarProps = $props();

	const effectiveId = id ?? name;

	if (import.meta.env.DEV && !effectiveId) {
		console.error('[SegmentedToolbar] Either `id` or `name` must be provided.');
	}

	const tokens = $derived(sizeMap[size]);

	// `fullWidth` stretches the track to fill its container and grows every segment equally;
	// otherwise the track hugs its content (and `wrap` still lets it wrap into a grid on mobile).
	const trackLayout = $derived(
		fullWidth
			? wrap
				? 'flex w-full flex-wrap sm:flex-nowrap'
				: 'flex w-full flex-nowrap'
			: wrap
				? 'flex w-full flex-wrap sm:inline-flex sm:w-auto sm:flex-nowrap'
				: 'inline-flex flex-nowrap'
	);
	const segmentLayout = $derived(
		fullWidth
			? wrap
				? 'grow basis-[28%] sm:basis-0'
				: 'grow basis-0'
			: wrap
				? 'grow basis-[28%] sm:grow-0 sm:basis-auto'
				: ''
	);

	function isSelected(option: SegmentedToolbarOption): boolean {
		return (value ?? []).includes(option.value);
	}

	function toggle(option: SegmentedToolbarOption) {
		if (disabled || option.disabled) return;
		const set = new Set(value ?? []);
		set.has(option.value) ? set.delete(option.value) : set.add(option.value);
		value = options.filter((o) => set.has(o.value)).map((o) => o.value);
		onchange?.(value);
	}
</script>

<div class={twMerge('flex flex-col gap-1', rootClass)}>
	{#if label}
		{@render label()}
	{:else if labelText}
		<p
			id={effectiveId ? `${effectiveId}-label` : undefined}
			class={twMerge('text-primary-label-text ml-1 w-fit text-sm font-medium', labelClass)}
		>
			{labelText}
		</p>
	{/if}

	<div
		role="group"
		aria-label={ariaLabel}
		aria-labelledby={!ariaLabel && labelText && effectiveId ? `${effectiveId}-label` : undefined}
		aria-describedby={error && effectiveId ? `${effectiveId}-error` : undefined}
		class={twMerge(
			'rounded-primary border-primary-input-border bg-primary-input-border gap-px overflow-hidden border',
			trackLayout,
			containerClass
		)}
	>
		{#each options as option (option.value)}
			{@const selected = isSelected(option)}
			{@const isDisabled = disabled || option.disabled}
			<button
				type="button"
				role="checkbox"
				aria-checked={selected}
				aria-label={option.label}
				disabled={isDisabled || undefined}
				onclick={() => toggle(option)}
				class={twMerge(
					'focus-visible:ring-primary-focus flex flex-col items-center justify-center font-medium transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:flex-row',
					segmentLayout,
					tokens.segment,
					selected
						? 'bg-primary-input-accent text-white'
						: 'bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800',
					isDisabled ? 'cursor-default opacity-50' : 'cursor-pointer',
					segmentClass,
					selected ? selectedClass : unselectedClass
				)}
			>
				{#if option.icon}
					<Icon icon={option.icon} class={twMerge(tokens.icon, iconClass, option.iconClass)} />
				{/if}
				<span>{option.label}</span>
			</button>
		{/each}
	</div>

	{#if name}
		{#each value ?? [] as v (v)}
			<input type="hidden" {name} value={v} />
		{/each}
	{/if}

	{#if error}
		<p
			id={effectiveId ? `${effectiveId}-error` : undefined}
			class={twMerge('rounded-primary mt-0.5 bg-red-100/30 px-2 text-sm text-red-500', errorClass)}
		>
			{error}
		</p>
	{/if}
</div>
