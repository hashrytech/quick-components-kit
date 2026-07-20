<script lang="ts">
	import MoneyInput, { type MoneyInputProps } from './MoneyInput.svelte';

	let {
		value = $bindable(''),
		inputProps = {}
	}: { value?: string | number | null; inputProps?: Partial<MoneyInputProps> } = $props();
</script>

<MoneyInput bind:value {...inputProps} />
<p data-testid="bound-value">{value}</p>
