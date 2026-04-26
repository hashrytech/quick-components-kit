<!--
@component TextInput

A fully-featured text input with label, size variants, icon slots, debounced input,
number validation, and accessible error display.

Native `<input>` attributes (except those listed in props) are forwarded via spread.

## Props

- `id: string` — Required. Links the label and generates the error element id.
- `type?: TextInputType` — Input type. Default: `'text'`.
- `name?: string` — Form field name; defaults to `id`.
- `value?: string | number | null` — Bindable value.
- `placeholder?: string` — Placeholder text.
- `labelText?: string` — Label text rendered above (or adjacent to) the input.
- `labelPosition?: 'top' | 'left' | 'right' | 'bottom'` — Layout direction. Default: `'top'`.
- `size?: 'sm' | 'md' | 'lg'` — Input height and text size. Default: `'md'`.
- `disabled?: boolean` — Disables the input.
- `required?: boolean` — Marks the field as required.
- `error?: string` — Error message; sets `aria-invalid` and `aria-describedby` automatically.
- `showErrorText?: boolean = true` — Whether to show the error text visually (set `false` for sr-only).
- `debounceDelay?: number = 300` — Delay in ms before `onInput` fires. Set `0` to disable.
- `forcePositiveNumber?: boolean = false` — For `type="number"`, clamps to positive values on blur.
- `maxDecimalPlaces?: number = -1` — Limits decimal places (`-1` = unlimited).
- `min? / max? / step?` — Forwarded min/max/step attributes.
- `onInput?: (value: string) => void` — Called after debounce with the committed value.
- `onchange?: (event: Event) => void` — Native change handler.
- `onmouseup?: (event: MouseEvent) => void` — Native mouseup handler.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `leftIcon?: string | Snippet` — Icon rendered inside the left edge of the input wrapper. Pass a CSS class string (e.g. Iconify) or a Snippet.
- `rightIcon?: string | Snippet` — Icon rendered inside the right edge of the input wrapper. Pass a CSS class string (e.g. Iconify) or a Snippet.
- `leftIconClass?: ClassNameValue` — Extra classes on the left icon (string icons only).
- `rightIconClass?: ClassNameValue` — Extra classes on the right icon (string icons only).
- `onLeftIconClick?: (event: MouseEvent) => void` — Click handler for the left icon wrapper.
- `onRightIconClick?: (event: MouseEvent) => void` — Click handler for the right icon wrapper.
- `class?: ClassNameValue` — Extra classes on the `<input>` element.

- `rootClass?: ClassNameValue` - Extra classes on the root wrapper.
- `labelRowClass?: ClassNameValue` - Extra classes on the label/control layout wrapper.
- `inputWrapperClass?: ClassNameValue` - Extra classes on the bordered input wrapper.

## Example

```svelte
<script>
  import { TextInput } from '$lib/components/text-input';
  let email = $state('');
</script>

<textinput id="email" type="email" labelText="Email" bind:value={email}
  error={email && !email.includes('@') ? 'Invalid email' : ''} />
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { FullAutoFill, HTMLInputAttributes } from 'svelte/elements';
	import type { ClassNameValue } from 'tailwind-merge';

	type ForwardedInputProps = Omit<
		HTMLInputAttributes,
		| 'class'
		| 'value'
		| 'type'
		| 'size'
		| 'name'
		| 'placeholder'
		| 'disabled'
		| 'required'
		| 'pattern'
		| 'autocomplete'
		| 'inputmode'
		| 'min'
		| 'max'
		| 'step'
		| 'oninput'
		| 'onchange'
		| 'onmouseup'
	>;

	/**
	 * Predefined size classes for the TextBox input.
	 * - "sm": h-[2.05rem] text-sm placeholder:text-sm
	 * - "md": h-[2.375rem] text-sm placeholder:text-sm
	 * - "lg": h-[2.8rem] text-lg placeholder:text-lg
	 */
	export type TextInputSize = 'sm' | 'md' | 'lg';
	export type TextInputType =
		| 'text'
		| 'password'
		| 'number'
		| 'email'
		| 'tel'
		| 'url'
		| 'search'
		| 'date'
		| 'datetime-local'
		| 'time'
		| 'month'
		| 'week'
		| 'color';
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
	 * Props for the TextBox component.
	 *
	 * @prop {string} id - The unique ID of the input field.
	 * @prop {string} [name] - The name attribute for form submission.
	 * @prop {string} [value] - The bound value of the input.
	 * @prop {string} [placeholder] - Placeholder text.
	 * @prop {string} [labelText] - Optional label text.
	 * @prop {TextInputSize} [size] - Size variant ("sm", "md", "lg") with predefined Tailwind styles.
	 *        - "sm": h-[2.05rem] text-sm placeholder:text-sm
	 *        - "md": h-[2.375rem] text-sm placeholder:text-sm
	 *        - "lg": h-[2.8rem] text-lg placeholder:text-lg
	 * @prop {() => void} [onchange] - Event handler for change events.
	 * @prop {() => void} [onmouseup] - Event handler for mouseup events.
	 * @prop {Snippet} [label] - Custom label snippet.
	 * @prop {Snippet} [class] - Css classes for the input element.
	 */
	export type TextInputProps = ForwardedInputProps & {
		id: string;
		name?: string;
		value?: string | number | null;
		type?: TextInputType;
		placeholder?: string;
		labelText?: string;
		labelPosition?: 'top' | 'left' | 'right' | 'bottom';
		size?: TextInputSize;
		disabled?: boolean;
		required?: boolean;
		pattern?: string;
		error?: string;
		showErrorText?: boolean;
		labelClass?: ClassNameValue;
		rootClass?: ClassNameValue;
		labelRowClass?: ClassNameValue;
		inputWrapperClass?: ClassNameValue;
		autocomplete?: FullAutoFill | null;
		inputmode?: InputMode;
		min?: number;
		max?: number;
		step?: number;
		debounceDelay?: number;
		forcePositiveNumber?: boolean;
		maxDecimalPlaces?: number;
		onInput?: (value: string) => void;
		onchange?: (event: Event) => void;
		onmouseup?: (event: MouseEvent) => void;
		label?: Snippet;
		leftIcon?: Snippet | string;
		rightIcon?: Snippet | string;
		leftIconClass?: ClassNameValue;
		rightIconClass?: ClassNameValue;
		onLeftIconClick?: (event: MouseEvent) => void;
		onRightIconClick?: (event: MouseEvent) => void;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { Icon } from '$lib/components/icon/index.js';

	let {
		id,
		type = 'text',
		name,
		value = $bindable(''),
		placeholder = '',
		labelText = '',
		labelClass,
		labelPosition = 'top',
		size = 'md',
		disabled = false,
		required = false,
		pattern,
		error,
		showErrorText = true,
		rootClass,
		labelRowClass,
		inputWrapperClass,
		autocomplete,
		inputmode,
		min,
		max,
		step,
		debounceDelay = 300,
		forcePositiveNumber = false,
		maxDecimalPlaces = -1,
		onInput,
		onchange,
		onblur,
		onmouseup,
		label,
		leftIcon,
		rightIcon,
		leftIconClass,
		rightIconClass,
		onLeftIconClick,
		onRightIconClick,
		class: inputClass,
		'aria-describedby': ariaDescribedBy,
		...inputProps
	}: TextInputProps = $props();

	const iconSizeClass: Record<TextInputSize, string> = {
		sm: 'size-4.5',
		md: 'size-5',
		lg: 'size-6.5'
	};

	const sizeStyle: Record<TextInputSize, string> = {
		sm: 'text-sm placeholder:text-sm px-2',
		md: 'text-sm placeholder:text-sm px-2',
		lg: 'text-base placeholder:text-base px-2.5'
	};

	const textBoxStyle: Record<TextInputSize, string> = {
		sm: 'h-[2.05rem]',
		md: 'h-[2.375rem]',
		lg: 'h-[2.8rem]'
	};

	const directionClass = {
		top: 'flex-col gap-1',
		bottom: 'flex-col-reverse gap-1',
		left: 'flex-row items-center gap-2',
		right: 'flex-row-reverse items-center gap-2'
	};

	let localValue = $state(toInputString(value));
	let lastCommittedValue = $state(toInputString(value));
	let hasPendingCommit = false;
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const externalValue = toInputString(value);
		lastCommittedValue = externalValue;

		if (!hasPendingCommit) {
			localValue = externalValue;
		}
	});

	onDestroy(() => {
		clearDebounceTimer();
		hasPendingCommit = false;
	});

	function toInputString(nextValue: string | number | null | undefined): string {
		return nextValue === null || nextValue === undefined ? '' : String(nextValue);
	}

	function isNumberField(): boolean {
		return type === 'number';
	}

	function usesPositiveNumberCommit(): boolean {
		return isNumberField() && forcePositiveNumber;
	}

	function clearDebounceTimer(): void {
		if (debounceTimer === undefined) {
			return;
		}

		clearTimeout(debounceTimer);
		debounceTimer = undefined;
	}

	function scheduleCommit(): void {
		clearDebounceTimer();
		hasPendingCommit = true;

		if (debounceDelay <= 0) {
			commitLocalValue();
			return;
		}

		debounceTimer = setTimeout(() => {
			debounceTimer = undefined;
			commitLocalValue();
		}, debounceDelay);
	}

	function mergeDescribedBy(): string | undefined {
		const describedByIds = [ariaDescribedBy, error ? `${id}-error` : undefined].filter(
			(value): value is string => Boolean(value)
		);

		return describedByIds.length > 0 ? describedByIds.join(' ') : undefined;
	}

	function getFallbackCommittedValue(): string {
		if (lastCommittedValue === '' || !isNumberField()) {
			return lastCommittedValue;
		}

		return isValidCommittedNumber(lastCommittedValue) ? lastCommittedValue : '';
	}

	function isValidCommittedNumber(candidate: string): boolean {
		const trimmed = candidate.trim();
		if (trimmed === '') {
			return true;
		}

		const limitedValue = applyDecimalLimit(trimmed);
		const numericValue = Number(limitedValue);
		if (!Number.isFinite(numericValue)) {
			return false;
		}

		if (usesPositiveNumberCommit() && numericValue <= 0) {
			return false;
		}

		if (max !== undefined && max !== null && numericValue > max) {
			return false;
		}

		if (min !== undefined && min !== null && numericValue < min) {
			return false;
		}

		return true;
	}

	function applyDecimalLimit(candidate: string): string {
		if (maxDecimalPlaces < 0 || !candidate.includes('.') || /e/i.test(candidate)) {
			return candidate;
		}

		const sign = candidate.startsWith('-') || candidate.startsWith('+') ? candidate[0] : '';
		const unsigned = sign ? candidate.slice(1) : candidate;
		const dotIndex = unsigned.indexOf('.');
		if (dotIndex === -1) {
			return candidate;
		}

		const whole = unsigned.slice(0, dotIndex);
		const fraction = unsigned.slice(dotIndex + 1);
		if (maxDecimalPlaces === 0) {
			if (whole !== '') {
				return `${sign}${whole}`;
			}

			return sign ? `${sign}0` : '0';
		}

		if (fraction.length <= maxDecimalPlaces) {
			return candidate;
		}

		return `${sign}${whole}.${fraction.slice(0, maxDecimalPlaces)}`;
	}

	function getPositiveLowerBound(): number | null {
		if (!usesPositiveNumberCommit()) {
			return null;
		}

		if (min !== undefined && min !== null && min > 0) {
			return min;
		}

		return null;
	}

	function resolveCommittedNumber(candidate: string): string {
		const trimmed = candidate.trim();
		if (trimmed === '') {
			return '';
		}

		const limitedValue = applyDecimalLimit(trimmed);
		const numericValue = Number(limitedValue);

		if (!Number.isFinite(numericValue)) {
			return getFallbackCommittedValue();
		}

		if (usesPositiveNumberCommit() && numericValue <= 0) {
			const positiveLowerBound = getPositiveLowerBound();
			return positiveLowerBound !== null ? String(positiveLowerBound) : getFallbackCommittedValue();
		}

		if (max !== undefined && max !== null && numericValue > max) {
			return String(max);
		}

		if (min !== undefined && min !== null && numericValue < min) {
			return String(min);
		}

		return limitedValue;
	}

	function resolveCommittedValue(candidate: string): string {
		if (!isNumberField()) {
			return candidate;
		}

		return resolveCommittedNumber(candidate);
	}

	function commitLocalValue(): void {
		const nextValue = resolveCommittedValue(localValue);
		const currentValue = toInputString(value);

		clearDebounceTimer();
		hasPendingCommit = false;
		localValue = nextValue;
		lastCommittedValue = nextValue;

		if (nextValue === currentValue) {
			return;
		}

		value = nextValue;
		onInput?.(nextValue);
	}

	function flushPendingCommit(): void {
		if (!hasPendingCommit && localValue === toInputString(value)) {
			return;
		}

		commitLocalValue();
	}

	function handleInput(event: Event): void {
		localValue = (event.currentTarget as HTMLInputElement).value;
		scheduleCommit();
	}

	function handleBlur(event: FocusEvent): void {
		flushPendingCommit();
		onblur?.(event as FocusEvent & { currentTarget: EventTarget & HTMLInputElement });
	}

	function handleChange(event: Event): void {
		flushPendingCommit();
		onchange?.(event);
	}
</script>

<div class={twMerge('', rootClass)}>
	<div class={twMerge('flex rounded-primary', directionClass[labelPosition] ?? directionClass.top, labelRowClass)}>
		{#if label}
			{@render label()}
		{/if}
		{#if !label && labelText}
			<label for={id} class={twMerge('ml-1 text-sm font-medium text-primary-label-text', labelClass)}
				>{labelText}</label
			>
		{/if}

		<div
			class={twMerge(
				'quick-text-input-control flex flex-row items-center overflow-hidden rounded-primary border border-primary-input-border focus-within:ring focus-within:border-primary-focus focus-within:ring-primary-focus has-[input:disabled]:bg-neutral-300/30 has-[input:disabled]:border-neutral-300/30',
				error ? 'border-red-300 bg-red-50' : '',
				textBoxStyle[size],
				inputWrapperClass
			)}
		>
			{#if leftIcon}
				{@const wrapClass = size === 'lg' ? 'flex items-center pl-2.5' : 'flex items-center pl-2'}
				{#if onLeftIconClick}
					<button type="button" class={twMerge('cursor-pointer appearance-none bg-transparent border-0 p-0 outline-none', wrapClass)} onclick={onLeftIconClick}>
						{#if typeof leftIcon === 'string'}
							<Icon icon={leftIcon} class={twMerge('text-neutral-400', iconSizeClass[size], leftIconClass)} />
						{:else}
							{@render leftIcon()}
						{/if}
					</button>
				{:else}
					<div class={wrapClass}>
						{#if typeof leftIcon === 'string'}
							<Icon icon={leftIcon} class={twMerge('text-neutral-400', iconSizeClass[size], leftIconClass)} />
						{:else}
							{@render leftIcon()}
						{/if}
					</div>
				{/if}
			{/if}

			<input
				{...inputProps}
				{disabled}
				{required}
				{type}
				{id}
				name={name ?? id}
				{placeholder}
				{pattern}
				{autocomplete}
				{inputmode}
				{step}
				{min}
				{max}
				value={localValue}
				aria-invalid={error ? 'true' : undefined}
				aria-describedby={mergeDescribedBy()}
				oninput={handleInput}
				onchange={handleChange}
				onblur={handleBlur}
				onmouseup={onmouseup}
				class={twMerge(
					'h-full w-full rounded-primary border-0 bg-transparent p-0 outline-none placeholder:text-neutral-600/50 focus:border-0 focus:ring-0 active:border-0',
					sizeStyle[size],
					inputClass
				)}
			/>

			{#if rightIcon}
				{@const wrapClass = size === 'lg' ? 'flex items-center pr-2.5' : 'flex items-center pr-2'}
				{#if onRightIconClick}
					<button type="button" class={twMerge('cursor-pointer appearance-none bg-transparent border-0 p-0 outline-none', wrapClass)} onclick={onRightIconClick}>
						{#if typeof rightIcon === 'string'}
							<Icon icon={rightIcon} class={twMerge('text-neutral-400', iconSizeClass[size], rightIconClass)} />
						{:else}
							{@render rightIcon()}
						{/if}
					</button>
				{:else}
					<div class={wrapClass}>
						{#if typeof rightIcon === 'string'}
							<Icon icon={rightIcon} class={twMerge('text-neutral-400', iconSizeClass[size], rightIconClass)} />
						{:else}
							{@render rightIcon()}
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>

	{#if error}
		<p
			id={`${id}-error`}
			class={twMerge(
				'mt-0.5 rounded-primary px-2 text-sm text-red-500',
				showErrorText ? 'bg-red-100/30' : 'sr-only'
			)}
		>
			{error}
		</p>
	{/if}
</div>

<style>
	.quick-text-input-control:has(input:-webkit-autofill),
	.quick-text-input-control:has(input:autofill) {
		background-color: rgb(232 240 254);
	}
</style>
