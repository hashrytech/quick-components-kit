<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Header5Props = {
		title: string;
		logo?: string;
		links?: { text: string; href: string }[];
		cartLink?: string;
		cartCount?: number;
		/** Money in the cart, already formatted. Injected, never typed: the
		 *  renderer owns cart state. Absent means show the count alone. */
		cartTotal?: string;
		showCartTotal?: boolean;
		accountLink?: string;
		searchPlaceholder?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Search-first: logo left, search across the middle, account and cart right,
	 * with the shop links on a category row beneath.
	 *
	 * For a store with a real catalogue, where people arrive knowing what they
	 * want. Search is a plain GET form, so it works without JavaScript.
	 *
	 * The category row scrolls sideways rather than wrapping: a header that
	 * grows to three lines on a phone pushes the products off the screen.
	 */
	import { twMerge } from 'tailwind-merge';
	import { STORE_CONTENT_WIDTH } from '../../chrome/content-width.js';
	import CartLink from '../../chrome/CartLink.svelte';
	import ChromeIcon from '../../chrome/ChromeIcon.svelte';
	import HeaderSearch from '../../chrome/HeaderSearch.svelte';

	let {
		logo,
		title,
		links = [],
		cartLink,
		cartCount = 0,
		cartTotal,
		showCartTotal = true,
		accountLink,
		searchPlaceholder = 'Search products',
		...restProps
	}: Header5Props = $props();
</script>

<header class={twMerge('shadow-sm', restProps.class)}>
	<div class="{STORE_CONTENT_WIDTH} flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
		{#if logo || title}
			<a href="/" class="flex min-w-0 shrink items-center gap-2">
				{#if logo}<img src={logo} alt="Logo" class="h-9 w-auto shrink-0" />{/if}
				{#if title}<span class="truncate text-lg font-semibold">{title}</span>{/if}
			</a>
		{/if}

		<div class="ml-auto flex shrink-0 items-center gap-4">
			{#if accountLink}
				<a
					href={accountLink}
					class="hover:text-primary-button-hover flex items-center gap-2 text-sm text-neutral-700"
				>
					<ChromeIcon name="account" />
					<span class="hidden sm:inline">Account</span>
				</a>
			{/if}
			{#if cartLink}
				<div class="flex items-center gap-2">
					<CartLink href={cartLink} count={cartCount} />
					{#if showCartTotal && cartTotal}
						<a href={cartLink} class="hidden text-sm font-medium text-neutral-700 sm:block"
							>{cartTotal}</a
						>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Last in the DOM but ordered first on a phone: search is the point of
		     this design, and it earns the full row once the logo and cart have
		     taken theirs. -->
		<div class="order-last w-full min-w-0 md:order-none md:mx-auto md:max-w-xl">
			<HeaderSearch placeholder={searchPlaceholder} />
		</div>
	</div>

	{#if links.length}
		<nav
			class="{STORE_CONTENT_WIDTH} flex gap-6 overflow-x-auto border-t border-neutral-200 px-4 py-2 text-[13px] whitespace-nowrap text-neutral-600"
		>
			{#each links as { text, href }}
				<a {href} class="hover:text-primary-button-hover">{text}</a>
			{/each}
		</nav>
	{/if}
</header>
