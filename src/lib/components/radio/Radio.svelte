<!--
@component Radio

A styled radio input with label and size variants. Use `bind:group` to link
multiple radios into a group — the selected value is reflected in the bound variable.

Native `<input type="radio">` attributes (except those listed in props) are forwarded via spread.

## Props

- `id?: string` — Links the label. Defaults to `name` if omitted; one of the two must be provided.
- `name?: string` — Groups radios for form submission; defaults to `id`.
- `labelText?: string` — Label text rendered next to the radio.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `labelPosition?: 'left' | 'right' | 'top' | 'bottom'` — Label placement. Default: `'right'`.
- `value?: unknown` — The value this radio represents.
- `group?: unknown` — Bindable. The currently selected value in the group.
- `size?: 'sm' | 'md' | 'lg'` — Radio circle size. Default: `'md'`.
- `disabled?: boolean` — Disables the input.
- `required?: boolean` — Marks the field as required.
- `error?: string` — Error message; sets `aria-describedby` automatically. (`aria-invalid` is not valid on the radio role — communicate error state at the group level.)
- `showErrorText?: boolean` — Whether to show the error text visually (set `false` for sr-only). Default: `true`.
- `labelClass?: ClassNameValue` — Extra classes on the label `<span>`.
- `containerClass?: ClassNameValue` — Extra classes on the wrapping `<label>`.
- `rootClass?: ClassNameValue` — Extra classes on the root `<div>`.
- `class?: ClassNameValue` — Extra classes on the `<input>` element.

## Example

```svelte
<script>
  import { Radio } from '$lib/components/radio';
  let selected = $state('a');
</script>

<Radio id="opt-a" labelText="Option A" value="a" bind:group={selected} />
<Radio id="opt-b" labelText="Option B" value="b" bind:group={selected} />
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { ClassNameValue } from 'tailwind-merge';

	export type RadioProps = Omit<HTMLInputAttributes, 'size' | 'type' | 'class' | 'id' | 'name' | 'disabled' | 'required' | 'value'> & {
		id?: string;
		name?: string;
		labelText?: string;
		label?: Snippet;
		value?: unknown;
		group?: unknown;
		disabled?: boolean;
		required?: boolean;
		labelPosition?: 'left' | 'right' | 'top' | 'bottom';
		size?: 'sm' | 'md' | 'lg';
		error?: string;
		showErrorText?: boolean;
		labelClass?: ClassNameValue;
		class?: ClassNameValue;
		containerClass?: ClassNameValue;
		rootClass?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		id,
		name,
		labelText = '',
		label,
		labelPosition = 'right',
		value,
		group = $bindable(),
		size = 'md',
		disabled = false,
		required = false,
		error,
		showErrorText = true,
		containerClass,
		labelClass,
		class: className,
		rootClass,
		'aria-describedby': ariaDescribedBy,
		...inputProps
	}: RadioProps = $props();

	const effectiveId = id ?? name;

	if (import.meta.env.DEV && !effectiveId) {
		console.error('[Radio] Either `id` or `name` must be provided.');
	}

	function mergeDescribedBy(): string | undefined {
		const ids = [ariaDescribedBy, error ? `${effectiveId}-error` : undefined].filter(
			(v): v is string => Boolean(v)
		);
		return ids.length > 0 ? ids.join(' ') : undefined;
	}

	const sizeMap = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6',
	};

	const directionClass = {
		left: 'flex-row',
		right: 'flex-row',
		top: 'flex-col',
		bottom: 'flex-col',
	};

	const alignmentClass = {
		left: 'items-center',
		right: 'items-center',
		top: 'items-start',
		bottom: 'items-start',
	};
</script>

<div class={twMerge('', rootClass)}>
	<label for={effectiveId} class={twMerge('flex gap-2 cursor-pointer select-none', directionClass[labelPosition], alignmentClass[labelPosition], containerClass)}>
		{#if labelPosition === 'left' || labelPosition === 'top'}
			{#if label}
				{@render label()}
			{:else if labelText}
				<span class={twMerge('text-sm', labelClass)}>{labelText}</span>
			{/if}
		{/if}
		<input
			{...inputProps}
			id={effectiveId}
			name={name ?? effectiveId}
			type="radio"
			{value}
			bind:group
			{disabled}
			{required}
			aria-describedby={mergeDescribedBy()}
			class={twMerge(
				'focus:ring-2 ring-primary-focus text-primary-input-accent accent-primary-input-accent cursor-pointer',
				group === value ? 'border-primary-input-accent' : 'border-primary-input-border',
				sizeMap[size],
				className
			)}
		/>
		{#if labelPosition === 'right' || labelPosition === 'bottom'}
			{#if label}
				{@render label()}
			{:else if labelText}
				<span class={twMerge('text-sm', labelClass)}>{labelText}</span>
			{/if}
		{/if}
	</label>
	{#if error}
		<p
			id={`${effectiveId}-error`}
			class={twMerge('mt-0.5 rounded-primary px-2 text-sm text-red-500', showErrorText ? 'bg-red-100/30' : 'sr-only')}
		>
			{error}
		</p>
	{/if}
</div>
