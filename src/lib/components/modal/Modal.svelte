<script lang="ts" module>    
	  import { onDestroy, onMount, type Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import { fade } from 'svelte/transition';
    import {twMerge} from 'tailwind-merge';
	  import { browser } from '$app/environment';
	  import Overlay from '$lib/components/overlay/Overlay.svelte';
	  import { onKeydown } from '$lib/actions/on-keydown.js';
    
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
  let {open=$bindable(false), escapeKeyClose=true, disableBodyScroll=true, overlayTransitionDuration=100, ariaLabel="Modal", overlayClasses="", children, ...props}: ModalProps = $props();
  
  export function closeModal() {
    open = false;
  };

  function handleKeydown() {
    if(open && escapeKeyClose){
      closeModal();
    }
  };

</script>

{#if open}
<Overlay transitionDuration={overlayTransitionDuration} {disableBodyScroll} class={overlayClasses} onclick={() => open = false} />

<div role="dialog" aria-modal="true" aria-label={ariaLabel} tabindex="{open ? 0 : -1}" aria-hidden="{!open}" 
  class={twMerge("fixed bg-white rounded top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-0 focus:outline-0 active:outline-focus-primary focus:outline-focus-primary overflow-y-auto w-full max-w-md h-96", props.class)}
  use:onKeydown={{key: "Escape", callback: handleKeydown}}>
  {@render children?.()}
</div>
{/if}

