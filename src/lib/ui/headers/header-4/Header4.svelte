<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Header4Props = {
		title: string;
		logo?: string;
		links?: { text: string; href: string }[];
		cartLink?: string;
		cartCount?: number;
		accountLink?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Split navigation: links left, brand dead centre, controls right.
	 *
	 * A three-column grid rather than a flex row, so the brand sits at the true
	 * centre of the page however long the link list or the control group grows.
	 * Centring by flex drifts as soon as one side outgrows the other, which is
	 * the weakness of the plain centred header.
	 *
	 * Below `md` it collapses to a drawer; three columns at 280px is not a
	 * layout.
	 */
	import { HamburgerMenu, onKeydown, Overlay } from '$lib/index.js';
	import { fly } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import CartLink from '../../chrome/CartLink.svelte';
	import ChromeIcon from '../../chrome/ChromeIcon.svelte';

	let {
		logo,
		title,
		links = [],
		cartLink,
		cartCount = 0,
		accountLink,
		...restProps
	}: Header4Props = $props();

	let mobileMenuOpen = $state(false);

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<header class={twMerge('shadow-sm', restProps.class)}>
	<div class="grid min-h-20 w-full grid-cols-3 items-center gap-3 px-4">
		<div class="flex items-center">
			<nav class="hidden gap-6 text-[13px] font-medium tracking-wide text-neutral-700 md:flex">
				{#each links as { text, href }}
					<a {href} class="hover:text-primary-button-hover">{text}</a>
				{/each}
			</nav>
			{#if links.length}
				<HamburgerMenu
					bind:open={mobileMenuOpen}
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="md:hidden"
				/>
			{/if}
		</div>

		<a href="/" class="flex min-w-0 items-center justify-center gap-2">
			{#if logo}<img src={logo} alt="Logo" class="h-8 w-auto shrink-0" />{/if}
			{#if title}<span class="truncate text-xl font-semibold tracking-tight">{title}</span>{/if}
		</a>

		<div class="flex items-center justify-end gap-4">
			{#if accountLink}
				<a
					href={accountLink}
					aria-label="Account"
					class="hover:text-primary-button-hover hidden text-neutral-700 xxs:block"
				>
					<ChromeIcon name="account" />
				</a>
			{/if}
			{#if cartLink}<CartLink href={cartLink} count={cartCount} />{/if}
		</div>
	</div>

	{#if mobileMenuOpen}
		<Overlay transitionDuration={150} onclick={() => (mobileMenuOpen = false)} />
		<div
			transition:fly={{ duration: 150, x: -64 }}
			class="shadow-primary fixed top-0 bottom-0 left-0 h-fit w-64 overflow-y-auto rounded-b"
			use:onKeydown={{ key: 'Escape', callback: closeMobileMenu }}
		>
			<nav
				class="shadow-primary flex min-h-screen flex-col items-start bg-white px-2 pt-6 text-base"
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
