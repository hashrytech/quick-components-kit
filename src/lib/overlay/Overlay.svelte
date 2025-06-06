<script lang="ts" module>    
	  import { onDestroy, onMount, type Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import { fade } from 'svelte/transition';
    import {twMerge} from 'tailwind-merge';
	  import { browser } from '$app/environment';
    
    export type OverlayProps = {
      open?: boolean;
      escapeKeyClose?: boolean;
      disableBodyScroll?: boolean;
      ariaLabel?: string;
      overlayTransitionDuration?: number;
      overlayClasses?: string;
      children?: Snippet;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">
  let {open=$bindable(false), escapeKeyClose=true, disableBodyScroll=true, overlayTransitionDuration=0, ariaLabel="Modal", overlayClasses="", onclick, children, ...props}: OverlayProps = $props();

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

  export function closeOverlay() {
    open = false;
  };

  function handleKeydown (event: { key: string; }) {
    if(open && escapeKeyClose && event.key === "Escape") {
      closeOverlay();
    }
  };

</script>

{#if open}
<div transition:fade={{duration: overlayTransitionDuration}} class={twMerge("fixed inset-0 bg-overlay-primary", overlayClasses)} role="presentation" {onclick}></div>
{/if}

