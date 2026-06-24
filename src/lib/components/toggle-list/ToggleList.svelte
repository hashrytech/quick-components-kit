<!--
@component ToggleList

A multi-select list of rows, each carrying an optional icon, a title, an optional one-line
description, and a switch on the trailing edge. Behaves like a group of checkboxes — any
number of rows can be on and `value` reflects the selected values as an array.

The rows stack full-width and read top-to-bottom, so the control is mobile responsive by
default. The wrapper is `role="group"` wired to the label via `aria-labelledby`, and each row
is a `role="checkbox"` button (native Space / Enter toggles it). When `name` is set, a hidden
input is emitted per selected value.

## Props

- `id?: string` — Links the label and generates the error/hidden-field ids. Defaults to `name`; one of the two must be provided.
- `name?: string` — Form field name; defaults to `id`. When provided, one hidden input per selected value is emitted.
- `labelText?: string` — Label text rendered above the list in a `<p>`.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `value?: (string | number)[]` — Bindable array of selected values. Default: `[]`.
- `options: ToggleListOption[]` — Rows to render (see type below).
- `size?: 'sm' | 'md' | 'lg'` — Padding, icon, and text size. Default: `'md'`.
- `disabled?: boolean` — Disables the whole group.
- `error?: string` — Error message shown below; also sets `aria-invalid`/`aria-describedby`.
- `onchange?: (value: (string | number)[]) => void` — Called with the new selected-values array.
- `rootClass?: ClassNameValue` — Extra classes on the outer wrapper.
- `labelClass?: ClassNameValue` — Extra classes on the `<p>` label.
- `containerClass?: ClassNameValue` — Extra classes on the bordered list (`role="group"`).
- `rowClass?: ClassNameValue` — Extra classes on **every** row (both states).
- `selectedClass?: ClassNameValue` — Extra classes on selected rows only.
- `unselectedClass?: ClassNameValue` — Extra classes on unselected rows only.
- `iconWrapperClass?: ClassNameValue` — Extra classes on the icon badge.
- `iconClass?: ClassNameValue` — Extra classes on every row icon (merged before each option's `iconClass`).
- `titleClass?: ClassNameValue` — Extra classes on the row title.
- `descriptionClass?: ClassNameValue` — Extra classes on the row description.
- `switchClass?: ClassNameValue` — Extra classes on the switch track.
- `errorClass?: ClassNameValue` — Extra classes on the error message.

## ToggleListOption type

```ts
type ToggleListOption = {
  value: string | number;     // selected value
  title: string;              // row heading
  description?: string;       // one-line explanation
  icon?: string;              // Iconify class string, e.g. 'icon-[ion--bag-handle]'
  iconClass?: ClassNameValue; // extra classes for this row's icon
  disabled?: boolean;         // disables this individual row
};
```

## Example

```svelte
<script>
  import { ToggleList } from '$lib/components/toggle-list';
  let orderTypes = $state([]);
</script>

<ToggleList
  id="order-types"
  labelText="Order types"
  bind:value={orderTypes}
  options={[
    { value: 'pickup', title: 'Pickup', icon: 'icon-[ion--bag-handle-outline]' },
    { value: 'delivery', title: 'Delivery', icon: 'icon-[ion--bicycle-outline]' },
    { value: 'dining', title: 'Dining', icon: 'icon-[ion--restaurant-outline]' },
  ]}
/>
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { ClassNameValue } from 'tailwind-merge';

	export type ToggleListSize = 'sm' | 'md' | 'lg';

	export type ToggleListOption = {
		value: string | number;
		title: string;
		description?: string;
		icon?: string;
		iconClass?: ClassNameValue;
		disabled?: boolean;
	};

	export type ToggleListProps = {
		id?: string;
		name?: string;
		labelText?: string;
		label?: Snippet;
		value?: (string | number)[];
		options: ToggleListOption[];
		size?: ToggleListSize;
		disabled?: boolean;
		error?: string;
		onchange?: (value: (string | number)[]) => void;
		rootClass?: ClassNameValue;
		labelClass?: ClassNameValue;
		containerClass?: ClassNameValue;
		rowClass?: ClassNameValue;
		selectedClass?: ClassNameValue;
		unselectedClass?: ClassNameValue;
		iconWrapperClass?: ClassNameValue;
		iconClass?: ClassNameValue;
		titleClass?: ClassNameValue;
		descriptionClass?: ClassNameValue;
		switchClass?: ClassNameValue;
		errorClass?: ClassNameValue;
		'aria-label'?: string;
	};

	type SizeTokens = {
		row: string;
		badge: string;
		icon: string;
		title: string;
		description: string;
		track: string;
		knob: string;
		knobOn: string;
	};

	const sizeMap: Record<ToggleListSize, SizeTokens> = {
		sm: {
			row: 'gap-2.5 px-3 py-2',
			badge: 'size-8',
			icon: 'size-4',
			title: 'text-sm',
			description: 'text-xs',
			track: 'h-5 w-9',
			knob: 'size-4',
			knobOn: 'translate-x-4'
		},
		md: {
			row: 'gap-3 px-4 py-3',
			badge: 'size-9',
			icon: 'size-5',
			title: 'text-sm',
			description: 'text-xs',
			track: 'h-6 w-11',
			knob: 'size-5',
			knobOn: 'translate-x-5'
		},
		lg: {
			row: 'gap-3 px-5 py-3.5',
			badge: 'size-10',
			icon: 'size-6',
			title: 'text-base',
			description: 'text-sm',
			track: 'h-7 w-12',
			knob: 'size-6',
			knobOn: 'translate-x-5'
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
		disabled = false,
		error,
		onchange,
		rootClass,
		labelClass,
		containerClass,
		rowClass,
		selectedClass,
		unselectedClass,
		iconWrapperClass,
		iconClass,
		titleClass,
		descriptionClass,
		switchClass,
		errorClass,
		'aria-label': ariaLabel
	}: ToggleListProps = $props();

	const effectiveId = id ?? name;

	if (import.meta.env.DEV && !effectiveId) {
		console.error('[ToggleList] Either `id` or `name` must be provided.');
	}

	const tokens = $derived(sizeMap[size]);

	function isSelected(option: ToggleListOption): boolean {
		return (value ?? []).includes(option.value);
	}

	function toggle(option: ToggleListOption) {
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
			'rounded-primary border-primary-input-border divide-primary-table-border divide-y overflow-hidden border',
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
				disabled={isDisabled || undefined}
				onclick={() => toggle(option)}
				class={twMerge(
					'focus-visible:ring-primary-focus flex w-full items-center text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
					tokens.row,
					selected ? 'bg-primary-50/50' : 'bg-white hover:bg-neutral-50',
					isDisabled ? 'cursor-default opacity-60' : 'cursor-pointer',
					rowClass,
					selected ? selectedClass : unselectedClass
				)}
			>
				{#if option.icon}
					<span
						class={twMerge(
							'flex shrink-0 items-center justify-center rounded-lg',
							tokens.badge,
							selected
								? 'bg-primary-100 text-primary-input-accent'
								: 'bg-neutral-100 text-neutral-500',
							iconWrapperClass
						)}
					>
						<Icon icon={option.icon} class={twMerge(tokens.icon, iconClass, option.iconClass)} />
					</span>
				{/if}

				<span class="flex min-w-0 flex-1 flex-col">
					<span
						class={twMerge(
							'font-medium',
							tokens.title,
							selected ? 'text-neutral-900' : 'text-neutral-700',
							titleClass
						)}
					>
						{option.title}
					</span>
					{#if option.description}
						<span class={twMerge('text-neutral-500', tokens.description, descriptionClass)}>
							{option.description}
						</span>
					{/if}
				</span>

				<span
					class={twMerge(
						'relative shrink-0 rounded-full transition-colors',
						tokens.track,
						selected ? 'bg-primary-input-accent' : 'bg-neutral-200',
						switchClass
					)}
				>
					<span
						class={twMerge(
							'absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform',
							tokens.knob,
							selected && tokens.knobOn
						)}
					></span>
				</span>
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
