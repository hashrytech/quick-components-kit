<script lang="ts" module>    
	  import { onDestroy, onMount, type Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import { fade, fly } from 'svelte/transition';
    import {twMerge} from 'tailwind-merge';
	  import { browser } from '$app/environment';
    
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

  const lockScroll = () => document.body.style.overflow = 'hidden';
  const unlockScroll = () => document.body.style.overflow = '';

  $effect(() => {
		if (open && disableBodyScroll) lockScroll(); else unlockScroll();
	});

  onMount(() => {
    if(browser){
      window.addEventListener('keydown', handleKeydown);
    }
  });

  onDestroy(() => {
    if(browser){
      window.removeEventListener('keydown', handleKeydown);
    }
  });
  

  export function closeDrawer() {
    open = false;
  };

  function handleKeydown (event: { key: string; }) {
    if(open && escapeKeyClose && event.key === "Escape") {
      closeDrawer();
    }
  };

</script>

{#if open}
<!-- Overlay -->
<div transition:fade={{duration: transitionDuration}} class={twMerge("fixed inset-0 bg-overlay-primary", overlayClasses)} role="presentation" onclick={() => open = false}></div>

<div role="dialog" aria-modal="true" aria-label={ariaLabel} tabindex="{open ? 0 : -1}" aria-hidden="{!open}" 
  class={twMerge("fixed flex flex-col items-center gap-2 bg-white outline-0 focus:outline-0 active:outline-focus-primary focus:outline-focus-primary overflow-y-auto", postionClasses[position], props.class)}
  in:fly={transitionProperties}
  out:fly={transitionProperties}>
  {@render children?.()}
</div>
{/if}

