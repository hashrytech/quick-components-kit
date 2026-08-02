<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type CheckoutContact = {
		first_name: string;
		last_name: string;
		email: string;
		phone?: string;
	};

	export type ContactForm1Props = {
		value: CheckoutContact;
		errors?: Partial<Record<keyof CheckoutContact, string>>;
		disabled?: boolean;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { TextInput } from '$lib/components/text-input/index.js';

	let {
		value = $bindable(),
		errors = {},
		disabled = false,
		...restProps
	}: ContactForm1Props = $props();
</script>

<div class={twMerge('flex flex-col gap-3', restProps.class)}>
	<div class="grid gap-3 sm:grid-cols-2">
		<TextInput
			id="first_name"
			labelText="First name"
			bind:value={value.first_name}
			error={errors.first_name}
			{disabled}
			required
			size="md"
		/>
		<TextInput
			id="last_name"
			labelText="Last name"
			bind:value={value.last_name}
			error={errors.last_name}
			{disabled}
			required
			size="md"
		/>
	</div>
	<TextInput
		id="email"
		type="email"
		labelText="Email"
		bind:value={value.email}
		error={errors.email}
		{disabled}
		required
		size="md"
	/>
	<TextInput
		id="phone"
		labelText="Phone (optional)"
		bind:value={value.phone}
		error={errors.phone}
		{disabled}
		size="md"
	/>
	<!-- Guest checkout only: no password, no account creation. The email is
	     used for order attribution and the receipt, and never to look up or
	     mutate an existing customer's profile. -->
	<p class="text-xs text-neutral-500">We'll email your receipt here. No account needed.</p>
</div>
