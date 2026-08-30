<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Header7Props = {
		title: string;
		logo?: string;
		links?: { text: string; href: string }[];
		cartLink?: string;
		cartCount?: number;
		accountLink?: string;
		/** Word beside the hamburger. The link row never shows in this design,
		 *  so this button is the only way into the rest of the shop. */
		menuLabel?: string;
		/** Darkening laid over the image behind, 0&ndash;60. Without it, white
		 *  text on a pale photograph is unreadable. */
		overlayOpacity?: number;
		/** Set by the renderer when a banner follows immediately. False makes
		 *  the header solid instead of transparent, so a page with no image
		 *  still has a header you can see. */
		overBanner?: boolean;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Overlay header: sits on top of the page banner instead of above it, so a
	 * page opens with a picture.
	 *
	 * A menu button replaces the link row at every width — that is the design,
	 * not a small-screen fallback.
	 *
	 * The transparent treatment only works over an image. `overBanner` is false
	 * on a page with no banner, and the header falls back to a solid white bar
	 * rather than white text on white.
	 */
	import { HamburgerMenu, onKeydown, Overlay } from '$lib/index.js';
	import { fly } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { STORE_CONTENT_WIDTH } from '../../chrome/content-width.js';

	let {
		logo,
		title,
		links = [],
		cartLink,
		cartCount = 0,
		accountLink,
		menuLabel = 'Menu',
		overlayOpacity = 25,
		overBanner = true,
		...restProps
	}: Header7Props = $props();

	let mobileMenuOpen = $state(false);

	// Clamped here rather than trusted: the value is merchant-set, and an
	// opacity above 60 turns the banner into a dark rectangle.
	const shade = $derived(Math.min(Math.max(overlayOpacity, 0), 60) / 100);

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<header
	class={twMerge(
		overBanner
			? 'absolute inset-x-0 top-0 z-30 text-white'
			: 'relative border-b border-neutral-200 bg-white text-neutral-800',
		restProps.class
	)}
>
	{#if overBanner}
		<!-- Gradient rather than a flat wash: the darkening is needed at the top
		     where the text sits, and fades before it reaches the banner's own
		     message lower down. -->
		<div
			class="pointer-events-none absolute inset-x-0 top-0 h-32"
			style="background: linear-gradient(to bottom, rgba(0,0,0,{shade}), rgba(0,0,0,0));"
		></div>
	{/if}

	<div class="{STORE_CONTENT_WIDTH} relative flex min-h-16 items-center gap-3 px-4">
		<button
			type="button"
			class="flex shrink-0 items-center gap-2 text-sm tracking-wide"
			aria-expanded={mobileMenuOpen}
			onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
		>
			<HamburgerMenu open={mobileMenuOpen} />
			<span class="hidden xxs:inline">{menuLabel}</span>
		</button>

		<a
			href="/"
			class="absolute left-1/2 flex min-w-0 max-w-[50%] -translate-x-1/2 items-center gap-2"
		>
			{#if logo}<img src={logo} alt="Logo" class="h-8 w-auto shrink-0" />{/if}
			{#if title}
				<span class="truncate text-lg font-semibold tracking-[0.15em] uppercase">{title}</span>
			{/if}
		</a>

		<div class="ml-auto flex shrink-0 items-center gap-4 text-sm">
			{#if accountLink}
				<a href={accountLink} class="hidden xs:inline">Account</a>
			{/if}
			{#if cartLink}
				<a
					href={cartLink}
					class="whitespace-nowrap"
					aria-label={cartCount > 0
						? `Shopping cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`
						: 'Shopping cart'}
				>
					Bag{cartCount > 0 ? ` (${cartCount > 99 ? '99+' : cartCount})` : ''}
				</a>
			{/if}
		</div>
	</div>

	{#if mobileMenuOpen}
		<Overlay transitionDuration={150} onclick={() => (mobileMenuOpen = false)} />
		<div
			transition:fly={{ duration: 150, x: -64 }}
			class="shadow-primary fixed top-0 bottom-0 left-0 z-40 h-fit w-64 overflow-y-auto rounded-b"
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
