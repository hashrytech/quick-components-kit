<script lang="ts">
	/**
	 * Cart icon with its count badge.
	 *
	 * The badge is the one piece of header state a shopper watches, so it is
	 * worth having exactly one implementation: the count caps at 99+, an empty
	 * cart shows no badge at all, and the accessible name carries the number
	 * rather than leaving it to the visual badge alone.
	 */
	import ChromeIcon from './ChromeIcon.svelte';

	let {
		href,
		count = 0,
		class: klass = ''
	}: { href: string; count?: number; class?: string } = $props();
</script>

<a
	{href}
	class="hover:text-primary-button-hover relative text-neutral-700 {klass}"
	aria-label={count > 0
		? `Shopping cart, ${count} item${count === 1 ? '' : 's'}`
		: 'Shopping cart'}
>
	<ChromeIcon name="cart" />
	{#if count > 0}
		<span
			class="bg-primary-button absolute -top-1 -right-2 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-semibold text-white"
		>
			{count > 99 ? '99+' : count}
		</span>
	{/if}
</a>
