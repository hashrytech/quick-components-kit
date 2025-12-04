<script lang="ts" module>
    import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type ToastType = 'success' | 'info' | 'debug' | 'warning' | 'error';
    export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';    

</script>

<script lang="ts">
  import { fly } from 'svelte/transition';	
  import { onMount, onDestroy } from 'svelte';
  import { toastIcons, toastTypeClasses, toastTypeIconColours, toastOptions } from './index.js';

  let { toastType="info", message = "This is a generic toast message", subMessage="", delToast} : 
      { toastType:ToastType, message:string, subMessage:string, delToast?: ()=> void} = $props();

  let open: boolean = $state(false);

  let autoTimer: ReturnType<typeof setTimeout>;

  onMount(async () => {
    open = true;
    if(toastOptions.autoRemove){        
      autoTimer = setTimeout(async () => {await handle_close();}, toastOptions.removalTimeout);
    }
  });

  onDestroy(() => {
    clearTimeout(autoTimer);
  });

  async function handle_close(){
      open = false;
      await new Promise(r => setTimeout(r, 200));
      delToast?.();
  }

</script>
  
  
{#if open}
<div transition:fly={{ delay: toastOptions.transitionDelay, duration: toastOptions.transitionDuration, y: toastOptions.transitionY, easing: toastOptions.transitionEasing }} class="flex flex-row rounded-lg mt-2 py-0.5 h-full min-h-[4rem] shadow-lg w-full max-w-md ring-1 
  border-none pointer-events-auto text-neutral-700 {toastTypeClasses[toastType]}">
  <div class="flex flex-row gap-4 items-center w-full justify-center rounded-sm px-4">          
      
      <div class="flex flex-row items-center justify-center">
          <span class="{toastIcons[toastType]} {toastTypeIconColours[toastType]} size-8 outline-hidden"></span>
      </div>
      
      <div class="flex flex-col gap-1 rounded-sm py-2 flex-1 min-w-0">
          <p class="text-sm font-medium break-words overflow-wrap-anywhere hyphens-auto">{@html message}</p>
          {#if subMessage}
          <p class="text-xs font-light break-words whitespace-normal hyphens-auto">{@html subMessage}</p>
          {/if}
      </div>

      {#if toastOptions.closeButtonIcon}
      <button aria-label="close" class="cursor-pointer rounded-full size-6 hover:scale-105" onclick={handle_close}>
        <span class="{toastOptions.closeButtonIcon} size-6 outline-hidden text-neutral-700"></span>
      </button>
      {/if}
      
  </div>
</div>
{/if}


