<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Header3Props = {
		title: string;
		logo?: string;
		links?: { text: string; href: string }[];
		cartLink?: string;
		cartCount?: number;
		accountLink?: string;
		/** The promo strip. Blank hides it, which is the only way to turn it
		 *  off — a separate toggle would be a second thing to keep in step. */
		announcementText?: string;
		announcementLink?: string;
		showSearch?: boolean;
		searchPlaceholder?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Announcement bar over a utility row: logo left, navigation centre,
	 * search / account / cart right.
	 *
	 * The strip carries the two things shoppers ask before they buy — a
	 * delivery threshold and a cut-off time. Below `md` the links collapse into
	 * the drawer and the strip stays, because the strip is the part that pays.
	 */
	import { HamburgerMenu, onKeydown, Overlay } from '$lib/index.js';
	import { fly } from 'svelte/transition';
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
		accountLink,
		announcementText,
		announcementLink,
		showSearch = false,
		searchPlaceholder = 'Search products',
		...restProps
	}: Header3Props = $props();

	let mobileMenuOpen = $state(false);
	let searchOpen = $state(false);

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<header class={twMerge('shadow-sm', restProps.class)}>
	{#if announcementText}
		<div class="bg-neutral-900 px-4 py-2 text-center text-xs tracking-wide text-white">
			{#if announcementLink}
				<a href={announcementLink} class="underline-offset-2 hover:underline">{announcementText}</a>
			{:else}
				{announcementText}
			{/if}
		</div>
	{/if}

	<div class="{STORE_CONTENT_WIDTH} flex min-h-16 items-center gap-4 px-4">
		{#if logo || title}
			<a href="/" class="flex min-w-0 shrink items-center gap-2">
				{#if logo}<img src={logo} alt="Logo" class="h-8 w-auto shrink-0" />{/if}
				{#if title}<span class="truncate text-lg font-semibold">{title}</span>{/if}
			</a>
		{/if}

		{#if links.length}
			<nav class="mx-auto hidden gap-7 text-sm font-medium text-neutral-700 md:flex">
				{#each links as { text, href }}
					<a {href} class="hover:text-primary-button-hover">{text}</a>
				{/each}
			</nav>
		{/if}

		<div class="ml-auto flex shrink-0 items-center gap-4">
			{#if showSearch}
				<!-- Wide screens get the field; narrow ones get a button that opens
				     it on its own row. A field beside a logo and a cart at 280px
				     leaves room for none of the three. -->
				<div class="hidden lg:block lg:w-72">
					<HeaderSearch placeholder={searchPlaceholder} />
				</div>
				<button
					type="button"
					class="hover:text-primary-button-hover text-neutral-700 lg:hidden"
					aria-expanded={searchOpen}
					aria-label="Search"
					onclick={() => (searchOpen = !searchOpen)}
				>
					<ChromeIcon name="search" />
				</button>
			{/if}
			{#if accountLink}
				<a
					href={accountLink}
					aria-label="Account"
					class="hover:text-primary-button-hover text-neutral-700"
				>
					<ChromeIcon name="account" />
				</a>
			{/if}
			{#if cartLink}<CartLink href={cartLink} count={cartCount} />{/if}
			{#if links.length}
				<HamburgerMenu
					bind:open={mobileMenuOpen}
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="md:hidden"
				/>
			{/if}
		</div>
	</div>

	{#if showSearch && searchOpen}
		<div class="{STORE_CONTENT_WIDTH} border-t border-neutral-100 px-4 py-3 lg:hidden">
			<HeaderSearch placeholder={searchPlaceholder} />
		</div>
	{/if}

	{#if mobileMenuOpen}
		<Overlay transitionDuration={150} onclick={() => (mobileMenuOpen = false)} />
		<div
			transition:fly={{ duration: 150, x: -64 }}
			class="shadow-primary fixed top-0 bottom-0 left-0 h-fit w-64 overflow-y-auto rounded-b"
			use:onKeydown={{ key: 'Escape', callback: closeMobileMenu }}
		>
			{#if logo || title}
				<div
					class="flex h-16 flex-row items-center gap-3 border-b-2 border-neutral-100 bg-white px-4 text-neutral-700 shadow-2xl"
				>
					{#if logo}<img src={logo} alt="Logo" class="size-8" />{/if}
					{#if title}<span class="truncate text-lg font-bold text-neutral-800">{title}</span>{/if}
				</div>
			{/if}
			<nav
				class="shadow-primary flex min-h-screen flex-col items-start bg-white px-2 pt-2 text-base"
			>
				{#each links as { text, href }}
					<a
						{href}
						class="hover:bg-primary-100 rounded-primary w-full px-4 py-2 text-neutral-700"
						onclick={closeMobileMenu}>{text}</a
					>
				{/each}
			</nav>
		</div>
	{/if}
</header>
