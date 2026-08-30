<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Footer5Props = {
		title: string;
		copyright?: string;
		links?: { text: string; href: string }[];
		columnCount?: number;
		/** The oversized mark along the bottom. Defaults to the title, so a long
		 *  shop name can be shortened here without renaming the shop. */
		wordmark?: string;
		addressLines?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Small columns over an oversized wordmark.
	 *
	 * The mark is set in viewport units so it fills the width at any size
	 * rather than wrapping — a wrapped giant wordmark looks like a mistake, a
	 * scaled one looks intended.
	 *
	 * It is decoration, not a heading: `aria-hidden`, because the shop name is
	 * already announced in the columns above and hearing it twice helps nobody.
	 */
	import { twMerge } from 'tailwind-merge';

	let {
		title,
		copyright,
		links = [],
		columnCount = 2,
		wordmark,
		addressLines,
		...restProps
	}: Footer5Props = $props();

	const year = new Date().getFullYear();

	const columns = $derived.by(() => {
		const count = Math.min(Math.max(Math.trunc(columnCount) || 1, 1), 3);
		const out: { text: string; href: string }[][] = Array.from({ length: count }, () => []);
		links.forEach((link, index) => out[index % count].push(link));
		return out.filter((column) => column.length > 0);
	});

	const address = $derived(
		(addressLines ?? '')
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
	);
</script>

<footer class={twMerge('bg-neutral-950 text-neutral-300', restProps.class)}>
	<div class="px-6 pt-10">
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each columns as column, index}
				<div>
					<p class="text-xs font-semibold tracking-[0.12em] text-white uppercase">
						{index === 0 ? 'Shop' : 'More'}
					</p>
					<ul class="mt-3 space-y-2 text-sm">
						{#each column as { text, href }}
							<li><a {href} class="hover:text-white">{text}</a></li>
						{/each}
					</ul>
				</div>
			{/each}

			{#if address.length}
				<div>
					<p class="text-xs font-semibold tracking-[0.12em] text-white uppercase">Visit</p>
					<ul class="mt-3 space-y-2 text-sm">
						{#each address as line}
							<li>{line}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>

		<div class="mt-10 flex flex-wrap gap-x-4 gap-y-1 border-t border-neutral-800 pt-6 pb-2">
			<span class="text-xs text-neutral-500">{copyright || `© ${year} ${title}`}</span>
		</div>

		<p
			aria-hidden="true"
			class="pb-6 text-[clamp(2rem,11vw,7rem)] leading-[0.85] font-semibold tracking-tight text-neutral-800 select-none"
		>
			{wordmark || title}
		</p>
	</div>
</footer>
