<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type PublicLocation = {
		uid: string;
		name: string;
		address?: string | null;
	};

	export type LocationPicker1Props = {
		/**
		 * Present only when the store genuinely needs a choice (several mapped
		 * locations and no default). Single/default-location stores never see
		 * this — the server binds the location itself.
		 */
		locations: PublicLocation[];
		value?: string | null;
		label?: string;
		error?: string;
		disabled?: boolean;
		onchange?: (uid: string) => void;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		locations,
		value = $bindable(null),
		label = 'Choose a location',
		error,
		disabled = false,
		onchange,
		...restProps
	}: LocationPicker1Props = $props();

	function select(uid: string) {
		if (disabled) return;
		value = uid;
		onchange?.(uid);
	}
</script>

<fieldset class={twMerge('flex flex-col gap-2', restProps.class)}>
	<legend class="text-sm font-medium text-neutral-700">{label}</legend>
	<div class="flex flex-col gap-2">
		{#each locations as location (location.uid)}
			<button
				type="button"
				aria-pressed={value === location.uid}
				{disabled}
				class={twMerge(
					'rounded-primary flex flex-col items-start border px-3 py-2 text-left transition-colors',
					value === location.uid
						? 'border-primary-button bg-primary-50'
						: 'border-primary-input-border hover:border-primary-focus bg-white'
				)}
				onclick={() => select(location.uid)}
			>
				<span class="text-sm font-medium text-neutral-900">{location.name}</span>
				{#if location.address}
					<span class="text-xs text-neutral-500">{location.address}</span>
				{/if}
			</button>
		{/each}
	</div>
	{#if error}
		<p class="text-xs text-red-600">{error}</p>
	{/if}
	<!-- Changing location re-scopes catalog visibility AND pricing, so the
	     renderer revalidates the cart against the new scope. -->
	<p class="text-xs text-neutral-500">Prices and availability depend on the location you choose.</p>
</fieldset>
