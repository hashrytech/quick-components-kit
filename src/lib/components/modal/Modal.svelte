<!--
@component Modal

An accessible modal dialog component for Svelte 5 using Tailwind CSS and transitions. Includes focus trapping, overlay support, inert background, scroll locking, and escape key handling. On mobile/tablet viewports it can optionally render as a bottom (or any edge) drawer.

The modal is a flex column: the optional header bar and footer stay pinned while the content
area between them is the only scroll region. By default the modal shrinks to its content up to
the size variant's max-height; give it a definite height (e.g. `class="h-[90dvh]"`) for a
fixed-height modal whose content fills and scrolls.

The header bar is unopinionated: when a `header` snippet is provided it is rendered inside a
minimal pinned bar (bottom border, inherited text color) that can be themed via `headerClass`.
What goes in the bar — title, close button, actions — is entirely up to the snippet.

## Props

### Behaviour
- `open?`: `boolean` — Whether the modal is visible. Bindable.
- `escapeKeyClose?`: `boolean` — Close when the Escape key is pressed. Default: `true`.
- `clickOutsideClose?`: `boolean` — Close when the backdrop is clicked. Default: `true`.
- `disableBodyScroll?`: `boolean` — Prevent body scroll while open. Default: `true`.
- `disableContentScroll?`: `boolean` — Prevents the content area from scrolling while preserving the scrollbar gutter. Default: `false`.
- `inertId?`: `string` — ID of a DOM element to mark `inert` while the modal is open (accessibility).
- `ariaLabel?`: `string` — ARIA label for screen readers. Default: `"Modal"`.

### Layout
- `size?`: `"sm" | "md" | "lg" | "xl" | "full"` — Modal width and max-height on desktop. Default: `"md"`.
- `rounded?`: `boolean` — Apply `rounded-primary` corner classes. Set to `false` to remove all rounding. Default: `true`.

### Mobile drawer
- `mobileDrawer?`: `boolean` — Render as an edge drawer on mobile/tablet (at or below `config.mobileBreakpoint`). Reverts to a centred modal on desktop. Default: `false`.
- `drawerDirection?`: `"top" | "bottom" | "left" | "right"` — Edge the drawer anchors to on mobile, and the direction the modal flies in from on desktop. Default: `"bottom"`.
- `drawerSize?`: `string` — Size of the drawer's constrained dimension on mobile (e.g. `"90dvh"`, `"400px"`). `top`/`bottom` control height; `left`/`right` control width. Defaults to `"85dvh"` for vertical or `"85vw"` for horizontal drawers.
- `drawerFill?`: `boolean` — When `true` the drawer always fills `drawerSize` (fixed `height`/`width`). When `false` it shrinks to content up to `drawerSize` (`max-height`/`max-width`). Default: `true`.
- `drawerDisableContentScroll?`: `boolean` — Deprecated alias of `disableContentScroll`.

### Animation
- `transitionDuration?`: `number` — Transition duration in milliseconds.
- `transitionDistance?`: `number` — Fly distance in px on desktop. Default: `150`. On mobile drawer the full viewport dimension (`window.innerHeight` / `window.innerWidth`) is used instead.

### Styling
- `overlayClasses?`: `string` — Extra Tailwind classes for the backdrop overlay.
- `portalClass?`: `ClassNameValue` — Classes for the portal wrapper, e.g. to change the default `z-50` stacking.
- `headerClass?`: `ClassNameValue` — Extra Tailwind classes for the header bar, e.g. `bg-neutral-700 text-white border-none` for a dark header.
- `contentClass?`: `ClassNameValue` — Extra Tailwind classes for the scrollable content wrapper.
- `footerClass?`: `ClassNameValue` — Extra Tailwind classes for the pinned footer wrapper.
- `class?`: `ClassNameValue` — Classes passed to the modal container.

### Events
- `onopen?`: `() => void` — Called when the modal opens.
- `onclose?`: `() => void` — Called when the modal closes (any close path, including programmatic).

### Content
- `header?`: `Snippet` — Content rendered inside the pinned header bar above the scrollable area.
- `children?`: `Snippet` — Content rendered inside the scrollable content area.
- `footer?`: `Snippet` — Content pinned below the scrollable area.

Standard `<div>` attributes (`id`, `data-*`, …) are forwarded to the modal container.

## Usage

### Basic modal

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

### Pinned header and footer, fixed height — only the content scrolls

```svelte
<Modal bind:open={open} size="lg" class="h-[90dvh]" headerClass="bg-neutral-700 text-white border-none">
  {#snippet header()}
    <h3 class="text-base font-semibold">Order Activity</h3>
    <button type="button" aria-label="Close modal" onclick={() => open = false}>✕</button>
  {/snippet}
  <div class="p-4">Long content…</div>
  {#snippet footer()}
    <div class="p-3 bg-neutral-100 border-t border-neutral-300">...</div>
  {/snippet}
</Modal>
```

### Bottom drawer on mobile, modal on desktop

```svelte
<Modal bind:open={open} mobileDrawer drawerSize="90dvh">
  <div class="p-6">...</div>
</Modal>
```

### Right-side drawer on mobile (shrinks to content, max 80vw)

```svelte
<Modal bind:open={open} mobileDrawer drawerDirection="right" drawerSize="80vw" drawerFill={false}>
  <div class="p-6">...</div>
</Modal>
```

### Modal that flies in from the top (desktop only)

```svelte
<Modal bind:open={open} drawerDirection="top">
  <div class="p-6">...</div>
</Modal>
```

### Modal without rounded corners

```svelte
<Modal bind:open={open} rounded={false}>
  <div class="p-6">...</div>
</Modal>
```
-->

<script lang="ts" module>
	import { type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ClassNameValue } from 'tailwind-merge';
	import { twMerge } from 'tailwind-merge';
	import { Overlay } from '$lib/components/overlay/index.js';
	import { onKeydown } from '$lib/actions/on-keydown.js';
	import { Portal } from '$lib/components/portal/index.js';
	import { config } from '$lib/configs/config.js';
	import { fly } from 'svelte/transition';
	import { trapFocus } from '$lib/actions/trap-focus.js';
	import { disableLocalScroll } from '$lib/actions/disable-local-scroll.js';

	export type ModalProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		open?: boolean;
		header?: Snippet;
		footer?: Snippet;
		escapeKeyClose?: boolean;
		clickOutsideClose?: boolean;
		disableBodyScroll?: boolean;
		disableContentScroll?: boolean;
		ariaLabel?: string;
		inertId?: string;
		mobileDrawer?: boolean;
		drawerDirection?: 'top' | 'bottom' | 'left' | 'right';
		drawerSize?: string;
		drawerFill?: boolean;
		/** @deprecated Use `disableContentScroll` instead. */
		drawerDisableContentScroll?: boolean;
		rounded?: boolean;
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		transitionDuration?: number;
		transitionDistance?: number;
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

	const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
		sm: 'max-w-sm max-h-[90dvh]',
		md: 'max-w-2xl max-h-[90dvh]',
		lg: 'max-w-4xl max-h-[90dvh]',
		xl: 'max-w-6xl max-h-[90dvh]',
		full: 'w-screen h-screen',
	};

	const drawerSizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
		sm: 'md:max-w-sm md:max-h-[90dvh]',
		md: 'md:max-w-2xl md:max-h-[90dvh]',
		lg: 'md:max-w-4xl md:max-h-[90dvh]',
		xl: 'md:max-w-6xl md:max-h-[90dvh]',
		full: 'md:w-screen md:h-screen',
	};

	const drawerPositionClasses: Record<NonNullable<ModalProps['drawerDirection']>, string> = {
		bottom: 'bottom-0 left-0 right-0 w-full',
		top: 'top-0 left-0 right-0 w-full',
		left: 'left-0 top-0 bottom-0 h-full',
		right: 'right-0 top-0 bottom-0 h-full',
	};

	const drawerRoundedClasses: Record<NonNullable<ModalProps['drawerDirection']>, string> = {
		bottom: 'rounded-t-primary',
		top: 'rounded-b-primary',
		left: 'rounded-r-primary',
		right: 'rounded-l-primary',
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
		disableContentScroll,
		transitionDuration = config.transitionDuration,
		transitionDistance = 150,
		mobileDrawer = false,
		drawerDirection = 'bottom',
		drawerSize,
		drawerFill = true,
		drawerDisableContentScroll,
		rounded = true,
		inertId,
		ariaLabel = 'Modal',
		size = 'md',
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
	}: ModalProps = $props();

	let isMobile = $state(false);

	const contentScrollDisabled = $derived(disableContentScroll ?? drawerDisableContentScroll ?? false);

	$effect(() => {
		const mq = window.matchMedia(`(max-width: ${config.mobileBreakpoint}px)`);
		isMobile = mq.matches;
		const handler = (e: MediaQueryListEvent) => { isMobile = e.matches; };
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

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
	const drawerIsHorizontal = $derived(drawerDirection === 'left' || drawerDirection === 'right');

	const flyParams = $derived.by(() => {
		if (mobileDrawer && isMobile) {
			switch (drawerDirection) {
				case 'top':   return { y: -window.innerHeight };
				case 'left':  return { x: -window.innerWidth };
				case 'right': return { x: window.innerWidth };
				default:      return { y: window.innerHeight };
			}
		}
		switch (drawerDirection) {
			case 'top':   return { y: -transitionDistance };
			case 'left':  return { x: -transitionDistance };
			case 'right': return { x: transitionDistance };
			default:      return { y: transitionDistance };
		}
	});

	const drawerSizeStyle = $derived.by(() => {
		if (!mobileDrawer || !isMobile) return undefined;
		const value = drawerSize ?? (drawerIsHorizontal ? '85vw' : '85dvh');
		const prop = drawerFill
			? (drawerIsHorizontal ? 'width' : 'height')
			: (drawerIsHorizontal ? 'max-width' : 'max-height');
		return `${prop}: ${value}`;
	});
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
		style={drawerSizeStyle}
		class={twMerge(
			'fixed w-full flex flex-col overflow-hidden focus:outline-none bg-white',
			mobileDrawer
				? twMerge(
						drawerPositionClasses[drawerDirection],
						rounded && drawerRoundedClasses[drawerDirection],
						'md:bottom-auto md:right-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:h-auto',
						rounded && !isFullSize && 'md:rounded-primary',
						drawerSizeClasses[size]
					)
				: twMerge(
						'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
						rounded && !isFullSize && 'rounded-primary',
						sizeClasses[size]
					),
			className
		)}
		use:onKeydown={{ key: 'Escape', callback: handleKeydown }}
		in:fly={{ ...flyParams, duration: transitionDuration }}
		out:fly={{ ...flyParams, duration: transitionDuration }}
	>
		{#if header}
		<div class={twMerge('flex flex-row items-center justify-between gap-2 px-4 py-2 w-full min-h-10 shrink-0 border-b border-primary-card-border', headerClass)}>
			{@render header()}
		</div>
		{/if}

		<div
			use:disableLocalScroll={contentScrollDisabled}
			class={twMerge('grow min-h-0 w-full overflow-y-auto overscroll-contain [scrollbar-gutter:stable]', contentClass)}>
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
