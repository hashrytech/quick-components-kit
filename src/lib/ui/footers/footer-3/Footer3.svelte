<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Footer3Props = {
		title: string;
		logo?: string;
		tagline?: string;
		copyright?: string;
		/** Flat list of shop links. The renderer supplies it from the page list;
		 *  this design splits it into columns rather than asking a merchant to
		 *  group them by hand. */
		links?: { text: string; href: string }[];
		columnCount?: number;
		newsletterHeading?: string;
		newsletterText?: string;
		buttonLabel?: string;
		showPaymentMarks?: boolean;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Columns, newsletter and a legal strip — the workhorse footer.
	 *
	 * Columns are cut from the page list by `columnCount` rather than composed.
	 * Grouping links under headings a merchant writes needs a repeating-group
	 * editor, and this design is worth having before that exists.
	 *
	 * The newsletter block is omitted entirely when there is no heading, so a
	 * shop without a mailing list does not ship an empty form.
	 */
	import { twMerge } from 'tailwind-merge';

	let {
		logo,
		title,
		tagline,
		copyright,
		links = [],
		columnCount = 2,
		newsletterHeading,
		newsletterText,
		buttonLabel = 'Join',
		showPaymentMarks = true,
		...restProps
	}: Footer3Props = $props();

	const year = new Date().getFullYear();

	// Dealt round-robin, so three links across two columns give 2 and 1 rather
	// than an empty second column.
	const columns = $derived.by(() => {
		const count = Math.min(Math.max(Math.trunc(columnCount) || 1, 1), 4);
		const out: { text: string; href: string }[][] = Array.from({ length: count }, () => []);
		links.forEach((link, index) => out[index % count].push(link));
		return out.filter((column) => column.length > 0);
	});
</script>

<footer class={twMerge('bg-white text-neutral-800', restProps.class)}>
	<div class="grid gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
		<div>
			<a href="/" class="flex min-w-0 items-center gap-2">
				{#if logo}<img src={logo} alt="Logo" class="h-8 w-auto shrink-0" />{/if}
				{#if title}<span class="truncate font-semibold">{title}</span>{/if}
			</a>
			{#if tagline}
				<p class="mt-3 text-sm leading-relaxed text-neutral-600">{tagline}</p>
			{/if}
		</div>

		{#each columns as column, index}
			<div>
				<p class="text-xs font-semibold tracking-[0.12em] uppercase">
					{index === 0 ? 'Shop' : 'More'}
				</p>
				<ul class="mt-3 space-y-2 text-sm text-neutral-600">
					{#each column as { text, href }}
						<li><a {href} class="hover:text-primary-button-hover">{text}</a></li>
					{/each}
				</ul>
			</div>
		{/each}

		{#if newsletterHeading}
			<div>
				<p class="text-xs font-semibold tracking-[0.12em] uppercase">{newsletterHeading}</p>
				{#if newsletterText}
					<p class="mt-3 text-sm text-neutral-600">{newsletterText}</p>
				{/if}
				<form class="mt-3 flex" method="POST" action="/subscribe">
					<input
						type="email"
						name="email"
						required
						aria-label="Email address"
						placeholder="Email address"
						class="focus:border-primary-button w-full min-w-0 rounded-l border border-neutral-300 px-3 py-2 text-sm outline-none"
					/>
					<button
						type="submit"
						class="bg-primary-button rounded-r px-4 text-sm font-medium whitespace-nowrap text-white"
					>
						{buttonLabel}
					</button>
				</form>
			</div>
		{/if}
	</div>

	<div
		class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-200 px-6 py-4 text-xs text-neutral-500"
	>
		<span>{copyright || `© ${year} ${title}`}</span>
		{#if showPaymentMarks}
			<div class="ml-auto flex gap-2">
				{#each ['VISA', 'MC', 'AMEX'] as mark}
					<span class="rounded border border-neutral-200 px-2 py-1">{mark}</span>
				{/each}
			</div>
		{/if}
	</div>
</footer>
