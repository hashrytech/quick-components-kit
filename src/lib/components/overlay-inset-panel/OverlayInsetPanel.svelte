<!--
@component OverlayInsetPanel

An inset overlay panel for Svelte 5. It renders inside the nearest positioned
ancestor, blurs/dims the content underneath, and shows a sliding panel above it.
The parent element should be positioned with `relative`, `absolute`, or `fixed`.

## Props

- `open?`: `boolean` - Whether the panel is visible. Bindable.
- `clickOutsideClose?`: `boolean` - Close when clicking outside the panel. Default: `true`.
- `clickOutsideIgnoreIds?`: `string[]` - Element IDs that should not trigger outside-close.
- `transitionDuration?`: `number` - Fade/slide duration in milliseconds.
- `transitionAxis?`: `"x" | "y"` - Axis used by the panel slide transition. Default: `"y"`.
- `panelClasses?`: `ClassNameValue` - Extra classes for the inner panel.
- `footerClasses?`: `ClassNameValue` - Extra classes for the sticky footer container.
- `onclose?`: `() => void` - Called when the panel closes or unmounts while open.
- `children?`: `Snippet` - Content rendered inside the panel.
- `footer?`: `Snippet` - Optional sticky footer content.
- `class?`: `ClassNameValue` - Extra classes for the overlay root.

## Usage

```svelte
<script>
  import { OverlayInsetPanel } from '@hashrytech/quick-components-kit';
  let open = $state(false);
</script>

<div class="relative min-h-96">
  <OverlayInsetPanel bind:open panelClasses="h-fit">
    <p>Panel content</p>
  </OverlayInsetPanel>
</div>
```
-->

<script lang="ts" module>
	import { type Snippet } from 'svelte';
	import { linear } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { twMerge, type ClassNameValue } from 'tailwind-merge';
	import { config } from '$lib/configs/config.js';
	import { clickOutside } from '$lib/functions/click-outside.js';

	export type OverlayInsetPanelProps = {
		open?: boolean;
		clickOutsideClose?: boolean;
		clickOutsideIgnoreIds?: string[];
		transitionDuration?: number;
		transitionAxis?: 'x' | 'y';
		onclose?: () => void;
		children?: Snippet;
		footer?: Snippet;
		panelClasses?: ClassNameValue;
		footerClasses?: ClassNameValue;
		class?: ClassNameValue;
	};
</script>

<script lang="ts">
	let {
		open = $bindable(false),
		clickOutsideClose = true,
		clickOutsideIgnoreIds = [],
		transitionDuration = config.transitionDuration,
		transitionAxis = 'y',
		onclose,
		children,
		footer,
		panelClasses,
		footerClasses,
		...props
	}: OverlayInsetPanelProps = $props();

	const panelTransition = $derived({
		delay: 0,
		duration: transitionDuration,
		axis: transitionAxis,
		easing: linear,
	});

	$effect(() => {
		if (open) {
			return () => onclose?.();
		}
	});

	export function closePanel() {
		open = false;
	}

	function handleClickOutside() {
		if (clickOutsideClose) closePanel();
	}
</script>

{#if open}
<div transition:fade={{ duration: transitionDuration }}
	class={twMerge(
		'absolute top-0 right-0 bottom-0 left-0 z-10 bg-black/30 shadow-primary backdrop-blur-[1.5px]',
		props.class
	)}
	role="presentation">
	<div transition:slide={panelTransition}
		class={twMerge(panelClasses)}
		use:clickOutside={{
			callback: handleClickOutside,
			enabled: clickOutsideClose,
			ignoreIds: clickOutsideIgnoreIds,
		}}>
		
		{@render children?.()}
		{@render footer?.()}
	</div>
</div>
{/if}
