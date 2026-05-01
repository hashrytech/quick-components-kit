<!--
@component Modal

An accessible modal dialog component for Svelte 5 using Tailwind CSS and transitions. Includes focus trapping, overlay support, inert background, scroll locking, and escape key handling. On mobile/tablet viewports it can optionally render as a bottom (or any edge) drawer.

## Props

### Behaviour
- `open?`: `boolean` — Whether the modal is visible. Bindable.
- `escapeKeyClose?`: `boolean` — Close when the Escape key is pressed. Default: `true`.
- `clickOutsideClose?`: `boolean` — Close when the backdrop is clicked. Default: `true`.
- `disableBodyScroll?`: `boolean` — Prevent body scroll while open. Default: `true`.
- `inertId?`: `string` — ID of a DOM element to mark `inert` while the modal is open (accessibility).
- `ariaLabel?`: `string` — ARIA label for screen readers. Default: `"Modal"`.

### Layout
- `size?`: `"sm" | "md" | "lg" | "xl" | "full"` — Modal width and max-height on desktop. Default: `"md"`.
- `rounded?`: `boolean` — Apply `rounded-primary` corner classes. Set to `false` to remove all rounding. Default: `true`.

### Mobile drawer
- `mobileDrawer?`: `boolean` — Render as an edge drawer on mobile/tablet (below the `md` breakpoint). Reverts to a centred modal on desktop. Default: `false`.
- `drawerDirection?`: `"top" | "bottom" | "left" | "right"` — Edge the drawer anchors to on mobile, and the direction the modal flies in from on desktop. Default: `"bottom"`.
- `drawerSize?`: `string` — Size of the drawer's constrained dimension on mobile (e.g. `"90vh"`, `"400px"`). `top`/`bottom` control height; `left`/`right` control width. Defaults to `"85vh"` for vertical or `"85vw"` for horizontal drawers.
- `drawerFill?`: `boolean` — When `true` the drawer always fills `drawerSize` (fixed `height`/`width`). When `false` it shrinks to content up to `drawerSize` (`max-height`/`max-width`). Default: `true`.
- `drawerDisableContentScroll?`: `boolean` — Prevents the mobile drawer content from scrolling. Default: `false`.

### Animation
- `transitionDuration?`: `number` — Transition duration in milliseconds.
- `transitionDistance?`: `number` — Fly distance in px on desktop. Default: `150`. On mobile drawer the full viewport dimension (`window.innerHeight` / `window.innerWidth`) is used instead.

### Styling
- `overlayClasses?`: `string` — Extra Tailwind classes for the backdrop overlay.
- `class?`: `ClassNameValue` — Classes passed to the modal container.

### Events
- `onopen?`: `() => void` — Called when the modal opens.
- `onclose?`: `() => void` — Called when the modal closes.

### Content
- `children?`: `Snippet` — Content rendered inside the modal.

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

### Bottom drawer on mobile, modal on desktop

```svelte
<Modal bind:open={open} mobileDrawer drawerSize="90vh">
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
	import type { ClassNameValue } from 'tailwind-merge';
	import { twMerge } from 'tailwind-merge';
	import { Overlay } from '$lib/components/overlay/index.js';
	import { onKeydown } from '$lib/actions/on-keydown.js';
	import { Portal } from '$lib/components/portal/index.js';
	import { config } from '$lib/configs/config.js';
	import { fly } from 'svelte/transition';
	import { trapFocus } from '$lib/actions/trap-focus.js';
	import { disableLocalScroll } from '$lib/actions/disable-local-scroll.js';

	export type ModalProps = {
		open?: boolean;
		escapeKeyClose?: boolean;
		clickOutsideClose?: boolean;
		disableBodyScroll?: boolean;
		ariaLabel?: string;
		inertId?: string;
		mobileDrawer?: boolean;
		drawerDirection?: 'top' | 'bottom' | 'left' | 'right';
		drawerSize?: string;
		drawerFill?: boolean;
		drawerDisableContentScroll?: boolean;
		rounded?: boolean;
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

	const drawerSizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
		sm: 'md:max-w-sm md:max-h-[90vh]',
		md: 'md:max-w-2xl md:max-h-[90vh]',
		lg: 'md:max-w-4xl md:max-h-[90vh]',
		xl: 'md:max-w-6xl md:max-h-[90vh]',
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
		escapeKeyClose = true,
		clickOutsideClose = true,
		disableBodyScroll = true,
		transitionDuration = config.transitionDuration,
		transitionDistance = 150,
		mobileDrawer = false,
		drawerDirection = 'bottom',
		drawerSize,
		drawerFill = true,
		drawerDisableContentScroll = false,
		rounded = true,
		inertId,
		ariaLabel = 'Modal',
		size = 'md',
		overlayClasses = '',
		onopen,
		onclose,
		children,
		...props
	}: ModalProps = $props();

	let isMobile = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(max-width: 767px)');
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
		const value = drawerSize ?? (drawerIsHorizontal ? '85vw' : '85vh');
		const prop = drawerFill
			? (drawerIsHorizontal ? 'width' : 'height')
			: (drawerIsHorizontal ? 'max-width' : 'max-height');
		return `${prop}: ${value}`;
	});

	const innerDrawerStyle = $derived.by(() => {
		if (!mobileDrawer || !isMobile || drawerIsHorizontal) return undefined;
		const value = drawerSize ?? '85vh';
		return drawerFill ? `height: ${value}` : `max-height: ${value}`;
	});
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
		style={drawerSizeStyle}
		class={twMerge(
			'fixed w-full focus:outline-none bg-white',
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
			props.class
		)}
		use:onKeydown={{ key: 'Escape', callback: handleKeydown }}
		in:fly={{ ...flyParams, duration: transitionDuration }}
		out:fly={{ ...flyParams, duration: transitionDuration }}
	>
		<div
			use:disableLocalScroll={drawerDisableContentScroll}
			style={innerDrawerStyle}
			class={twMerge(
			'w-full overflow-y-auto',
			mobileDrawer
				? twMerge(drawerIsHorizontal && 'h-full', isFullSize ? 'md:h-full' : 'md:max-h-[90vh]')
				: isFullSize ? 'h-full' : 'max-h-[90vh]'
		)}>
			{@render children?.()}
		</div>
	</div>
</Portal>
{/if}
