<script lang="ts">
	import TextArea from './TextArea.svelte';
	import type { TextAreaProps } from './TextArea.svelte';

	let {
		value = $bindable(''),
		inputProps = {}
	}: { value?: string | number | null; inputProps?: Partial<TextAreaProps> } = $props();
</script>

<TextArea bind:value {...inputProps} />
<p data-testid="bound-value">{value === null ? '<null>' : String(value)}</p>
