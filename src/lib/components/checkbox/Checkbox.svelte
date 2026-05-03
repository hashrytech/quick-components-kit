<!--
@component Checkbox

A styled checkbox input with label, size variants, and group support.

Native `<input type="checkbox">` attributes (except those listed in props) are forwarded via spread.

## Props

- `id?: string` — Links the label. Defaults to `name` if omitted; one of the two must be provided.
- `name?: string` — Form field name; defaults to `id`.
- `labelText?: string` — Label text rendered next to the checkbox.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `labelPosition?: 'left' | 'right' | 'top' | 'bottom'` — Label placement. Default: `'right'`.
- `checked?: boolean` — Bindable checked state. Default: `false`.
- `value?: unknown` — Value submitted with the form when checked.
- `group?: unknown[]` — Bindable array for checkbox group binding.
- `size?: 'sm' | 'md' | 'lg'` — Checkbox size. Default: `'md'`.
- `disabled?: boolean` — Disables the input.
- `required?: boolean` — Marks the field as required.
- `error?: string` — Error message; sets `aria-invalid` and `aria-describedby` automatically.
- `showErrorText?: boolean` — Whether to show the error text visually (set `false` for sr-only). Default: `true`.
- `labelClass?: ClassNameValue` — Extra classes on the label `<span>`.
- `containerClass?: ClassNameValue` — Extra classes on the wrapping `<label>`.
- `rootClass?: ClassNameValue` — Extra classes on the root `<div>`.
- `class?: ClassNameValue` — Extra classes on the `<input>` element.

## Examples

### Basic
```svelte
<script>
  import { Checkbox } from '$lib/components/checkbox';
  let agreed = $state(false);
</script>

<Checkbox id="agree" labelText="I agree to the terms" bind:checked={agreed} />
```

### With validation error
```svelte
<Checkbox id="agree" labelText="I agree to the terms" bind:checked={agreed} error="You must agree to continue." />
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { ClassNameValue } from 'tailwind-merge';

	export type CheckBoxProps = Omit<HTMLInputAttributes, 'size' | 'type' | 'class' | 'id' | 'name' | 'disabled' | 'required'> & {
		id?: string;
		name?: string;
		labelText?: string;
		label?: Snippet;
		disabled?: boolean;
		required?: boolean;
		checked?: boolean;
		value?: unknown;
		group?: unknown[];
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
		checked = $bindable(false),
		value,
		group = $bindable(),
		size = 'md',
		disabled = false,
		required = false,
		error,
		showErrorText = true,
		labelClass,
		class: className,
		containerClass,
		rootClass,
		'aria-describedby': ariaDescribedBy,
		...inputProps
	}: CheckBoxProps = $props();

	const effectiveId = id ?? name;

	if (import.meta.env.DEV && !effectiveId) {
		console.error('[Checkbox] Either `id` or `name` must be provided.');
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
			id={effectiveId}
			{...inputProps}
			name={name ?? effectiveId}
			type="checkbox"
			bind:checked
			{group}
			{disabled}
			{required}
			{value}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={mergeDescribedBy()}
			class={twMerge(
				'rounded focus:ring-2 ring-primary-focus text-primary-input-accent accent-primary-input-accent cursor-pointer',
				checked === true ? 'border-primary-input-accent' : 'border-primary-input-border',
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
