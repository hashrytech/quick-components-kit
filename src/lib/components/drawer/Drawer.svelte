<!--
@component Drawer

A flexible, accessible slide-in drawer component for Svelte 5 using Tailwind CSS and transitions. Includes focus trapping, overlay support, inert background, and escape key handling.

## Props

- `open?`: `boolean` — Whether the drawer is visible. Bindable.
- `escapeKeyClose?`: `boolean` — If `true`, allows closing the drawer via the Escape key. Default: `true`.
- `clickOutsideClose?`: `boolean` — If `true`, clicking the backdrop closes the drawer. Default: `true`.
- `disableBodyScroll?`: `boolean` — Prevents body scroll while drawer is open. Default: `true`.
- `disableContentScroll?`: `boolean` — Prevents drawer content scroll while preserving the scrollbar gutter. Default: `false`.
- `inertId?`: `string` — DOM element ID to set `inert` while the drawer is open (for accessibility).
- `ariaLabel?`: `string` — ARIA label for screen readers. Default: `"Drawer"`.
- `position?`: `"left" | "right" | "top" | "bottom"` — Drawer slide direction. Default: `"left"`.
- `size?`: `"sm" | "md" | "lg" | "xl" | "full"` — Drawer width (left/right) or height (top/bottom) variant. Default: `"md"`.
- `transitionDuration?`: `number` — Drawer animation duration in milliseconds.
- `transitionDistance?`: `number` — Distance the drawer flies in from (px). Defaults to the pixel value of `size`.
- `overlayClasses?`: `string` — Custom Tailwind classes for the backdrop overlay.
- `class?`: `ClassNameValue` — Classes passed to the drawer container.
- `children?`: `Snippet` — Svelte content rendered inside the drawer.
- `onopen?`: `() => void` — Called when the drawer opens.
- `onclose?`: `() => void` — Called when the drawer closes.

## Usage

```svelte
<script>
  import { Drawer } from '@your-lib';
  let open = false;
</script>

<Drawer bind:open={open} position="right" size="md" inertId="main-content">
  <p class="p-4">Drawer content goes here</p>
</Drawer>
```
-->

<script lang="ts" module>
	import { type Snippet } from 'svelte';
	import type { ClassNameValue } from 'tailwind-merge';
	import { fly } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { Overlay } from '$lib/components/overlay/index.js';
	import { onKeydown } from '$lib/actions/on-keydown.js';
	import { config } from '$lib/configs/config.js';
	import { Portal } from '$lib/components/portal/index.js';
	import { trapFocus } from '$lib/actions/trap-focus.js';
	import { disableLocalScroll } from '$lib/actions/disable-local-scroll.js';

	export type DrawerProps = {
		open?: boolean;
		escapeKeyClose?: boolean;
		clickOutsideClose?: boolean;
		disableBodyScroll?: boolean;
		disableContentScroll?: boolean;
		inertId?: string;
		ariaLabel?: string;
		position?: 'left' | 'right' | 'top' | 'bottom';
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		transitionDuration?: number;
		transitionDistance?: number;
		overlayClasses?: string;
		onopen?: () => void;
		onclose?: () => void;
		children?: Snippet;
		class?: ClassNameValue;
	};

	const sizePixels: Record<NonNullable<DrawerProps['size']>, number> = {
		sm: 192,
		md: 240,
		lg: 320,
		xl: 384,
		full: 9999,
	};

	const horizontalSizeClasses: Record<NonNullable<DrawerProps['size']>, string> = {
		sm: 'w-48',
		md: 'w-60',
		lg: 'w-80',
		xl: 'w-96',
		full: 'w-screen',
	};

	const verticalSizeClasses: Record<NonNullable<DrawerProps['size']>, string> = {
		sm: 'h-48',
		md: 'h-60',
		lg: 'h-80',
		xl: 'h-96',
		full: 'h-screen',
	};

	const positionClasses: Record<NonNullable<DrawerProps['position']>, string> = {
		left: 'top-0 bottom-0 left-0',
		right: 'top-0 bottom-0 right-0',
		top: 'top-0 left-0 right-0',
		bottom: 'bottom-0 left-0 right-0',
	};
</script>

<script lang="ts">
	let {
		open = $bindable(false),
		escapeKeyClose = true,
		clickOutsideClose = true,
		disableBodyScroll = true,
		disableContentScroll = false,
		inertId,
		ariaLabel = 'Drawer',
		position = 'left',
		size = 'md',
		transitionDuration = config.transitionDuration,
		transitionDistance,
		overlayClasses = '',
		onopen,
		onclose,
		children,
		...props
	}: DrawerProps = $props();

	const resolvedDistance = $derived(transitionDistance ?? sizePixels[size]);

	const transitionProperties = $derived({
		x: position === 'left' ? -resolvedDistance : position === 'right' ? resolvedDistance : 0,
		y: position === 'top' ? -resolvedDistance : position === 'bottom' ? resolvedDistance : 0,
		duration: transitionDuration,
	});

	const sizeClass = $derived(
		position === 'left' || position === 'right'
			? horizontalSizeClasses[size]
			: verticalSizeClasses[size]
	);

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

	export function closeDrawer() {
		open = false;
	}

	function handleKeydown() {
		if (escapeKeyClose) closeDrawer();
	}

	function handleOverlayClick() {
		if (clickOutsideClose) closeDrawer();
	}
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
		class={twMerge('fixed overflow-hidden bg-white focus:outline-none', positionClasses[position], sizeClass, props.class)}
		in:fly={transitionProperties}
		out:fly={transitionProperties}
		use:onKeydown={{ key: 'Escape', callback: handleKeydown }}
	>
		<div use:disableLocalScroll={disableContentScroll} class="h-full w-full overflow-y-auto overscroll-contain [scrollbar-gutter:auto]">
			{@render children?.()}
		</div>
	</div>
</Portal>
{/if}
