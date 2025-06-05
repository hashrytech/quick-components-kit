<script lang="ts" module>    
	  import { onDestroy, onMount, type Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import { fade } from 'svelte/transition';
    import {twMerge} from 'tailwind-merge';
	  import { browser } from '$app/environment';
    
    export type ModalProps = {
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
  let {open=$bindable(false), escapeKeyClose=true, disableBodyScroll=true, overlayTransitionDuration=0, ariaLabel="Modal", overlayClasses="", children, ...props}: ModalProps = $props();

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
<div transition:fade={{duration: overlayTransitionDuration}} class={twMerge("fixed inset-0 bg-overlay-primary", overlayClasses)} role="presentation" onclick={() => open = false}></div>

<div role="dialog" aria-modal="true" aria-label={ariaLabel} tabindex="{open ? 0 : -1}" aria-hidden="{!open}" 
  class={twMerge("fixed bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-0 focus:outline-0 active:outline-focus-primary focus:outline-focus-primary overflow-y-auto w-full max-w-md h-96", props.class)}>
  {@render children?.()}
</div>
{/if}

