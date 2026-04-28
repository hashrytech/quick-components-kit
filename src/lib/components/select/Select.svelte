<!--
@component Select

A styled `<select>` dropdown with label, size variants, and error display.
Supports both a pre-built `options` array and raw `<option>`/`<optgroup>` children for full flexibility.

## Props

- `id?: string` — Links the label and generates the error element id. Defaults to `name` if omitted; one of the two must be provided.
- `name?: string` — Form field name; defaults to `id`.
- `labelText?: string` — Label text rendered adjacent to the select.
- `labelPosition?: 'left' | 'top' | 'right' | 'bottom'` — Layout direction. Default: `'right'`.
- `value?: string | number` — Bindable selected value.
- `options?: Option[]` — Array of `{ value, key, disabled? }` objects rendered as `<option>` elements.
- `size?: 'sm' | 'md' | 'lg'` — Height and text size. Default: `'md'`.
- `disabled?: boolean` — Disables the select.
- `error?: string` — Error message shown below; also applies red styling to the select.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `children?: Snippet` — Raw `<option>` or `<optgroup>` elements rendered inside the `<select>` (use instead of or alongside `options`).
- `onchange?: (event: Event) => void` — Native change handler.
- `class?: ClassNameValue` — Extra classes on the `<select>` element.
- `rootClass?: ClassNameValue` — Extra classes on the outer wrapper.
- `fieldClass?: ClassNameValue` — Extra classes on the label/select layout wrapper.
- `labelClass?: ClassNameValue` — Extra classes on the `<label>` element.
- `errorClass?: ClassNameValue` — Extra classes on the error message.

## Option type

```ts
type Option = {
  value: string | number; // submitted form value
  key: string;            // display text
  disabled?: boolean;     // disables the individual option
};
```

## Examples

### Using the options array

```svelte
<script>
  import { Select } from '$lib/components/select';
  let role = $state('');
</script>

<Select
  id="role"
  labelText="Role"
  bind:value={role}
  options={[
    { value: 'admin', key: 'Admin' },
    { value: 'user', key: 'User' },
  ]}
/>
```

### Using raw children

```svelte
<Select id="country" labelText="Country" bind:value={country}>
  <option value="">— choose —</option>
  <optgroup label="Americas">
    <option value="us">United States</option>
    <option value="ca">Canada</option>
  </optgroup>
</Select>
```
-->

<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';
	import type { Snippet } from 'svelte';

	export type Option = {
		value: string | number;
		key: string;
		disabled?: boolean;
	};

	export type SelectProps = {
		id?: string;
		name?: string;
		labelText?: string;
		disabled?: boolean;
		value?: string | number;
		options?: Option[];
		size?: 'sm' | 'md' | 'lg';
		labelPosition?: 'left' | 'top' | 'right' | 'bottom';
		class?: ClassNameValue;
		rootClass?: ClassNameValue;
		fieldClass?: ClassNameValue;
		labelClass?: ClassNameValue;
		errorClass?: ClassNameValue;
		error?: string;
		label?: Snippet;
		children?: Snippet;
		onchange?: (event: Event) => void;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		id,
		name,
		label,
		labelText = '',
		labelPosition = 'right',
		value = $bindable(),
		options,
		size = 'md',
		disabled = $bindable(false),
		rootClass,
		fieldClass,
		labelClass,
		errorClass,
		error,
		children,
		onchange,
		...restProps
	}: SelectProps = $props();

	const effectiveId = id ?? name;

	if (import.meta.env.DEV && !effectiveId) {
		console.error('[Select] Either `id` or `name` must be provided.');
	}

	const sizeMap = {
		sm: 'text-sm h-[2.05rem]',
		md: 'text-base h-[2.375rem]',
		lg: 'text-lg h-[2.8rem]'
	};

	const directionClass = {
		top: 'flex-col gap-1',
		bottom: 'flex-col-reverse gap-1',
		left: 'flex-row items-center gap-2',
		right: 'flex-row-reverse items-center gap-2'
	};
</script>

<div class={twMerge('flex flex-col gap-1', rootClass)}>
	<div class={twMerge('flex', directionClass[labelPosition] ?? directionClass.top, fieldClass)}>
		{#if label}
		{@render label()}
		{:else if labelText}
		<label for={effectiveId} class={twMerge('text-primary-label-text ml-1 text-sm font-medium w-fit', labelClass)}>{labelText}</label>
		{/if}
		<select id={effectiveId} name={name ?? effectiveId} bind:value {disabled} {onchange}
			aria-invalid={!!error}
			aria-describedby={error && effectiveId ? `${effectiveId}-error` : undefined}
			class={twMerge('rounded-primary border-primary-input-border focus:border-primary-focus focus:ring-primary-focus border py-0 disabled:border-neutral-300/30 disabled:bg-neutral-300/30',
			sizeMap[size], error ? 'border-red-300 bg-red-50' : '',	restProps.class)}>
			{#if options}
			{#each options as option (option.value)}
			<option value={option.value} disabled={option.disabled}>
				{option.key}
			</option>
			{/each}
			{/if}
			{@render children?.()}
		</select>
	</div>
	{#if error}
	<p id="{effectiveId}-error" class={twMerge('rounded-primary mt-0.5 bg-red-100/30 px-2 text-sm text-red-500', errorClass)}>{error}</p>
	{/if}
</div>
