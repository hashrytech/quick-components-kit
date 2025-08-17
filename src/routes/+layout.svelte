<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();
	console.log( page.route)
</script>

{#if page.route && page.route.id?.startsWith('/quick-store')}
<div class="" id="main">
	{@render children()}
</div>
{:else}
<div class="container mx-auto flex flex-col gap-10 mb-40" id="main">
{@render children()}
</div>
{/if}
