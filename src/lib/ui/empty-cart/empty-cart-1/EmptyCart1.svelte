<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type EmptyCart1Props = {
		title?: string;
		message?: string;
		actionText?: string;
		actionHref?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		title = 'Your cart is empty',
		message = 'Browse the catalog and add something you like.',
		actionText = 'Continue shopping',
		actionHref = '/products',
		...restProps
	}: EmptyCart1Props = $props();
</script>

<div class={twMerge('flex flex-col items-center gap-3 py-16 text-center', restProps.class)}>
	<svg class="size-12 text-neutral-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path
			d="M6.00488 9H19.9433L20.4433 7H8.00488V5H21.7241C22.2764 5 22.7241 5.44772 22.7241 6C22.7241 6.08176 22.7141 6.16322 22.6942 6.24254L20.1942 16.2425C20.083 16.6877 19.683 17 19.2241 17H5.00488C4.4526 17 4.00488 16.5523 4.00488 16V4H2.00488V2H5.00488C5.55717 2 6.00488 2.44772 6.00488 3V9Z"
		/>
	</svg>
	<h2 class="text-lg font-semibold text-neutral-900">{title}</h2>
	<p class="max-w-sm text-sm text-neutral-600">{message}</p>
	<a
		href={actionHref}
		class="rounded-primary bg-primary-button hover:bg-primary-button-hover mt-2 inline-block px-5 py-2 text-sm font-medium text-white transition-colors"
	>
		{actionText}
	</a>
</div>
