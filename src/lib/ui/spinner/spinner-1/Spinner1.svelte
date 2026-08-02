<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';

	export type Spinner1Props = {
		size?: 'sm' | 'md' | 'lg';
		/** Announced to assistive tech; the spinner itself is decorative. */
		label?: string;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let { size = 'md', label = 'Loading', ...restProps }: Spinner1Props = $props();

	const sizeClass = { sm: 'size-4', md: 'size-6', lg: 'size-10' } as const;
</script>

<span class="inline-flex items-center gap-2" role="status" aria-live="polite">
	<svg
		class={twMerge('animate-spin text-neutral-400', sizeClass[size], restProps.class)}
		viewBox="0 0 24 24"
		fill="none"
		aria-hidden="true"
	>
		<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
		<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
	</svg>
	<span class="sr-only">{label}</span>
</span>
