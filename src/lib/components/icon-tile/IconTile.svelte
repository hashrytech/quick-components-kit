<!--
@component IconTile

A multi-select group of icon tiles: each option is a tappable tile carrying an icon, a
label, and a check badge on the selected tiles. Behaves like a group of checkboxes — any
number of options can be selected and `value` reflects the selected values as an array.

The icon can be positioned relative to the label with `iconPosition`, so the same component
covers both common looks:

- `iconPosition="left"` + `iconBadge` → a horizontal "choice card" row (icon badge beside the label).
- `iconPosition="top"` (default) → a vertical tile (icon stacked above a centered label).

Tiles flow in a responsive auto-fit grid that wraps cleanly down to the smallest breakpoints,
so the control is mobile responsive by default. Pass `columns` for a fixed column count, or
override the grid with `containerClass`. Exposes `group` semantics: the wrapper is `role="group"`
wired to the label via `aria-labelledby`, and each tile is a `role="checkbox"` button (native
Space / Enter toggles it). When `name` is set, a hidden input is emitted per selected value.

## Props

- `id?: string` — Links the label and generates the error/hidden-field ids. Defaults to `name`; one of the two must be provided.
- `name?: string` — Form field name; defaults to `id`. When provided, one hidden input per selected value is emitted.
- `labelText?: string` — Label text rendered above the tiles in a `<p>`.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `value?: (string | number)[]` — Bindable array of selected values. Default: `[]`.
- `options: IconTileOption[]` — Tiles to render (see type below).
- `size?: 'sm' | 'md' | 'lg'` — Padding, icon, and text size. Default: `'md'`.
- `iconPosition?: 'top' | 'bottom' | 'left' | 'right'` — Where the icon sits relative to the label. Default: `'top'`.
- `iconBadge?: boolean` — Render the icon inside a rounded badge (the image-1 look). When `false`, the icon renders larger and bare (the image-2 look). Default: `true`.
- `columns?: number` — Fixed number of equal columns. Omit for a responsive auto-fit grid.
- `showCheck?: boolean` — Show the check badge on selected tiles. Default: `true`.
- `selectedIcon?: string` — Iconify class for the selected (check) badge icon. Omit to use the built-in raw-SVG checkmark (no icon-set dependency).
- `selectedIconClass?: ClassNameValue` — Extra classes on the selected-badge icon.
- `disabled?: boolean` — Disables the whole group.
- `error?: string` — Error message shown below; also sets `aria-invalid`/`aria-describedby`.
- `onchange?: (value: (string | number)[]) => void` — Called with the new selected-values array.
- `rootClass?: ClassNameValue` — Extra classes on the outer wrapper.
- `labelClass?: ClassNameValue` — Extra classes on the `<p>` label.
- `containerClass?: ClassNameValue` — Extra classes on the grid (`role="group"`).
- `tileClass?: ClassNameValue` — Extra classes on **every** tile (both states).
- `selectedClass?: ClassNameValue` — Extra classes on selected tiles only; overrides the built-in selected styling.
- `unselectedClass?: ClassNameValue` — Extra classes on unselected tiles only.
- `iconWrapperClass?: ClassNameValue` — Extra classes on the icon badge (when `iconBadge`).
- `iconClass?: ClassNameValue` — Extra classes on every tile icon (merged before each option's `iconClass`).
- `tileLabelClass?: ClassNameValue` — Extra classes on each tile's label text.
- `checkClass?: ClassNameValue` — Extra classes on the check badge wrapper.
- `errorClass?: ClassNameValue` — Extra classes on the error message.

## IconTileOption type

```ts
type IconTileOption = {
  value: string | number;     // selected value
  label: string;              // tile label
  icon?: string;              // Iconify class string for the glyph (from your installed icon set)
  iconClass?: ClassNameValue; // extra classes for this tile's icon
  disabled?: boolean;         // disables this individual tile
};
```

## Example

```svelte
<script>
  import { IconTile } from '$lib/components/icon-tile';
  let orderTypes = $state([]);
</script>

<IconTile
  id="order-types"
  labelText="Order types"
  iconPosition="top"
  iconBadge={false}
  bind:value={orderTypes}
  options={[
    { value: 'pickup', label: 'Pickup' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'dining', label: 'Dining' },
  ]}
/>
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { ClassNameValue } from 'tailwind-merge';

	export type IconTileSize = 'sm' | 'md' | 'lg';
	export type IconTilePosition = 'top' | 'bottom' | 'left' | 'right';

	export type IconTileOption = {
		value: string | number;
		label: string;
		icon?: string;
		iconClass?: ClassNameValue;
		disabled?: boolean;
	};

	export type IconTileProps = {
		id?: string;
		name?: string;
		labelText?: string;
		label?: Snippet;
		value?: (string | number)[];
		options: IconTileOption[];
		size?: IconTileSize;
		iconPosition?: IconTilePosition;
		iconBadge?: boolean;
		columns?: number;
		showCheck?: boolean;
		selectedIcon?: string;
		selectedIconClass?: ClassNameValue;
		disabled?: boolean;
		error?: string;
		onchange?: (value: (string | number)[]) => void;
		rootClass?: ClassNameValue;
		labelClass?: ClassNameValue;
		containerClass?: ClassNameValue;
		tileClass?: ClassNameValue;
		selectedClass?: ClassNameValue;
		unselectedClass?: ClassNameValue;
		iconWrapperClass?: ClassNameValue;
		iconClass?: ClassNameValue;
		tileLabelClass?: ClassNameValue;
		checkClass?: ClassNameValue;
		errorClass?: ClassNameValue;
		'aria-label'?: string;
	};

	type SizeTokens = {
		tile: string;
		badge: string;
		icon: string;
		iconSolo: string;
		text: string;
		check: string;
		checkIcon: string;
	};

	const sizeMap: Record<IconTileSize, SizeTokens> = {
		sm: {
			tile: 'p-2.5 gap-1.5',
			badge: 'size-8',
			icon: 'size-4',
			iconSolo: 'size-6',
			text: 'text-xs',
			check: 'size-4',
			checkIcon: 'size-2.5'
		},
		md: {
			tile: 'p-4 gap-2.5',
			badge: 'size-10',
			icon: 'size-5',
			iconSolo: 'size-7',
			text: 'text-sm',
			check: 'size-5',
			checkIcon: 'size-3'
		},
		lg: {
			tile: 'p-5 gap-3',
			badge: 'size-12',
			icon: 'size-6',
			iconSolo: 'size-8',
			text: 'text-base',
			check: 'size-6',
			checkIcon: 'size-3.5'
		}
	};

	// Flex layout per icon position. Horizontal positions left-align the label beside
	// the icon (image-1 look); vertical positions center it under/over the icon (image-2 look).
	const layoutMap: Record<IconTilePosition, string> = {
		top: 'flex-col items-center justify-center text-center',
		bottom: 'flex-col-reverse items-center justify-center text-center',
		left: 'flex-row items-center text-left',
		right: 'flex-row-reverse items-center text-left'
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
		iconPosition = 'top',
		iconBadge = true,
		columns,
		showCheck = true,
		selectedIcon,
		selectedIconClass,
		disabled = false,
		error,
		onchange,
		rootClass,
		labelClass,
		containerClass,
		tileClass,
		selectedClass,
		unselectedClass,
		iconWrapperClass,
		iconClass,
		tileLabelClass,
		checkClass,
		errorClass,
		'aria-label': ariaLabel
	}: IconTileProps = $props();

	const effectiveId = id ?? name;

	if (import.meta.env.DEV && !effectiveId) {
		console.error('[IconTile] Either `id` or `name` must be provided.');
	}

	const tokens = $derived(sizeMap[size]);
	const isHorizontal = $derived(iconPosition === 'left' || iconPosition === 'right');

	// A fixed column count wins; otherwise an auto-fit grid wraps any number of tiles
	// cleanly — horizontal tiles need a wider minimum than the compact vertical ones.
	const gridStyle = $derived(
		columns
			? `grid-template-columns: repeat(${columns}, minmax(0, 1fr));`
			: `grid-template-columns: repeat(auto-fit, minmax(${isHorizontal ? '11rem' : '7rem'}, 1fr));`
	);

	function isSelected(option: IconTileOption): boolean {
		return (value ?? []).includes(option.value);
	}

	function toggle(option: IconTileOption) {
		if (disabled || option.disabled) return;
		const set = new Set(value ?? []);
		set.has(option.value) ? set.delete(option.value) : set.add(option.value);
		// Rebuild from `options` order so the bound array stays stable and de-duplicated.
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
		style={gridStyle}
		class={twMerge('grid gap-2.5', containerClass)}
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
					'rounded-primary focus-visible:ring-primary-focus relative flex border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
					tokens.tile,
					layoutMap[iconPosition],
					selected
						? 'border-primary-400 bg-primary-50'
						: 'border-primary-card-border bg-white hover:border-neutral-400',
					isDisabled ? 'cursor-default opacity-60' : 'cursor-pointer',
					tileClass,
					selected ? selectedClass : unselectedClass
				)}
			>
				{#if showCheck && selected}
					<span
						class={twMerge(
							'bg-primary-input-accent absolute top-2 right-2 flex shrink-0 items-center justify-center rounded-full text-white',
							tokens.check,
							checkClass
						)}
					>
						{#if selectedIcon}
							<Icon icon={selectedIcon} class={twMerge(tokens.checkIcon, selectedIconClass)} />
						{:else}
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
								class={twMerge(tokens.checkIcon, selectedIconClass)}
							>
								<path d="M5 13l4 4L19 7" />
							</svg>
						{/if}
					</span>
				{/if}

				{#if option.icon}
					{#if iconBadge}
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
					{:else}
						<Icon
							icon={option.icon}
							class={twMerge(
								tokens.iconSolo,
								selected ? 'text-primary-input-accent' : 'text-neutral-400',
								iconClass,
								option.iconClass
							)}
						/>
					{/if}
				{/if}

				<span
					class={twMerge(
						'font-semibold',
						tokens.text,
						selected ? 'text-neutral-900' : 'text-neutral-700',
						tileLabelClass
					)}
				>
					{option.label}
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
