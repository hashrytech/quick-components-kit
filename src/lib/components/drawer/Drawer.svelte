<!--
@component Drawer

A flexible, accessible slide-in drawer component for Svelte 5 using Tailwind CSS and transitions. Includes focus trapping, overlay support, inert background, and escape key handling.

The drawer is a flex column: the optional header bar and footer stay pinned while the content
area between them is the only scroll region.

The header bar is unopinionated: when a `header` snippet is provided it is rendered inside a
minimal pinned bar (bottom border, inherited text color) that can be themed via `headerClass`.
What goes in the bar — title, close button, actions — is entirely up to the snippet.

## Props

- `open?`: `boolean` — Whether the drawer is visible. Bindable.
- `header?`: `Snippet` — Content rendered inside the pinned header bar above the scrollable area.
- `footer?`: `Snippet` — Content pinned below the scrollable area.
- `escapeKeyClose?`: `boolean` — If `true`, allows closing the drawer via the Escape key. Default: `true`.
- `clickOutsideClose?`: `boolean` — If `true`, clicking the backdrop closes the drawer. Default: `true`.
- `disableBodyScroll?`: `boolean` — Prevents body scroll while drawer is open. Default: `true`.
- `disableContentScroll?`: `boolean` — Prevents drawer content scroll while preserving the scrollbar gutter. Default: `false`.
- `inertId?`: `string` — DOM element ID to set `inert` while the drawer is open (for accessibility).
- `ariaLabel?`: `string` — ARIA label for screen readers. Default: `"Drawer"`.
- `position?`: `"left" | "right" | "top" | "bottom"` — Drawer slide direction. Default: `"left"`.
- `size?`: `"sm" | "md" | "lg" | "xl" | "full"` — Width variant for left/right drawers (`w-48`–`w-96`); viewport-height variant for top/bottom drawers (`50vh` / `75vh` / `90vh` / `95vh`). Default: `"md"`.
- `transitionDuration?`: `number` — Drawer animation duration in milliseconds.
- `transitionDistance?`: `number` — Distance the drawer flies in from (px). Defaults to the drawer's own rendered width/height so it slides in exactly from offscreen.
- `transitionOpacity?`: `number` — Starting opacity of the fly-in transition (0–1). Default: `1` (no fade).
- `overlayClasses?`: `string` — Custom Tailwind classes for the backdrop overlay.
- `portalClass?`: `ClassNameValue` — Classes for the portal wrapper, e.g. to change the default `z-50` stacking.
- `headerClass?`: `ClassNameValue` — Extra Tailwind classes for the header bar, e.g. `bg-neutral-700 text-white border-none` for a dark header.
- `contentClass?`: `ClassNameValue` — Extra Tailwind classes for the scrollable content wrapper.
- `footerClass?`: `ClassNameValue` — Extra Tailwind classes for the pinned footer wrapper.
- `class?`: `ClassNameValue` — Classes passed to the drawer container.
- `children?`: `Snippet` — Svelte content rendered inside the drawer.
- `onopen?`: `() => void` — Called when the drawer opens.
- `onclose?`: `() => void` — Called when the drawer closes.

Standard `<div>` attributes (`id`, `data-*`, …) are forwarded to the drawer container.

Top/bottom drawers are horizontally centered when width-constrained, so panel-style drawers
need only a `max-w-*` class (e.g. `class="max-w-2xl rounded-t-primary"`).

## Usage

```svelte
<script>
  import { Drawer } from '@your-lib';
  let open = false;
</script>

<Drawer bind:open={open} position="right" size="md" inertId="main-content">
  <p class="p-4">Drawer content goes here</p>
</Drawer>

<Drawer bind:open={open} position="bottom" size="lg" class="max-w-2xl rounded-t-primary"
  headerClass="bg-neutral-700 text-white border-none">
  {#snippet header()}
    <h3 class="text-base font-semibold">Order Activity</h3>
    <button type="button" aria-label="Close drawer" onclick={() => open = false}>✕</button>
  {/snippet}
  <div class="p-4">Only this content scrolls; the header bar and footer stay pinned.</div>
  {#snippet footer()}
    <div class="p-3 bg-neutral-100 border-t border-neutral-300">...</div>
  {/snippet}
</Drawer>
```
-->

<script lang="ts" module>
	import { type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ClassNameValue } from 'tailwind-merge';
	import { fly } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { Overlay } from '$lib/components/overlay/index.js';
	import { onKeydown } from '$lib/actions/on-keydown.js';
	import { config } from '$lib/configs/config.js';
	import { Portal } from '$lib/components/portal/index.js';
	import { trapFocus } from '$lib/actions/trap-focus.js';
	import { disableLocalScroll } from '$lib/actions/disable-local-scroll.js';

	export type DrawerProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		open?: boolean;
		header?: Snippet;
		footer?: Snippet;
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
		transitionOpacity?: number;
		overlayClasses?: string;
		portalClass?: ClassNameValue;
		headerClass?: ClassNameValue;
		contentClass?: ClassNameValue;
		footerClass?: ClassNameValue;
		onopen?: () => void;
		onclose?: () => void;
		children?: Snippet;
		class?: ClassNameValue;
	};

	const horizontalSizeClasses: Record<NonNullable<DrawerProps['size']>, string> = {
		sm: 'w-48',
		md: 'w-60',
		lg: 'w-80',
		xl: 'w-96',
		full: 'w-screen',
	};

	const verticalSizeClasses: Record<NonNullable<DrawerProps['size']>, string> = {
		sm: 'h-[50vh]',
		md: 'h-[75vh]',
		lg: 'h-[90vh]',
		xl: 'h-[95vh]',
		full: 'h-screen',
	};

	const positionClasses: Record<NonNullable<DrawerProps['position']>, string> = {
		left: 'top-0 bottom-0 left-0',
		right: 'top-0 bottom-0 right-0',
		top: 'top-0 left-0 right-0 mx-auto',
		bottom: 'bottom-0 left-0 right-0 mx-auto',
	};
</script>

<script lang="ts">
	let {
		open = $bindable(false),
		header,
		footer,
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
		transitionOpacity = 1,
		overlayClasses = '',
		portalClass,
		headerClass,
		contentClass,
		footerClass,
		onopen,
		onclose,
		children,
		class: className,
		...rest
	}: DrawerProps = $props();

	const isHorizontal = $derived(position === 'left' || position === 'right');

	const sizeClass = $derived(
		isHorizontal ? horizontalSizeClasses[size] : verticalSizeClasses[size]
	);

	// Measured at transition time so the default distance always matches the
	// drawer's rendered size — it slides in exactly from its own edge.
	function drawerFly(node: HTMLElement) {
		const rect = node.getBoundingClientRect();
		const distance = transitionDistance ?? (isHorizontal ? rect.width : rect.height);
		return fly(node, {
			x: position === 'left' ? -distance : position === 'right' ? distance : 0,
			y: position === 'top' ? -distance : position === 'bottom' ? distance : 0,
			duration: transitionDuration,
			opacity: transitionOpacity,
		});
	}

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
<Portal class={twMerge('fixed z-50', portalClass)}>
	<Overlay {transitionDuration} {disableBodyScroll} class={overlayClasses} onclick={handleOverlayClick} />
	<div
		{...rest}
		use:trapFocus
		role="dialog"
		aria-modal="true"
		aria-label={ariaLabel}
		tabindex="0"
		class={twMerge('fixed flex flex-col overflow-hidden bg-white focus:outline-none', positionClasses[position], sizeClass, className)}
		in:drawerFly
		out:drawerFly
		use:onKeydown={{ key: 'Escape', callback: handleKeydown }}
	>
		{#if header}
		<div class={twMerge('w-full shrink-0', headerClass)}>
			{@render header()}
		</div>
		{/if}

		<div use:disableLocalScroll={disableContentScroll} class={twMerge('flex-1 min-h-0 w-full overflow-y-auto overscroll-contain', contentClass)}>
			{@render children?.()}
		</div>

		{#if footer}
		<div class={twMerge('w-full shrink-0', footerClass)}>
			{@render footer()}
		</div>
		{/if}
	</div>
</Portal>
{/if}
