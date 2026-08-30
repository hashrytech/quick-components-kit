<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Footer4Props = {
		title: string;
		logo?: string;
		copyright?: string;
		links?: { text: string; href: string }[];
		headline?: string;
		subText?: string;
		buttonLabel?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Newsletter band over a thin link row.
	 *
	 * One job, done loudly: collect the email. Choose it when the mailing list
	 * is how the shop sells.
	 *
	 * With no headline there is nothing to ask, so the band disappears and what
	 * is left is a plain link row — a sane footer rather than a broken one.
	 */
	import { twMerge } from 'tailwind-merge';

	let {
		logo,
		title,
		copyright,
		links = [],
		headline,
		subText,
		buttonLabel = 'Sign up',
		...restProps
	}: Footer4Props = $props();

	const year = new Date().getFullYear();
</script>

<footer class={twMerge('bg-white text-neutral-800', restProps.class)}>
	{#if headline}
		<div class="bg-neutral-100 px-6 py-12 text-center">
			<h2 class="text-2xl font-semibold tracking-tight">{headline}</h2>
			{#if subText}
				<p class="mt-2 text-sm text-neutral-600">{subText}</p>
			{/if}
			<form class="mx-auto mt-5 flex max-w-md" method="POST" action="/subscribe">
				<input
					type="email"
					name="email"
					required
					aria-label="Email address"
					placeholder="Email address"
					class="focus:border-neutral-900 w-full min-w-0 border-b border-neutral-400 bg-transparent px-2 py-2 text-sm outline-none"
				/>
				<button
					type="submit"
					class="border-b border-neutral-900 px-4 text-sm font-semibold whitespace-nowrap"
				>
					{buttonLabel}
				</button>
			</form>
		</div>
	{/if}

	<div class="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-5 text-sm text-neutral-600">
		<a href="/" class="flex min-w-0 items-center gap-2">
			{#if logo}<img src={logo} alt="Logo" class="h-7 w-auto shrink-0" />{/if}
			{#if title}<span class="truncate font-semibold text-neutral-900">{title}</span>{/if}
		</a>
		{#each links as { text, href }}
			<a {href} class="hover:text-primary-button-hover">{text}</a>
		{/each}
		<span class="ml-auto text-xs text-neutral-500">{copyright || `© ${year} ${title}`}</span>
	</div>
</footer>
