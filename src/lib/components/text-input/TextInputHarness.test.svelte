<script lang="ts">
	import TextInput, { type TextInputProps } from './TextInput.svelte';

	let {
		value = $bindable(''),
		inputProps = {} as Partial<TextInputProps>,
		onCommittedInput
	}: {
		value?: string | number | null;
		inputProps?: Partial<TextInputProps>;
		onCommittedInput?: (value: string) => void;
	} = $props();

	let lastInputValue = $state('');

	function handleCommittedInput(nextValue: string): void {
		lastInputValue = nextValue;
		onCommittedInput?.(nextValue);
	}
</script>

<TextInput bind:value id="harness-input" {...inputProps} onInput={handleCommittedInput} />

<div data-testid="bound-value">{value === null || value === undefined ? '' : String(value)}</div>
<div data-testid="last-input">{lastInputValue}</div>
