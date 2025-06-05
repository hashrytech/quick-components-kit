<script lang="ts" module>
    import { fade, fly, slide } from 'svelte/transition';
	  import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type ButtonProps = {
      open?: boolean;
      transitionDuration?: number;
      transitionDistance?: number;
      transitionPosition?: "left-0" | "right-0";
      overlayClasses?: string;
      children?: Snippet;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">
  import {twMerge} from 'tailwind-merge';
  
  let {open=$bindable(false), transitionPosition="left-0", transitionDuration=200, transitionDistance=-240, overlayClasses="", children, ...props}: ButtonProps = $props();

</script>

{#if open}
<!-- Overlay -->
<div transition:fade={{duration: transitionDuration}} class={twMerge("fixed inset-0 bg-neutral-700/80", overlayClasses)} role="presentation" onclick={() => open = false}></div>

<aside class={twMerge("fixed top-0 flex flex-col items-center gap-2 bg-white w-60 h-screen", transitionPosition, props.class)}
  in:fly={{ x: transitionDistance, duration: transitionDuration }}
  out:fly={{ x: transitionDistance, duration: transitionDuration }}>
  {@render children?.()}
</aside>
{/if}

