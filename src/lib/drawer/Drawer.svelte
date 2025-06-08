<script lang="ts" module>    
	  import { type Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import { fly } from 'svelte/transition';
    import {twMerge} from 'tailwind-merge';
    import Overlay from '$lib/overlay/Overlay.svelte';
    import { onKeydown } from '$lib/actions/on-keydown.js';
    
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
  let {open=$bindable(false), escapeKeyClose=true, disableBodyScroll=true, ariaLabel="Drawer", position="left", transitionDuration=200, transitionDistance=240, overlayClasses="", children, ...props}: DrawerProps = $props();

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
<Overlay {transitionDuration} {disableBodyScroll} class={overlayClasses} onclick={() => open = false} />

<div role="dialog" aria-modal="true" aria-label={ariaLabel} tabindex="{open ? 0 : -1}" aria-hidden="{!open}" 
  class={twMerge("fixed flex flex-col items-center gap-2 bg-white outline-0 focus:outline-0 active:outline-focus-primary focus:outline-focus-primary overflow-y-auto", postionClasses[position], props.class)}
  in:fly={transitionProperties}
  out:fly={transitionProperties}
  use:onKeydown={{key: "Escape", callback: handleKeydown}}>
  {@render children?.()}
</div>
{/if}

