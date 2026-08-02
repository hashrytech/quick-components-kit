<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { ClassNameValue } from 'tailwind-merge';

	export type Alert1Tone = 'info' | 'success' | 'warning' | 'error';

	export type Alert1Props = {
		tone?: Alert1Tone;
		title?: string;
		message?: string;
		children?: Snippet;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let { tone = 'info', title, message, children, ...restProps }: Alert1Props = $props();

	const toneClass: Record<Alert1Tone, string> = {
		info: 'bg-blue-50 text-blue-900 border-blue-200',
		success: 'bg-green-50 text-green-900 border-green-200',
		warning: 'bg-amber-50 text-amber-900 border-amber-200',
		error: 'bg-red-50 text-red-900 border-red-200'
	};
</script>

<div
	class={twMerge('rounded-primary border px-4 py-3 text-sm', toneClass[tone], restProps.class)}
	role={tone === 'error' ? 'alert' : 'status'}
>
	{#if title}
		<p class="font-semibold">{title}</p>
	{/if}
	{#if message}
		<p class={title ? 'mt-0.5' : ''}>{message}</p>
	{/if}
	{@render children?.()}
</div>
