<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Footer7Props = {
		title: string;
		copyright?: string;
		links?: { text: string; href: string }[];
		columnCount?: number;
		contactAddress?: string;
		contactPhone?: string;
		contactEmail?: string;
		showPaymentMarks?: boolean;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Two-tone: a light link grid over a dark legal strip.
	 *
	 * The split keeps small print out of the way while the shop links stay easy
	 * to read, so this carries the most links of the set without feeling heavy.
	 *
	 * The phone and email are real links — `tel:` and `mailto:` — because a
	 * number a phone cannot dial is decoration.
	 */
	import { twMerge } from 'tailwind-merge';

	let {
		title,
		copyright,
		links = [],
		columnCount = 3,
		contactAddress,
		contactPhone,
		contactEmail,
		showPaymentMarks = true,
		...restProps
	}: Footer7Props = $props();

	const year = new Date().getFullYear();
	const HEADINGS = ['Shop', 'Service', 'Company'];

	const columns = $derived.by(() => {
		const count = Math.min(Math.max(Math.trunc(columnCount) || 1, 1), 4);
		const out: { text: string; href: string }[][] = Array.from({ length: count }, () => []);
		links.forEach((link, index) => out[index % count].push(link));
		return out.filter((column) => column.length > 0);
	});

	const address = $derived(
		(contactAddress ?? '')
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
	);
</script>

<footer class={twMerge('text-neutral-800', restProps.class)}>
	<div class="grid gap-8 bg-neutral-50 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
		{#each columns as column, index}
			<div>
				<p class="text-xs font-semibold tracking-[0.12em] uppercase">
					{HEADINGS[index] ?? 'More'}
				</p>
				<ul class="mt-3 space-y-2 text-sm text-neutral-600">
					{#each column as { text, href }}
						<li><a {href} class="hover:text-primary-button-hover">{text}</a></li>
					{/each}
				</ul>
			</div>
		{/each}

		{#if address.length || contactPhone || contactEmail}
			<div>
				<p class="text-xs font-semibold tracking-[0.12em] uppercase">Contact</p>
				<ul class="mt-3 space-y-2 text-sm break-words text-neutral-600">
					{#each address as line}
						<li>{line}</li>
					{/each}
					{#if contactPhone}
						<li>
							<a href={`tel:${contactPhone.replace(/\s+/g, '')}`} class="hover:text-primary-button-hover">
								{contactPhone}
							</a>
						</li>
					{/if}
					{#if contactEmail}
						<li>
							<a href={`mailto:${contactEmail}`} class="hover:text-primary-button-hover">
								{contactEmail}
							</a>
						</li>
					{/if}
				</ul>
			</div>
		{/if}
	</div>

	<div
		class="flex flex-wrap items-center gap-x-4 gap-y-2 bg-neutral-900 px-6 py-4 text-xs text-neutral-400"
	>
		<span>{copyright || `© ${year} ${title}. All rights reserved.`}</span>
		{#if showPaymentMarks}
			<div class="ml-auto flex gap-2">
				{#each ['VISA', 'MC'] as mark}
					<span class="rounded border border-neutral-700 px-2 py-1">{mark}</span>
				{/each}
			</div>
		{/if}
	</div>
</footer>
