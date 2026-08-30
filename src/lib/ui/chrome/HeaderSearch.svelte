<script lang="ts">
	/**
	 * Header search field.
	 *
	 * A plain GET form pointed at the product list, so it works with no
	 * JavaScript and produces a shareable URL — the same `?q=` the products
	 * page already reads. The header never holds search state of its own.
	 */
	import ChromeIcon from './ChromeIcon.svelte';

	let {
		placeholder = 'Search products',
		class: klass = ''
	}: { placeholder?: string; class?: string } = $props();
</script>

<form action="/products" method="GET" role="search" class="relative w-full {klass}">
	<span class="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400">
		<ChromeIcon name="search" class="size-4" />
	</span>
	<input
		type="search"
		name="q"
		{placeholder}
		aria-label="Search products"
		class="focus:border-primary-button w-full rounded-full border border-neutral-200 bg-neutral-100 py-2.5 pr-4 pl-9 text-sm outline-none"
	/>
</form>
