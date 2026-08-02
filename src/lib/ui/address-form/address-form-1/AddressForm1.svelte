<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	/** Exactly the Address fields the checkout contract accepts. */
	export type CheckoutAddress = {
		address: string;
		address_two?: string;
		city: string;
		province_state_parish?: string;
		postal_code?: string;
		country: string;
	};

	export type AddressForm1Props = {
		value: CheckoutAddress;
		/**
		 * When the resolved store has a non-empty country, checkout is locked
		 * to it: the server 400s a mismatch, so the field is rendered read-only
		 * rather than inviting an order that cannot be delivered. A blank store
		 * country means free-form entry with no check.
		 */
		lockedCountry?: string | null;
		errors?: Partial<Record<keyof CheckoutAddress, string>>;
		disabled?: boolean;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { TextInput } from '$lib/components/text-input/index.js';

	let {
		value = $bindable(),
		lockedCountry = null,
		errors = {},
		disabled = false,
		...restProps
	}: AddressForm1Props = $props();

	// Keep the payload consistent with the lock so a stale free-form value can
	// never be submitted after the store's country is configured.
	$effect(() => {
		if (lockedCountry && value.country !== lockedCountry) {
			value.country = lockedCountry;
		}
	});
</script>

<div class={twMerge('flex flex-col gap-3', restProps.class)}>
	<TextInput
		id="address"
		labelText="Address"
		bind:value={value.address}
		error={errors.address}
		{disabled}
		required
		size="md"
	/>
	<TextInput
		id="address_two"
		labelText="Apartment, suite, etc. (optional)"
		bind:value={value.address_two}
		error={errors.address_two}
		{disabled}
		size="md"
	/>
	<div class="grid gap-3 sm:grid-cols-2">
		<TextInput
			id="city"
			labelText="City"
			bind:value={value.city}
			error={errors.city}
			{disabled}
			required
			size="md"
		/>
		<TextInput
			id="province_state_parish"
			labelText="Parish / State (optional)"
			bind:value={value.province_state_parish}
			error={errors.province_state_parish}
			{disabled}
			size="md"
		/>
	</div>
	<div class="grid gap-3 sm:grid-cols-2">
		<TextInput
			id="postal_code"
			labelText="Postal code (optional)"
			bind:value={value.postal_code}
			error={errors.postal_code}
			{disabled}
			size="md"
		/>
		{#if lockedCountry}
			<div class="flex flex-col gap-1">
				<span class="ml-1 text-sm text-neutral-600">Country</span>
				<div
					class="rounded-primary border-primary-input-border flex h-[2.375rem] items-center border bg-neutral-100 px-2 text-sm text-neutral-700"
					aria-readonly="true"
				>
					{lockedCountry}
				</div>
				<p class="ml-1 text-xs text-neutral-500">This store delivers to {lockedCountry} only.</p>
			</div>
		{:else}
			<TextInput
				id="country"
				labelText="Country"
				bind:value={value.country}
				error={errors.country}
				{disabled}
				required
				size="md"
			/>
		{/if}
	</div>
</div>
