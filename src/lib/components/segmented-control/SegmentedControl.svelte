<!--
@component SegmentedControl

A single-select segmented control: a row of mutually-exclusive options shown in a
shared track, with the active option lifted as a highlighted "pill". Behaves like a
group of radio buttons — exactly one value is selected at a time and `value` reflects it.

Each segment can show an Iconify glyph alongside its label for faster scanning. The
control exposes `radiogroup` semantics with full keyboard support (Arrow / Home / End)
and roving `tabindex`. Because the segments are buttons (not an `<input>`), the label is
rendered as a `<p>` and wired to the group via `aria-labelledby`. When `name` is set, a
hidden input mirrors `value` so the control submits inside a native form.

## Props

- `id?: string` — Links the label and generates the error/hidden-field ids. Defaults to `name`; one of the two must be provided.
- `name?: string` — Form field name; defaults to `id`. When provided, a hidden input carries `value` for form submission.
- `labelText?: string` — Label text rendered above the control in a `<p>`.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `value?: string | number` — Bindable selected value.
- `options: SegmentOption[]` — Segments to render (see type below).
- `size?: 'sm' | 'md' | 'lg'` — Padding and text/icon size. Default: `'md'`.
- `variant?: 'pill' | 'solid'` — Visual style. `'pill'` (default) lifts the active option as a white pill on a grey track; `'solid'` fills the active option with the accent colour on a white track. Default: `'pill'`.
- `fullWidth?: boolean` — Stretch the track to fill its container and size segments equally. Default: `false`.
- `disabled?: boolean` — Disables the whole control.
- `error?: string` — Error message shown below; also sets `aria-invalid`/`aria-describedby`.
- `iconClass?: ClassNameValue` — Extra classes applied to every segment icon (merged before each option's own `iconClass`).
- `onchange?: (value: string | number) => void` — Called with the newly selected value.
- `rootClass?: ClassNameValue` — Extra classes on the outer wrapper.
- `containerClass?: ClassNameValue` — Extra classes on the track (`radiogroup`).
- `segmentClass?: ClassNameValue` — Extra classes on **every** segment `<button>` (both states).
- `selectedClass?: ClassNameValue` — Extra classes on the active segment only; overrides the built-in selected colours/weight. If you change the weight, set `--qck-seg-fw` to match (e.g. `segmentClass="[--qck-seg-fw:700]"`) to keep the no-shift guarantee.
- `unselectedClass?: ClassNameValue` — Extra classes on inactive segments only.
- `labelClass?: ClassNameValue` — Extra classes on the `<p>` label.
- `errorClass?: ClassNameValue` — Extra classes on the error message.

## SegmentOption type

```ts
type SegmentOption = {
  value: string | number;   // selected value
  key: string;              // display label
  icon?: string;            // Iconify class string, e.g. 'i-ph-lightning'
  iconClass?: ClassNameValue; // extra classes for this segment's icon
  disabled?: boolean;       // disables this individual segment
};
```

## Example

```svelte
<script>
  import { SegmentedControl } from '$lib/components/segmented-control';
  let mode = $state('automatic');
</script>

<SegmentedControl
  id="discount-mode"
  labelText="How the discount applies"
  bind:value={mode}
  options={[
    { value: 'automatic', key: 'Automatic', icon: 'i-ph-lightning' },
    { value: 'coupon', key: 'Coupon code', icon: 'i-ph-ticket' },
  ]}
/>
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { ClassNameValue } from 'tailwind-merge';

	export type SegmentedControlSize = 'sm' | 'md' | 'lg';
	export type SegmentedControlVariant = 'pill' | 'solid';

	export type SegmentOption = {
		value: string | number;
		key: string;
		icon?: string;
		iconClass?: ClassNameValue;
		disabled?: boolean;
	};

	export type SegmentedControlProps = {
		id?: string;
		name?: string;
		labelText?: string;
		label?: Snippet;
		value?: string | number;
		options: SegmentOption[];
		size?: SegmentedControlSize;
		variant?: SegmentedControlVariant;
		fullWidth?: boolean;
		disabled?: boolean;
		error?: string;
		iconClass?: ClassNameValue;
		onchange?: (value: string | number) => void;
		rootClass?: ClassNameValue;
		containerClass?: ClassNameValue;
		segmentClass?: ClassNameValue;
		selectedClass?: ClassNameValue;
		unselectedClass?: ClassNameValue;
		labelClass?: ClassNameValue;
		errorClass?: ClassNameValue;
		'aria-label'?: string;
	};

	const sizeMap: Record<SegmentedControlSize, string> = {
		sm: 'px-3 py-1 text-sm gap-1.5',
		md: 'px-4 py-2 text-sm gap-2',
		lg: 'px-5 py-2.5 text-base gap-2'
	};

	const iconSizeMap: Record<SegmentedControlSize, string> = {
		sm: 'size-4',
		md: 'size-5',
		lg: 'size-5'
	};

	// Per-variant track (the `radiogroup` wrapper) styling.
	const trackVariantMap: Record<SegmentedControlVariant, string> = {
		pill: 'gap-1 bg-neutral-100 p-1',
		solid: 'gap-0 bg-white divide-x divide-primary-input-border'
	};

	// Per-variant segment shape.
	const segmentVariantMap: Record<SegmentedControlVariant, string> = {
		pill: 'rounded-secondary',
		solid: 'rounded-none'
	};

	function segmentStateClass(variant: SegmentedControlVariant, selected: boolean): string {
		if (variant === 'solid') {
			return selected
				? 'bg-primary-input-accent text-white font-semibold'
				: 'bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800';
		}
		return selected
			? 'text-primary-input-accent shadow-primary bg-white font-semibold'
			: 'bg-transparent text-neutral-600 hover:text-neutral-800';
	}
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Icon } from '$lib/components/icon/index.js';

	let {
		id,
		name,
		labelText = '',
		label,
		value = $bindable(),
		options,
		size = 'md',
		variant = 'pill',
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
	}: SegmentedControlProps = $props();

	const effectiveId = id ?? name;

	if (import.meta.env.DEV && !effectiveId) {
		console.error('[SegmentedControl] Either `id` or `name` must be provided.');
	}

	let buttons = $state<HTMLButtonElement[]>([]);

	const selectedExists = $derived(options.some((o) => o.value === value && !o.disabled));
	const firstEnabledValue = $derived(options.find((o) => !o.disabled)?.value);

	// Roving tabindex: the selected segment is tabbable; if nothing is selected,
	// the first enabled segment takes the tab stop so the group is reachable.
	function isTabbable(option: SegmentOption): boolean {
		if (option.disabled) return false;
		return selectedExists ? option.value === value : option.value === firstEnabledValue;
	}

	function select(option: SegmentOption) {
		if (disabled || option.disabled || option.value === value) return;
		value = option.value;
		onchange?.(option.value);
	}

	function handleKeydown(event: KeyboardEvent, currentIndex: number) {
		const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
		if (!keys.includes(event.key)) return;
		event.preventDefault();

		const enabled = options
			.map((option, index) => ({ option, index }))
			.filter((entry) => !entry.option.disabled);
		if (enabled.length === 0) return;

		const pos = enabled.findIndex((entry) => entry.index === currentIndex);
		let next: { option: SegmentOption; index: number };
		switch (event.key) {
			case 'Home':
				next = enabled[0];
				break;
			case 'End':
				next = enabled[enabled.length - 1];
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				next = enabled[(pos + 1) % enabled.length];
				break;
			default: // ArrowLeft / ArrowUp
				next = enabled[(pos - 1 + enabled.length) % enabled.length];
		}

		select(next.option);
		buttons[next.index]?.focus();
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
		role="radiogroup"
		aria-label={ariaLabel}
		aria-labelledby={!ariaLabel && labelText && effectiveId ? `${effectiveId}-label` : undefined}
		aria-invalid={error ? true : undefined}
		aria-describedby={error && effectiveId ? `${effectiveId}-error` : undefined}
		class={twMerge(
			'rounded-primary border-primary-input-border inline-flex max-w-full flex-row overflow-x-auto border',
			trackVariantMap[variant],
			fullWidth && 'flex w-full',
			containerClass
		)}
	>
		{#each options as option, index (option.value)}
			{@const selected = option.value === value}
			{@const isDisabled = disabled || option.disabled}
			<button
				bind:this={buttons[index]}
				type="button"
				role="radio"
				aria-checked={selected}
				disabled={isDisabled || undefined}
				tabindex={isTabbable(option) ? 0 : -1}
				onclick={() => select(option)}
				onkeydown={(event) => handleKeydown(event, index)}
				class={twMerge(
					'focus-visible:ring-primary-focus flex flex-row items-center justify-center whitespace-nowrap transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
					segmentVariantMap[variant],
					sizeMap[size],
					fullWidth ? 'flex-1' : 'shrink-0',
					segmentStateClass(variant, selected),
					isDisabled ? 'cursor-default opacity-50' : 'cursor-pointer',
					segmentClass,
					selected ? selectedClass : unselectedClass
				)}
			>
				{#if option.icon}
					<Icon
						icon={option.icon}
						class={twMerge(iconSizeMap[size], iconClass, option.iconClass)}
					/>
				{/if}
				<!-- `data-label` renders an invisible bold copy via ::after so the segment keeps
				     the selected (semibold) width whether or not it is selected — no layout shift. -->
				<span class="qck-segment-label" data-label={option.key}>{option.key}</span>
			</button>
		{/each}
	</div>

	{#if name}
		<input type="hidden" {name} value={value ?? ''} />
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

<style>
	/* Reserve the bold (semibold) width on every segment so toggling the selected
	   state — which switches the label to font-semibold — never reflows the control. */
	.qck-segment-label {
		display: inline-block;
	}

	.qck-segment-label::after {
		content: attr(data-label);
		display: block;
		height: 0;
		overflow: hidden;
		/* Width is reserved at the selected segment's font-weight. Defaults to 600
		   (font-semibold). If you override the selected weight via `selectedClass`,
		   set this var to match — e.g. segmentClass="[--qck-seg-fw:700]". */
		font-weight: var(--qck-seg-fw, 600);
		visibility: hidden;
		pointer-events: none;
	}
</style>
