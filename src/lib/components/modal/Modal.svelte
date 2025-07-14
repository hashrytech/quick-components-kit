<script lang="ts" module>    
	  import { type Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';    
    import {twMerge} from 'tailwind-merge';
	  import { Overlay } from '$lib/components/overlay/index.js';
	  import { onKeydown } from '$lib/actions/on-keydown.js';
    import { Portal } from "$lib/components/portal/index.js";
	  import { config } from '$lib/configs/config.js';	
	  import { fly } from 'svelte/transition';
    import { trapFocus } from '$lib/actions/trap-focus.js';
    
    export type ModalProps = {
      open?: boolean;
      escapeKeyClose?: boolean;
      disableBodyScroll?: boolean;
      ariaLabel?: string;
      inertId?: string;
      transitionDuration?: number;
      overlayClasses?: string;
      children?: Snippet;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">
  let {open=$bindable(false), escapeKeyClose=true, disableBodyScroll=true, transitionDuration=config.transitionDuration, inertId, ariaLabel="Modal", overlayClasses="", children, ...props}: ModalProps = $props();

  let modalElement: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (open && modalElement) {
      if(inertId)
        document.getElementById(inertId)?.setAttribute("inert", "true");
      modalElement?.focus();
      
    }
  });
  
  export function closeModal() {
    open = false;
    if(inertId)
      document.getElementById(inertId)?.removeAttribute("inert");
    
  };

  function handleKeydown() {
    if(open && escapeKeyClose){
      closeModal();
    }
  };

</script>

{#if open}
<Portal class="fixed z-50">
  <Overlay {transitionDuration} {disableBodyScroll} class={overlayClasses} onclick={closeModal} />
  <div bind:this={modalElement} use:trapFocus role="dialog" aria-modal="true" aria-label={ariaLabel} tabindex={open ? 0 : -1} aria-hidden={!open}
    class={twMerge("fixed w-full max-w-2xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6/12 overflow-y-auto focus:outline-none bg-white rounded-primary", props.class)}
    use:onKeydown={{key: "Escape", callback: handleKeydown}}
    in:fly={{y: 150, duration: transitionDuration}}
    out:fly={{y: 150, duration: transitionDuration}}>       
    
      {@render children?.()}

  </div>
</Portal>
{/if}


