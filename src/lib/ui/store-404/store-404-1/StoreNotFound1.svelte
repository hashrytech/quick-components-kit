<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type StoreNotFound1Props = {
		title?: string;
		message?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		title = 'Store not found',
		// Deliberately neutral: an unknown host, an unpublished storefront, and
		// a detached custom domain must be indistinguishable to the public.
		message = "We couldn't find a store at this address.",
		...restProps
	}: StoreNotFound1Props = $props();
</script>

<main
	class={twMerge(
		'flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center',
		restProps.class
	)}
>
	<h1 class="text-3xl font-semibold text-neutral-900">{title}</h1>
	<p class="max-w-md text-sm text-neutral-600">{message}</p>
</main>
