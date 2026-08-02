<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type ResumePayment1Props = {
		orderNumber: string;
		total: string;
		currency: string;
		/** Hidden while the operation is frozen in payment review. */
		canResume?: boolean;
		/** Hidden while a real charge is unresolved. */
		canStartOver?: boolean;
		busy?: boolean;
		reviewMessage?: string | null;
		onResume?: () => void;
		onStartOver?: () => void;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Button } from '$lib/components/button/index.js';
	import { Price1 } from '$lib/ui/price/price-1/index.js';
	import { Alert1 } from '$lib/ui/alerts/alert-1/index.js';

	let {
		orderNumber,
		total,
		currency,
		canResume = true,
		canStartOver = true,
		busy = false,
		reviewMessage = null,
		onResume,
		onStartOver,
		...restProps
	}: ResumePayment1Props = $props();
</script>

<div class={twMerge('mx-auto flex max-w-md flex-col gap-4 py-10 text-center', restProps.class)}>
	<h1 class="text-xl font-semibold text-neutral-900">You have an order waiting for payment</h1>
	<p class="text-sm text-neutral-600">Order #{orderNumber}</p>
	<Price1 amount={total} {currency} size="lg" class="mx-auto" />

	{#if reviewMessage}
		<!-- Payment review: neither resume nor start-over is offered, because
		     both could charge the shopper a second time. -->
		<Alert1 tone="warning" message={reviewMessage} />
	{/if}

	<div class="flex flex-col gap-2">
		{#if canResume}
			<Button class="justify-center py-2 text-sm text-white" loading={busy} onclick={onResume}>
				Return to payment
			</Button>
		{/if}
		{#if canStartOver}
			<button
				type="button"
				class="text-sm text-neutral-600 underline hover:text-neutral-900 disabled:opacity-50"
				disabled={busy}
				onclick={onStartOver}
			>
				Start over
			</button>
		{/if}
	</div>
</div>
