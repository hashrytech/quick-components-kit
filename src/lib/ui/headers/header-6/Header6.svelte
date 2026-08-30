<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Header6Props = {
		title: string;
		logo?: string;
		links?: { text: string; href: string }[];
		cartLink?: string;
		cartCount?: number;
		/** Bag, Cart or Basket. The word is the whole cart control in this
		 *  design, so it is worth letting a shop choose its own. */
		cartLabel?: string;
		accountLink?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Editorial wordmark: a large centred store name over hairline rules, with
	 * small uppercase links beneath.
	 *
	 * Reads as a brand rather than a shop. The cart is a word, not an icon,
	 * which is what keeps the row quiet enough for the wordmark to lead.
	 *
	 * Wants a short name: the wordmark scales down with the viewport and
	 * truncates rather than wrapping, since a two-line wordmark stops looking
	 * deliberate.
	 */
	import { twMerge } from 'tailwind-merge';

	let {
		logo,
		title,
		links = [],
		cartLink,
		cartCount = 0,
		cartLabel = 'Bag',
		accountLink,
		...restProps
	}: Header6Props = $props();
</script>

<header class={twMerge('bg-white', restProps.class)}>
	<div class="relative flex min-h-20 items-center justify-center px-4 py-6">
		<a href="/" class="flex min-w-0 items-center gap-3 px-16">
			{#if logo}<img src={logo} alt="Logo" class="h-8 w-auto shrink-0" />{/if}
			{#if title}
				<span
					class="block truncate text-[clamp(1rem,4.5vw,1.5rem)] font-semibold tracking-[0.25em] uppercase"
				>
					{title}
				</span>
			{/if}
		</a>

		<div class="absolute right-4 flex items-center gap-4 text-sm text-neutral-700">
			{#if accountLink}
				<a href={accountLink} class="hover:text-primary-button-hover hidden xxs:inline">Account</a>
			{/if}
			{#if cartLink}
				<a
					href={cartLink}
					class="hover:text-primary-button-hover whitespace-nowrap"
					aria-label={cartCount > 0
						? `Shopping cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`
						: 'Shopping cart'}
				>
					{cartLabel}{cartCount > 0 ? ` (${cartCount > 99 ? '99+' : cartCount})` : ''}
				</a>
			{/if}
		</div>
	</div>

	{#if links.length}
		<div class="border-y border-neutral-200">
			<nav
				class="flex flex-wrap justify-center gap-x-8 gap-y-2 px-4 py-3 text-[11px] tracking-[0.18em] text-neutral-600 uppercase"
			>
				{#each links as { text, href }}
					<a {href} class="hover:text-primary-button-hover">{text}</a>
				{/each}
			</nav>
		</div>
	{/if}
</header>
