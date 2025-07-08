<!--
@component Drawer

A flexible slide-in drawer component built with Svelte 5 and Tailwind CSS. Supports positional rendering (`left`, `right`, `top`, `bottom`), transition control, accessibility, and optional background overlay. Typically used for side menus, filters, or modal-like panels.

## Props

- `open?`: `boolean` — Whether the drawer is visible. Bindable.
- `escapeKeyClose?`: `boolean` — If true, pressing Escape closes the drawer. Default: `true`.
- `disableBodyScroll?`: `boolean` — Prevents body scrolling when drawer is open. Default: `true`.
- `ariaLabel?`: `string` — Accessibility label for the drawer. Default: `"Drawer"`.
- `position?`: `"left" | "right" | "top" | "bottom"` — Direction the drawer slides from. Default: `"left"`.
- `transitionDuration?`: `number` — Duration of fly transition in milliseconds. Defaults to `config.transitionDuration`.
- `transitionDistance?`: `number` — Distance the drawer slides in from. Default: `240`.
- `overlayClasses?`: `string` — Additional classes passed to the background overlay.
- `class?`: `ClassNameValue` — Tailwind classes for the drawer content container.
- `children?`: `Snippet` — Svelte fragment rendered inside the drawer content.

## Slots

This component uses `children` as a rendered snippet via `{@render}`.

## Overlay

The `<Overlay>` component is used to darken the background and optionally block interaction. It is clickable and will trigger the drawer to close unless stopped by event propagation. You can customize its styling using the `overlayClasses` prop.

## Usage

```svelte
<script>
  import Drawer from '@hashrytech/quick-components-kit';
  let isOpen = false;
</script>

<Drawer bind:open={isOpen} position="right" ariaLabel="Menu" transitionDuration={300}>
  <p class="p-4">Drawer content goes here</p>
</Drawer>
```
-->

<script lang="ts" module>
	  import { type Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import { fly } from 'svelte/transition';
    import {twMerge} from 'tailwind-merge';
    import Overlay from '$lib/components/overlay/Overlay.svelte';
    import { onKeydown } from '$lib/actions/on-keydown.js';
    import { stopInteraction } from '$lib/actions/stop-interaction.js';
    import { config } from '$lib/configs/config.js';
    
    export type DrawerProps = {
      open?: boolean;
      escapeKeyClose?: boolean;
      disableBodyScroll?: boolean;
      ariaLabel?: string;
      transitionDuration?: number;
      transitionDistance?: number;
      position?: "left" | "right" | "top" | "bottom";
      overlayClasses?: string;
      children?: Snippet;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">  
  let {
    open=$bindable(false), 
    escapeKeyClose=true, 
    disableBodyScroll=true, 
    ariaLabel="Drawer", 
    position="left", 
    transitionDuration=config.transitionDuration, 
    transitionDistance=240, 
    overlayClasses="", 
    children, 
    ...props
  }: DrawerProps = $props();

  const transitionProperties = {
    x: position == "left" ? -transitionDistance : position == "right" ? transitionDistance : 0,
    y: position == "top" ? -transitionDistance : position == "bottom" ? transitionDistance : 0,
    duration: transitionDuration
  };

  const postionClasses = {
    left: "top-0 bottom-0 left-0 w-60",
    right: "top-0 bottom-0 right-0 w-60",
    top: "top-0 left-0 right-0 h-60",
    bottom: "bottom-0 left-0 right-0 h-60",
  };

  function handleKeydown() {
    if(open && escapeKeyClose) {
      closeDrawer();
    }
  };

  export function closeDrawer() {
    open = false;
  };  

</script>

{#if open}
<div class="">
  <Overlay {transitionDuration} {disableBodyScroll} class={overlayClasses} onclick={() => open = false} />
  <div role="dialog" aria-modal="true" aria-label={ariaLabel} tabindex="{open ? 0 : -1}" aria-hidden="{!open}"
    class={twMerge("fixed flex flex-col items-center gap-2 bg-white outline-0 focus:outline-0 active:outline-focus-primary focus:outline-focus-primary overflow-y-auto z-50", postionClasses[position], props.class)}
    in:fly={transitionProperties}
    out:fly={transitionProperties}
    use:onKeydown={{key: "Escape", callback: handleKeydown}}>
    {@render children?.()}
  </div>
</div>
{/if}

