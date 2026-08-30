<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Footer6Props = {
		title: string;
		logo?: string;
		copyright?: string;
		links?: { text: string; href: string }[];
		/** Blank hides the icon. Three fixed fields rather than a repeating
		 *  list: these are the three a small shop actually uses, and each is one
		 *  text box instead of a list editor. */
		instagramUrl?: string;
		facebookUrl?: string;
		whatsappUrl?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Centred: logo, one row of links, social circles, copyright.
	 *
	 * Barely more than the minimal footer — the upgrade is the link row and the
	 * social icons, which is often all a small shop needs.
	 */
	import { twMerge } from 'tailwind-merge';

	let {
		logo,
		title,
		copyright,
		links = [],
		instagramUrl,
		facebookUrl,
		whatsappUrl,
		...restProps
	}: Footer6Props = $props();

	const year = new Date().getFullYear();

	const socials = $derived(
		[
			{ label: 'Instagram', short: 'IG', href: instagramUrl },
			{ label: 'Facebook', short: 'FB', href: facebookUrl },
			{ label: 'WhatsApp', short: 'WA', href: whatsappUrl }
		].filter((entry): entry is { label: string; short: string; href: string } => Boolean(entry.href))
	);
</script>

<footer class={twMerge('bg-white text-neutral-800', restProps.class)}>
	<div class="flex flex-col items-center gap-5 px-6 py-12 text-center">
		<a href="/" class="flex min-w-0 max-w-full items-center gap-2">
			{#if logo}<img src={logo} alt="Logo" class="h-10 w-auto shrink-0" />{/if}
			{#if title}<span class="truncate text-lg font-semibold">{title}</span>{/if}
		</a>

		{#if links.length}
			<nav class="flex flex-wrap justify-center gap-x-7 gap-y-2 text-[13px] tracking-wide text-neutral-700">
				{#each links as { text, href }}
					<a {href} class="hover:text-primary-button-hover">{text}</a>
				{/each}
			</nav>
		{/if}

		{#if socials.length}
			<div class="flex gap-3">
				{#each socials as { label, short, href }}
					<a
						{href}
						aria-label={label}
						rel="noopener noreferrer"
						target="_blank"
						class="hover:border-primary-button flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-xs"
					>
						{short}
					</a>
				{/each}
			</div>
		{/if}

		<p class="text-xs text-neutral-500">{copyright || `© ${year} ${title}`}</p>
	</div>
</footer>
