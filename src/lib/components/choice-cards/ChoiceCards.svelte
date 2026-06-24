<!--
@component ChoiceCards

A single-select group of choice cards: each option is a card carrying an icon badge,
a title, a one-line description, and a check indicator on the active card. Behaves like
a group of radio buttons — exactly one value is selected at a time and `value` reflects it.

Supports any number of choices. By default the cards flow in a responsive grid that wraps
(`auto-fit`); pass `columns` for a fixed column count, or override the layout entirely with
`containerClass`. Exposes `radiogroup` semantics with keyboard support (Arrow / Home / End)
and roving `tabindex`. The label is rendered as a `<p>` and wired to the group via
`aria-labelledby`. When `name` is set, a hidden input mirrors `value` for form submission.

## Props

- `id?: string` — Links the label and generates the error/hidden-field ids. Defaults to `name`; one of the two must be provided.
- `name?: string` — Form field name; defaults to `id`. When provided, a hidden input carries `value`.
- `labelText?: string` — Label text rendered above the cards in a `<p>`.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `value?: string | number` — Bindable selected value.
- `options: ChoiceCardOption[]` — Cards to render (see type below).
- `size?: 'sm' | 'md' | 'lg'` — Padding, icon, and text size. Default: `'md'`.
- `columns?: number` — Fixed number of equal columns. Omit for a responsive auto-fit grid.
- `showCheck?: boolean` — Show the check indicator on the active card. Default: `true`.
- `checkIcon?: string` — Iconify class for the check indicator. Default: `'icon-[ion--checkmark]'`.
- `disabled?: boolean` — Disables the whole group.
- `error?: string` — Error message shown below; also sets `aria-invalid`/`aria-describedby`.
- `onchange?: (value: string | number) => void` — Called with the newly selected value.
- `rootClass?: ClassNameValue` — Extra classes on the outer wrapper.
- `labelClass?: ClassNameValue` — Extra classes on the `<p>` label.
- `containerClass?: ClassNameValue` — Extra classes on the grid (`radiogroup`).
- `cardClass?: ClassNameValue` — Extra classes on **every** card (both states).
- `selectedClass?: ClassNameValue` — Extra classes on the active card only; overrides the built-in selected styling.
- `unselectedClass?: ClassNameValue` — Extra classes on inactive cards only.
- `iconWrapperClass?: ClassNameValue` — Extra classes on the icon badge.
- `iconClass?: ClassNameValue` — Extra classes on every card icon (merged before each option's `iconClass`).
- `titleClass?: ClassNameValue` — Extra classes on the card title.
- `descriptionClass?: ClassNameValue` — Extra classes on the card description.
- `checkClass?: ClassNameValue` — Extra classes on the check indicator.
- `errorClass?: ClassNameValue` — Extra classes on the error message.

## ChoiceCardOption type

```ts
type ChoiceCardOption = {
  value: string | number;     // selected value
  title: string;              // card heading
  description?: string;       // one-line explanation
  icon?: string;              // Iconify class string, e.g. 'icon-[ion--flash]'
  iconClass?: ClassNameValue; // extra classes for this card's icon
  disabled?: boolean;         // disables this individual card
};
```

## Example

```svelte
<script>
  import { ChoiceCards } from '$lib/components/choice-cards';
  let mode = $state('automatic');
</script>

<ChoiceCards
  id="discount-mode"
  labelText="How the discount applies"
  bind:value={mode}
  options={[
    { value: 'automatic', title: 'Automatic', description: 'Applies on its own when the order qualifies.', icon: 'icon-[ion--flash]' },
    { value: 'coupon', title: 'Coupon code', description: 'Only applies when a matching code is entered.', icon: 'icon-[ion--pricetag]' },
  ]}
/>
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { ClassNameValue } from 'tailwind-merge';

	export type ChoiceCardsSize = 'sm' | 'md' | 'lg';

	export type ChoiceCardOption = {
		value: string | number;
		title: string;
		description?: string;
		icon?: string;
		iconClass?: ClassNameValue;
		disabled?: boolean;
	};

	export type ChoiceCardsProps = {
		id?: string;
		name?: string;
		labelText?: string;
		label?: Snippet;
		value?: string | number;
		options: ChoiceCardOption[];
		size?: ChoiceCardsSize;
		columns?: number;
		showCheck?: boolean;
		checkIcon?: string;
		disabled?: boolean;
		error?: string;
		onchange?: (value: string | number) => void;
		rootClass?: ClassNameValue;
		labelClass?: ClassNameValue;
		containerClass?: ClassNameValue;
		cardClass?: ClassNameValue;
		selectedClass?: ClassNameValue;
		unselectedClass?: ClassNameValue;
		iconWrapperClass?: ClassNameValue;
		iconClass?: ClassNameValue;
		titleClass?: ClassNameValue;
		descriptionClass?: ClassNameValue;
		checkClass?: ClassNameValue;
		errorClass?: ClassNameValue;
		'aria-label'?: string;
	};

	type SizeTokens = {
		card: string;
		badge: string;
		icon: string;
		title: string;
		description: string;
	};

	const sizeMap: Record<ChoiceCardsSize, SizeTokens> = {
		sm: {
			card: 'p-3 gap-2',
			badge: 'size-8',
			icon: 'size-4',
			title: 'text-sm',
			description: 'text-xs'
		},
		md: {
			card: 'p-4 gap-3',
			badge: 'size-10',
			icon: 'size-5',
			title: 'text-base',
			description: 'text-sm'
		},
		lg: {
			card: 'p-5 gap-4',
			badge: 'size-12',
			icon: 'size-6',
			title: 'text-lg',
			description: 'text-sm'
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
		value = $bindable(),
		options,
		size = 'md',
		columns,
		showCheck = true,
		checkIcon = 'icon-[ion--checkmark]',
		disabled = false,
		error,
		onchange,
		rootClass,
		labelClass,
		containerClass,
		cardClass,
		selectedClass,
		unselectedClass,
		iconWrapperClass,
		iconClass,
		titleClass,
		descriptionClass,
		checkClass,
		errorClass,
		'aria-label': ariaLabel
	}: ChoiceCardsProps = $props();

	const effectiveId = id ?? name;

	if (import.meta.env.DEV && !effectiveId) {
		console.error('[ChoiceCards] Either `id` or `name` must be provided.');
	}

	let buttons = $state<HTMLButtonElement[]>([]);

	const tokens = $derived(sizeMap[size]);
	const selectedExists = $derived(options.some((o) => o.value === value && !o.disabled));
	const firstEnabledValue = $derived(options.find((o) => !o.disabled)?.value);

	// A fixed column count wins via inline style; otherwise the responsive auto-fit
	// grid class on the container takes over so any number of cards wraps cleanly.
	const gridStyle = $derived(
		columns ? `grid-template-columns: repeat(${columns}, minmax(0, 1fr));` : undefined
	);

	// Roving tabindex: the selected card is tabbable; if nothing is selected,
	// the first enabled card takes the tab stop so the group is reachable.
	function isTabbable(option: ChoiceCardOption): boolean {
		if (option.disabled) return false;
		return selectedExists ? option.value === value : option.value === firstEnabledValue;
	}

	function select(option: ChoiceCardOption) {
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
		let next: { option: ChoiceCardOption; index: number };
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
		style={gridStyle}
		class={twMerge(
			'grid [grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))] gap-4',
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
					'rounded-primary focus-visible:ring-primary-focus flex flex-col border-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
					tokens.card,
					selected
						? 'border-primary-input-accent bg-primary-50'
						: 'border-primary-card-border bg-white hover:border-neutral-400',
					isDisabled ? 'cursor-default opacity-60' : 'cursor-pointer',
					cardClass,
					selected ? selectedClass : unselectedClass
				)}
			>
				<div class="flex flex-row items-start justify-between gap-2">
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

					{#if showCheck && selected}
						<span
							class={twMerge(
								'bg-primary-input-accent flex size-6 shrink-0 items-center justify-center rounded-full text-white',
								checkClass
							)}
						>
							<Icon icon={checkIcon} class="size-4" />
						</span>
					{/if}
				</div>

				<div class="flex flex-col gap-1">
					<p class={twMerge('font-semibold text-neutral-900', tokens.title, titleClass)}>
						{option.title}
					</p>
					{#if option.description}
						<p class={twMerge('text-neutral-500', tokens.description, descriptionClass)}>
							{option.description}
						</p>
					{/if}
				</div>
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
