<!--
@component TextArea

A multi-line text input with label, size variants, debounced input, and error display.

## Props

- `id?: string` — Links the label and generates the error element id. Defaults to `name` if omitted; one of the two must be provided.
- `name?: string` — Form field name; defaults to `id`.
- `value?: string | number | null` — Bindable value.
- `placeholder?: string` — Placeholder text.
- `labelText?: string` — Label text shown above (or adjacent to) the textarea.
- `labelPosition?: 'top' | 'left' | 'right' | 'bottom'` — Layout direction for label. Default: `'top'`.
- `size?: 'sm' | 'md' | 'lg'` — Text and padding size. Default: `'md'`.
- `disabled?: boolean` — Disables the textarea.
- `required?: boolean` — Marks the field as required.
- `error?: string` — Error message shown below the textarea; also sets `aria-invalid`.
- `debounceDelay?: number` — Delay in ms before `onInput` fires after typing. Default: `300`.
- `onInput?: (value: string | number) => void` — Called after debounce with the current value.
- `onchange?: (event: Event) => void` — Native change handler.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `class?: ClassNameValue` — Extra classes on the `<textarea>` element.
- `rootClass?: ClassNameValue` — Extra classes on the root wrapper.
- `labelRowClass?: ClassNameValue` — Extra classes on the label/control layout wrapper.

## Example

```svelte
<script>
  import { TextArea } from '$lib/components/text-area';
  let bio = $state('');
</script>

<TextArea id="bio" labelText="Bio" bind:value={bio} placeholder="Tell us about yourself" error={bio.length > 500 ? 'Too long' : ''} />
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { FullAutoFill } from 'svelte/elements';
	import type { ClassNameValue } from 'tailwind-merge';

	/**
	 * Predefined size classes for the TextArea input.
	 * - "sm": h-[2.05rem] text-sm placeholder:text-sm
	 * - "md": h-[2.375rem] text-sm placeholder:text-sm
	 * - "lg": h-[2.8rem] text-lg placeholder:text-lg
	 */
	export type TextAreaSize = 'sm' | 'md' | 'lg';
	export type TextInputType = 'text' | 'password' | 'number' | 'email' | 'tel' | 'url' | 'search';
	export type InputMode =
		| 'none'
		| 'text'
		| 'decimal'
		| 'numeric'
		| 'tel'
		| 'search'
		| 'email'
		| 'url';

	/**
	 * Props for the TextArea component.
	 *
	 * @prop {string} [id] - The unique ID of the input field.
	 * @prop {string} [name] - The name attribute for form submission.
	 * @prop {string} [value] - The bound value of the input.
	 * @prop {string} [placeholder] - Placeholder text.
	 * @prop {string} [labelText] - Optional label text.
	 * @prop {TextAreaSize} [size] - Size variant ("sm", "md", "lg") with predefined Tailwind styles.
	 *        - "sm": h-[2.05rem] text-sm placeholder:text-sm
	 *        - "md": h-[2.375rem] text-sm placeholder:text-sm
	 *        - "lg": h-[2.8rem] text-lg placeholder:text-lg
	 * @prop {() => void} [onchange] - Event handler for change events.
	 * @prop {() => void} [onmouseup] - Event handler for mouseup events.
	 * @prop {Snippet} [label] - Custom label snippet.
	 * @prop {ClassNameValue} [class] - Css classes for the textarea element.
	 * @prop {ClassNameValue} [rootClass] - Css classes for the root wrapper.
	 * @prop {ClassNameValue} [labelRowClass] - Css classes for the label/control layout wrapper.
	 */
	export type TextAreaProps = {
		id?: string;
		name?: string;
		value?: string | number | null;
		placeholder?: string;
		labelText?: string;
		labelPosition?: 'top' | 'left' | 'right' | 'bottom';
		size?: TextAreaSize;
		disabled?: boolean;
		required?: boolean;
		error?: string;
		labelClass?: ClassNameValue;
		rootClass?: ClassNameValue;
		labelRowClass?: ClassNameValue;
		autocomplete?: FullAutoFill | null;
		minlength?: number;
		maxlength?: number;
		debounceDelay?: number;
		onInput?: (value: string | number) => void;
		onchange?: (event: Event) => void;
		onmouseup?: () => void;
		label?: Snippet;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		id,
		name,
		value = $bindable(''),
		placeholder = '',
		labelText = '',
		labelClass,
		labelPosition = 'top',
		size = 'md',
		disabled = false,
		required = false,
		error,
		rootClass,
		labelRowClass,
		autocomplete,
		minlength,
		maxlength,
		debounceDelay = 300, //ms
		onchange,
		onInput,
		onmouseup,
		label,
		class: inputClass,
		...textareaProps
	}: TextAreaProps = $props();

	const effectiveId = id ?? name;

	if (import.meta.env.DEV && !effectiveId) {
		console.error('[TextArea] Either `id` or `name` must be provided.');
	}

	/**
	 * Predefined size classes for the TextArea input.
	 * - "sm": h-[2.05rem] text-sm placeholder:text-sm
	 * - "md": h-[2.375rem] text-sm placeholder:text-sm
	 * - "lg": h-[2.8rem] text-lg placeholder:text-lg
	 */
	let sizeStyle: Record<TextAreaSize, string> = {
		sm: 'text-sm placeholder:text-sm px-2.5',
		md: 'text-sm placeholder:text-sm px-2.5',
		lg: 'text-base placeholder:text-base px-3'
	};

	const directionClass = {
		top: 'flex-col gap-1',
		bottom: 'flex-col-reverse gap-1',
		left: 'flex-row items-center gap-2',
		right: 'flex-row-reverse items-center gap-2'
	};

	// --- Debounce logic ---
	let localValue: string = String(value ?? ''); // local for immediate typing
	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		localValue = (e.target as HTMLTextAreaElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			value = localValue; // sync to bound value after delay
			onInput?.(localValue); // call handler if provided
		}, debounceDelay);
	}
</script>

<div class={twMerge('', rootClass)}>
	<div
		class={twMerge(
			'rounded-primary flex',
			directionClass[labelPosition] ?? directionClass.top,
			labelRowClass
		)}
	>
		{#if label}{@render label()}{/if}
		{#if !label && labelText}<label
				for={effectiveId}
				class={twMerge('text-primary-label-text ml-1 text-sm font-medium', labelClass)}
				>{labelText}</label
			>{/if}

		<textarea
			{...textareaProps}
			{disabled}
			{required}
			id={effectiveId}
			name={name ?? effectiveId}
			{placeholder}
			{onmouseup}
			{onchange}
			bind:value
			{autocomplete}
			{minlength}
			{maxlength}
			oninput={handleInput}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${effectiveId}-error` : undefined}
			class={twMerge(
				'rounded-primary border-primary-input-border focus-within:border-primary-focus focus-within:ring-primary-focus h-full w-full border placeholder:text-neutral-600/50 focus-within:ring disabled:border-neutral-300/30 disabled:bg-neutral-300/30',
				sizeStyle[size],
				inputClass
			)}
		>
		</textarea>
	</div>

	{#if error}
		<p
			id={`${effectiveId}-error`}
			class="rounded-primary mt-0.5 bg-red-100/30 px-2 text-sm text-red-500"
		>
			{error}
		</p>
	{/if}
</div>
