<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="container mx-auto flex flex-col gap-10 mb-40" id="main">
{@render children()}
</div>
