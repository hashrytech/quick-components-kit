<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	/** Operation states the shopper-facing confirmation can be in. */
	export type CheckoutOperationState =
		| 'pending'
		| 'order_created'
		| 'payment_requested'
		| 'redirect_issued'
		| 'paid'
		| 'expired'
		| 'payment_review'
		| 'failed';

	export type OrderStatusPayload = {
		order_number: string;
		operation_state: CheckoutOperationState;
		payment_status: string;
		fulfilment_groups: {
			status: string | null;
			stage_key: string | null;
			stage_name: string | null;
		}[];
		currency: string;
		total: string;
		confirmation_expires_at?: string | null;
	};

	export type OrderConfirmation1Props = {
		status: OrderStatusPayload;
		/** True while the renderer is polling a non-terminal result. */
		polling?: boolean;
		continueHref?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Price1 } from '$lib/ui/price/price-1/index.js';
	import { Alert1 } from '$lib/ui/alerts/alert-1/index.js';
	import { Spinner1 } from '$lib/ui/spinner/spinner-1/index.js';

	let {
		status,
		polling = false,
		continueHref = '/products',
		...restProps
	}: OrderConfirmation1Props = $props();

	const isPaid = $derived(status.operation_state === 'paid');
	const isReview = $derived(status.operation_state === 'payment_review');
	const isExpired = $derived(status.operation_state === 'expired');
	// Anything else is still in flight — the gateway callback can arrive after
	// the shopper's browser returns.
	const isProcessing = $derived(!isPaid && !isReview && !isExpired);
</script>

<div class={twMerge('mx-auto flex max-w-xl flex-col gap-4 py-10', restProps.class)}>
	{#if isPaid}
		<div class="flex flex-col items-center gap-2 text-center">
			<svg
				class="size-12 text-green-600"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7l7.07-7.071-1.414-1.414L11 12.172 7.879 9.05 6.464 10.464 11 15z"
				/>
			</svg>
			<h1 class="text-2xl font-semibold text-neutral-900">Thank you — your order is confirmed</h1>
			<p class="text-sm text-neutral-600">Order #{status.order_number}</p>
		</div>
	{:else if isReview}
		<!-- Verified money that could not be applied automatically. Never invite
		     another payment here: staff must resolve the real charge first. -->
		<Alert1
			tone="warning"
			title="Your payment is under review"
			message="We've received your payment and our team is confirming it. Please don't pay again — we'll be in touch shortly."
		/>
		<p class="text-center text-sm text-neutral-600">Order #{status.order_number}</p>
	{:else if isExpired}
		<Alert1
			tone="error"
			title="This checkout expired"
			message="The items were released back to the store. You can start a new order at any time."
		/>
	{:else if isProcessing}
		<div class="flex flex-col items-center gap-3 text-center">
			<Spinner1 size="lg" label="Confirming payment" />
			<h1 class="text-xl font-semibold text-neutral-900">Payment processing</h1>
			<p class="text-sm text-neutral-600">
				We're confirming your payment with the provider. This page updates automatically.
			</p>
		</div>
	{/if}

	{#if !isExpired}
		<div class="rounded-primary border-primary-card-border border bg-white p-4">
			<div class="flex items-center justify-between text-sm">
				<span class="text-neutral-600">Order total</span>
				<Price1 amount={status.total} currency={status.currency} />
			</div>

			{#if status.fulfilment_groups.length > 0}
				<ul class="mt-3 flex flex-col gap-1 border-t border-neutral-200 pt-3 text-sm">
					{#each status.fulfilment_groups as group, index (index)}
						<li class="flex items-center justify-between">
							<span class="text-neutral-600">
								{status.fulfilment_groups.length > 1 ? `Part ${index + 1}` : 'Fulfilment'}
							</span>
							<span class="text-neutral-900">{group.stage_name ?? group.status ?? '—'}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}

	{#if polling}
		<p class="text-center text-xs text-neutral-500">Checking for updates…</p>
	{/if}

	<a
		href={continueHref}
		class="rounded-primary border-primary-input-border mx-auto mt-2 inline-block border px-5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
	>
		Continue shopping
	</a>
</div>
