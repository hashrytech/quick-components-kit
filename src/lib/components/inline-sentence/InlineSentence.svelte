<!--
@component InlineSentence

A setting rendered as editable prose: a sentence with one highlighted "gold word" that
the user taps to flip between choices. The gold word is a button styled as an inline pill
(optionally with an icon); tapping it advances to the next option and the surrounding prose
(prefix / suffix) updates to match. Behaves like a single-select — `value` reflects the
current choice.

The control reads the active option's `prefix`, `label`, and `suffix` so the whole sentence
can change per choice (not just the word). Keyboard accessible: focus the word and press
Enter / Space (or Arrow keys) to cycle. When `name` is set, a hidden input mirrors `value`.

## Props

- `id?: string` — Links the label and generates the hint/hidden-field ids. Defaults to `name`; one of the two must be provided.
- `name?: string` — Form field name; defaults to `id`. When provided, a hidden input carries `value`.
- `labelText?: string` — Label text rendered above the sentence in a `<p>`.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `value?: string | number` — Bindable selected value.
- `options: InlineSentenceOption[]` — Choices to cycle through (see type below).
- `prefix?: string` — Start text before the gold word, shared by all options. Overridden per choice by `option.prefix`.
- `suffix?: string` — End text after the gold word, shared by all options. Overridden per choice by `option.suffix`.
- `icon?: string` — Iconify class shown inside the gold word, shared by all options. Overridden per choice by `option.icon`.
- `hint?: string` — Helper line under the sentence. Default: `'tap the gold word to switch'`. Pass `''` to hide.
- `hintIcon?: string` — Iconify class shown before the hint. Omit to use the built-in raw-SVG pointer (no icon-set dependency).
- `size?: 'sm' | 'md' | 'lg'` — Sentence text size. Default: `'md'`.
- `disabled?: boolean` — Disables cycling.
- `error?: string` — Error message shown below; also sets `aria-invalid`/`aria-describedby`.
- `onchange?: (value: string | number) => void` — Called with the newly selected value.
- `rootClass?: ClassNameValue` — Extra classes on the outer wrapper.
- `labelClass?: ClassNameValue` — Extra classes on the `<p>` label.
- `sentenceClass?: ClassNameValue` — Extra classes on the sentence container.
- `wordClass?: ClassNameValue` — Extra classes on the gold word button.
- `iconClass?: ClassNameValue` — Extra classes on the word icon (merged before each option's `iconClass`).
- `hintClass?: ClassNameValue` — Extra classes on the hint line.
- `errorClass?: ClassNameValue` — Extra classes on the error message.

## InlineSentenceOption type

```ts
type InlineSentenceOption = {
  value: string | number;     // selected value
  label: string;              // text shown inside the gold word
  prefix?: string;            // prose before the gold word (falls back to the `prefix` prop)
  suffix?: string;            // prose after the gold word (falls back to the `suffix` prop)
  icon?: string;              // Iconify class inside the gold word (falls back to the `icon` prop)
  iconClass?: ClassNameValue; // extra classes for this choice's icon
  disabled?: boolean;         // skip this choice when cycling
};
```

## Example

```svelte
<script>
  import { InlineSentence } from '$lib/components/inline-sentence';
  let mode = $state('automatic');
</script>

<InlineSentence
  id="discount-mode"
  labelText="How the discount applies"
  bind:value={mode}
  options={[
    { value: 'automatic', label: 'automatic', prefix: 'This discount is', suffix: '— it applies on its own the moment an order qualifies.' },
    { value: 'coupon', label: 'a coupon code', prefix: 'This discount needs', suffix: '— it only applies when a matching code is entered.' },
  ]}
/>
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { ClassNameValue } from 'tailwind-merge';

	export type InlineSentenceSize = 'sm' | 'md' | 'lg';

	export type InlineSentenceOption = {
		value: string | number;
		label: string;
		prefix?: string;
		suffix?: string;
		icon?: string;
		iconClass?: ClassNameValue;
		disabled?: boolean;
	};

	export type InlineSentenceProps = {
		id?: string;
		name?: string;
		labelText?: string;
		label?: Snippet;
		value?: string | number;
		options: InlineSentenceOption[];
		prefix?: string;
		suffix?: string;
		icon?: string;
		hint?: string;
		hintIcon?: string;
		size?: InlineSentenceSize;
		disabled?: boolean;
		error?: string;
		onchange?: (value: string | number) => void;
		rootClass?: ClassNameValue;
		labelClass?: ClassNameValue;
		sentenceClass?: ClassNameValue;
		wordClass?: ClassNameValue;
		iconClass?: ClassNameValue;
		hintClass?: ClassNameValue;
		errorClass?: ClassNameValue;
		'aria-label'?: string;
	};

	const sizeMap: Record<InlineSentenceSize, string> = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg'
	};

	const iconSizeMap: Record<InlineSentenceSize, string> = {
		sm: 'size-4',
		md: 'size-4',
		lg: 'size-5'
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
		prefix,
		suffix,
		icon,
		hint = 'tap the gold word to switch',
		hintIcon,
		size = 'md',
		disabled = false,
		error,
		onchange,
		rootClass,
		labelClass,
		sentenceClass,
		wordClass,
		iconClass,
		hintClass,
		errorClass,
		'aria-label': ariaLabel
	}: InlineSentenceProps = $props();

	const effectiveId = id ?? name;

	if (import.meta.env.DEV && !effectiveId) {
		console.error('[InlineSentence] Either `id` or `name` must be provided.');
	}

	// Resolve the active option; fall back to the first option so the sentence always renders.
	const activeIndex = $derived(
		Math.max(
			0,
			options.findIndex((o) => o.value === value)
		)
	);
	const active = $derived(options[activeIndex] ?? options[0]);

	// Per-option values win; otherwise fall back to the component-level defaults so the
	// start/end text and icon can be set once for the whole control or per choice.
	const activePrefix = $derived(active?.prefix ?? prefix);
	const activeSuffix = $derived(active?.suffix ?? suffix);
	const activeIcon = $derived(active?.icon ?? icon);
	const activeIconClass = $derived(twMerge(iconSizeMap[size], iconClass, active?.iconClass));

	function cycle(direction: 1 | -1) {
		if (disabled || options.length === 0) return;
		const count = options.length;
		let next = activeIndex;
		// Step over disabled options, at most one full loop.
		for (let i = 0; i < count; i++) {
			next = (next + direction + count) % count;
			if (!options[next].disabled) break;
		}
		const option = options[next];
		if (!option || option.disabled || option.value === value) return;
		value = option.value;
		onchange?.(option.value);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (
			event.key === 'Enter' ||
			event.key === ' ' ||
			event.key === 'ArrowRight' ||
			event.key === 'ArrowDown'
		) {
			event.preventDefault();
			cycle(1);
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault();
			cycle(-1);
		}
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

	<div class={twMerge('rounded-primary bg-neutral-50 p-4', sentenceClass)}>
		<!-- Flex + gap-x keeps a consistent gap between prose and the gold word that
		     collapses cleanly at soft wraps (flex gaps never appear at a line edge). -->
		<p
			class={twMerge(
				'flex flex-wrap items-baseline gap-x-2 gap-y-1 leading-relaxed text-neutral-700',
				sizeMap[size]
			)}
		>
			{#if activePrefix}<span>{activePrefix}</span>{/if}
			<button
				type="button"
				{disabled}
				aria-label={ariaLabel ?? (labelText ? `${labelText}: ${active?.label}` : active?.label)}
				aria-describedby={effectiveId && hint ? `${effectiveId}-hint` : undefined}
				onclick={() => cycle(1)}
				onkeydown={handleKeydown}
				class={twMerge(
					'border-primary-input-accent text-primary-input-accent hover:bg-primary-100 focus-visible:ring-primary-focus bg-primary-50 inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 font-semibold transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-default disabled:opacity-60',
					!disabled && 'cursor-pointer',
					wordClass
				)}
			>
				{#if activeIcon}
					<Icon icon={activeIcon} class={activeIconClass} />
				{/if}
				{active?.label}
			</button>
			{#if activeSuffix}<span>{activeSuffix}</span>{/if}
		</p>

		{#if hint}
			<p
				id={effectiveId ? `${effectiveId}-hint` : undefined}
				class={twMerge('mt-2 flex items-center gap-1 text-xs text-neutral-400', hintClass)}
			>
				{#if hintIcon}
					<Icon icon={hintIcon} class="size-3.5" />
				{:else}
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
						class="size-3.5"
					>
						<path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
						<path d="m13 13 6 6" />
					</svg>
				{/if}
				{hint}
			</p>
		{/if}
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
