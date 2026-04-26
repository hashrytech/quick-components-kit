<!--
@component Select

A styled `<select>` dropdown with label, size variants, and error display.

## Props

- `id: string` — Required. Links the label and is used to generate the error element id.
- `name?: string` — Form field name; defaults to `id`.
- `labelText?: string` — Label text rendered adjacent to the select.
- `labelPosition?: 'left' | 'top' | 'right' | 'bottom'` — Layout direction. Default: `'right'`.
- `value?: string | number` — Bindable selected value.
- `options?: Option[] | Snippet` — Either an array of `{ value, key, disabled? }` objects rendered as `<option>` elements, or a Snippet rendered directly inside `<select>`.
- `size?: 'sm' | 'md' | 'lg'` — Height and text size. Default: `'md'`.
- `disabled?: boolean` — Disables the select.
- `error?: string` — Error message shown below; also applies red styling to the select.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `onchange?: (event: Event) => void` — Native change handler.
- `class?: ClassNameValue` — Extra classes on the `<select>` element.

- `rootClass?: ClassNameValue` - Extra classes on the outer wrapper.
- `fieldClass?: ClassNameValue` - Extra classes on the label/select layout wrapper.
- `labelClass?: ClassNameValue` - Extra classes on the `<label>` element.
- `errorClass?: ClassNameValue` - Extra classes on the error message.

## Example

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
		id: string;
		name?: string;
		labelText?: string;
		disabled?: boolean;
		value?: string | number;
		options?: Option[] | Snippet;
		size?: 'sm' | 'md' | 'lg';
		labelPosition?: 'left' | 'top' | 'right' | 'bottom';
		class?: ClassNameValue;
		rootClass?: ClassNameValue;
		fieldClass?: ClassNameValue;
		labelClass?: ClassNameValue;
		errorClass?: ClassNameValue;
		error?: string;
		label?: Snippet;
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
		onchange,
		...restProps
	}: SelectProps = $props();

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
			<label
				for={id}
				class={twMerge('text-primary-label-text ml-1 w-full text-sm font-medium', labelClass)}
				>{labelText}</label
			>
		{/if}

		<select
			{id}
			name={name ?? id}
			bind:value
			{disabled}
			{onchange}
			aria-describedby={error ? `${id}-error` : undefined}
			class={twMerge(
				'rounded-primary border-primary-input-border focus:border-primary-focus focus:ring-primary-focus border py-0 placeholder:opacity-50 disabled:border-neutral-300/30 disabled:bg-neutral-300/30',
				sizeMap[size],
				error ? 'border-red-300 bg-red-50' : '',
				restProps.class
			)}
		>
			{#if typeof options === 'function'}
				{@render options()}
			{:else if options}
				{#each options as option}
					<option value={option.value} disabled={option.disabled}>
						{option.key}
					</option>
				{/each}
			{/if}
		</select>
	</div>
	{#if error}
		<p
			id="{id}-error"
			class={twMerge('rounded-primary mt-0.5 bg-red-100/30 px-2 text-sm text-red-500', errorClass)}
		>
			{error}
		</p>
	{/if}
</div>
