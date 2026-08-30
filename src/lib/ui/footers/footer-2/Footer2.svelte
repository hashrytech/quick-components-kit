<script lang="ts" module>
	import { twMerge } from 'tailwind-merge';
	import type { ClassNameValue } from 'tailwind-merge';

	/** A subset of `Footer1Props`, deliberately: a merchant swapping from
	 *  Footer 1 keeps title, logo and copyright, and is warned that the
	 *  tagline and link columns are not carried across. */
	export type Footer2Props = {
		title: string;
		logo?: string;
		copyright?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	/**
	 * Minimal footer: the shop's name and its copyright line, nothing else.
	 *
	 * The counterpart to Footer 1's link columns — for shops with few pages,
	 * where a column of two links reads as an empty shelf. Deliberately has no
	 * `links` prop: a merchant choosing this design is choosing not to have
	 * them, and accepting an unused prop would let the renderer inject links
	 * this layout has nowhere to put.
	 */
	let { logo, title, copyright, ...restProps }: Footer2Props = $props();
</script>

<footer
	class={twMerge(
		'flex flex-col items-center justify-center gap-3 bg-neutral-900 px-4 py-8 text-white',
		restProps.class
	)}
>
	{#if logo || title}
		<div class="flex items-center gap-2">
			{#if logo}<a href="/"><img src={logo} alt="Logo" class="h-8 w-auto" /></a>{/if}
			{#if title}<a href="/"><span class="text-lg font-semibold">{title}</span></a>{/if}
		</div>
	{/if}

	{#if copyright}
		<p class="text-center text-sm text-neutral-400">{copyright}</p>
	{/if}
</footer>
