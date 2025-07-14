<!--
@component Drawer

A flexible, accessible slide-in drawer component for Svelte 5 using Tailwind CSS and transitions. Includes focus trapping, overlay support, inert background, and escape key handling.

## Props

- `open?`: `boolean` — Whether the drawer is visible. Bindable.
- `escapeKeyClose?`: `boolean` — If `true`, allows closing the drawer via the Escape key. Default: `true`.
- `disableBodyScroll?`: `boolean` — Prevents body scroll while drawer is open. Default: `true`.
- `inertId?`: `string` — DOM element ID to set `inert` while the drawer is open (for accessibility).
- `ariaLabel?`: `string` — ARIA label for screen readers. Default: `"Drawer"`.
- `position?`: `"left" | "right" | "top" | "bottom"` — Drawer slide direction. Default: `"left"`.
- `transitionDuration?`: `number` — Drawer animation duration in milliseconds.
- `transitionDistance?`: `number` — Distance the drawer flies in from (px).
- `overlayClasses?`: `string` — Custom Tailwind classes for the backdrop overlay.
- `class?`: `ClassNameValue` — Classes passed to the drawer container.
- `children?`: `Snippet` — Svelte content rendered inside the drawer.

## Usage

```svelte
<script>
  import { Drawer } from '@your-lib';
  let open = false;
</script>

<Drawer bind:open={open} position="right" inertId="main-content">
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
	import { Portal } from "$lib/components/portal/index.js";
  import { trapFocus } from '$lib/actions/trap-focus.js';
    
  export type DrawerProps = {
    open?: boolean;
    escapeKeyClose?: boolean;
    disableBodyScroll?: boolean;
    inertId?: string;
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
    inertId,
    ariaLabel="Drawer", 
    position="left", 
    transitionDuration=config.transitionDuration, 
    transitionDistance=240, 
    overlayClasses="", 
    children, 
    ...props
  }: DrawerProps = $props();

  let drawerElement: HTMLDivElement | undefined = $state();

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

  $effect(() => {
    if (open && drawerElement) {
      if(inertId)
        document.getElementById(inertId)?.setAttribute("inert", "true");
      drawerElement?.focus();
      
    }
  });

  function handleKeydown() {
    if(open && escapeKeyClose) {
      closeDrawer();
    }
  };

  export function closeDrawer() {
    if(inertId)
      document.getElementById(inertId)?.removeAttribute("inert");
    open = false;    
  };  

</script>

{#if open}
<Portal>
  <Overlay {transitionDuration} {disableBodyScroll} class={overlayClasses} onclick={closeDrawer} />
  <div bind:this={drawerElement} use:trapFocus role="dialog" aria-modal="true" aria-label={ariaLabel} tabindex={open ? 0 : -1} aria-hidden={!open}
    class={twMerge("fixed bg-white overflow-y-auto focus:outline-none", postionClasses[position], props.class)}
    in:fly={transitionProperties}
    out:fly={transitionProperties}
    use:onKeydown={{key: "Escape", callback: handleKeydown}}>
    {@render children?.()}
  </div>
</Portal>
{/if}

