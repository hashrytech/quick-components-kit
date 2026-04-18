<!--
@component Modal

A accessible modal dialog component for Svelte 5 using Tailwind CSS and transitions. Includes focus trapping, overlay support, inert background, scroll locking, and escape key handling.

## Props

- `open?`: `boolean` — Whether the modal is visible. Bindable.
- `escapeKeyClose?`: `boolean` — If `true`, allows closing the modal via the Escape key. Default: `true`.
- `clickOutsideClose?`: `boolean` — If `true`, clicking the backdrop closes the modal. Default: `true`.
- `disableBodyScroll?`: `boolean` — Prevents body scroll while modal is open. Default: `true`.
- `inertId?`: `string` — DOM element ID to set `inert` while the modal is open (for accessibility).
- `ariaLabel?`: `string` — ARIA label for screen readers. Default: `"Modal"`.
- `size?`: `"sm" | "md" | "lg" | "xl" | "full"` — Modal width and max-height variant. Default: `"md"`.
- `transitionDuration?`: `number` — Animation duration in milliseconds.
- `transitionDistance?`: `number` — Vertical distance the modal flies in from (px). Default: `150`.
- `overlayClasses?`: `string` — Custom Tailwind classes for the backdrop overlay.
- `class?`: `ClassNameValue` — Classes passed to the modal container.
- `children?`: `Snippet` — Svelte content rendered inside the modal.
- `onopen?`: `() => void` — Called when the modal opens.
- `onclose?`: `() => void` — Called when the modal closes.

## Usage

```svelte
<script>
  import { Modal } from '@your-lib';
  let open = false;
</script>

<button onclick={() => open = true}>Open</button>

<Modal bind:open={open} size="md" inertId="main-content">
  <div class="p-6">
    <h2>Title</h2>
    <p>Content goes here.</p>
    <button onclick={() => open = false}>Close</button>
  </div>
</Modal>
```
-->

<script lang="ts" module>
	import { type Snippet } from 'svelte';
	import type { ClassNameValue } from 'tailwind-merge';
	import { twMerge } from 'tailwind-merge';
	import { Overlay } from '$lib/components/overlay/index.js';
	import { onKeydown } from '$lib/actions/on-keydown.js';
	import { Portal } from '$lib/components/portal/index.js';
	import { config } from '$lib/configs/config.js';
	import { fly } from 'svelte/transition';
	import { trapFocus } from '$lib/actions/trap-focus.js';

	export type ModalProps = {
		open?: boolean;
		escapeKeyClose?: boolean;
		clickOutsideClose?: boolean;
		disableBodyScroll?: boolean;
		ariaLabel?: string;
		inertId?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		transitionDuration?: number;
		transitionDistance?: number;
		overlayClasses?: string;
		onopen?: () => void;
		onclose?: () => void;
		children?: Snippet;
		class?: ClassNameValue;
	};

	const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
		sm: 'max-w-sm max-h-[90vh]',
		md: 'max-w-2xl max-h-[90vh]',
		lg: 'max-w-4xl max-h-[90vh]',
		xl: 'max-w-6xl max-h-[90vh]',
		full: 'w-screen h-screen',
	};
</script>

<script lang="ts">
	let {
		open = $bindable(false),
		escapeKeyClose = true,
		clickOutsideClose = true,
		disableBodyScroll = true,
		transitionDuration = config.transitionDuration,
		transitionDistance = 150,
		inertId,
		ariaLabel = 'Modal',
		size = 'md',
		overlayClasses = '',
		onopen,
		onclose,
		children,
		...props
	}: ModalProps = $props();

	$effect(() => {
		if (open) {
			if (inertId) document.getElementById(inertId)?.setAttribute('inert', 'true');
			onopen?.();
			return () => {
				if (inertId) document.getElementById(inertId)?.removeAttribute('inert');
				onclose?.();
			};
		}
	});

	export function closeModal() {
		open = false;
	}

	function handleKeydown() {
		if (escapeKeyClose) closeModal();
	}

	function handleOverlayClick() {
		if (clickOutsideClose) closeModal();
	}

	const isFullSize = $derived(size === 'full');
</script>

{#if open}
<Portal class="fixed z-50">
	<Overlay {transitionDuration} {disableBodyScroll} class={overlayClasses} onclick={handleOverlayClick} />
	<div
		use:trapFocus
		role="dialog"
		aria-modal="true"
		aria-label={ariaLabel}
		tabindex="0"
		class={twMerge(
			'fixed w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none bg-white',
			!isFullSize && 'rounded-primary',
			sizeClasses[size],
			props.class
		)}
		use:onKeydown={{ key: 'Escape', callback: handleKeydown }}
		in:fly={{ y: transitionDistance, duration: transitionDuration }}
		out:fly={{ y: transitionDistance, duration: transitionDuration }}
	>
		<div class={twMerge('w-full', isFullSize ? 'h-full overflow-y-auto' : 'max-h-[90vh] overflow-y-auto')}>
			{@render children?.()}
		</div>
	</div>
</Portal>
{/if}
