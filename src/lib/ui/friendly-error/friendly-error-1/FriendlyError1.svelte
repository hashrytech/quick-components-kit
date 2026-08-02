<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type FriendlyError1Props = {
		title?: string;
		message?: string;
		/** Optional retry affordance; omit for non-recoverable states. */
		onRetry?: () => void;
		retryText?: string;
		homeHref?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Button } from '$lib/components/button/index.js';

	let {
		title = 'Something went wrong',
		// The renderer maps every non-2xx to this page and never surfaces raw
		// API payloads to shoppers.
		message = "We couldn't complete that just now. Please try again in a moment.",
		onRetry,
		retryText = 'Try again',
		homeHref = '/',
		...restProps
	}: FriendlyError1Props = $props();
</script>

<div class={twMerge('flex flex-col items-center gap-3 py-16 text-center', restProps.class)}>
	<h1 class="text-xl font-semibold text-neutral-900">{title}</h1>
	<p class="max-w-md text-sm text-neutral-600">{message}</p>
	<div class="mt-2 flex items-center gap-3">
		{#if onRetry}
			<Button class="justify-center px-4 py-2 text-sm text-white" onclick={onRetry}>
				{retryText}
			</Button>
		{/if}
		<a
			href={homeHref}
			class="rounded-primary border-primary-input-border border px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
		>
			Back to store
		</a>
	</div>
</div>
