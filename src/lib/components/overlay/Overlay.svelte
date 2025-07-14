<script lang="ts" module>    
	  import { type Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import { fade } from 'svelte/transition';
    import {twMerge} from 'tailwind-merge';
    import { disableScroll } from '$lib/actions/disable-scroll.js';    
	  import { config } from '$lib/configs/config.js';
    
    export type OverlayProps = {
      disableBodyScroll?: boolean;
      ariaLabel?: string;
      transitionDuration?: number;
      children?: Snippet;
      onclick?: (event: Event) => void;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">
  let { disableBodyScroll=true, transitionDuration=config.transitionDuration, ariaLabel="Overlay", onclick, children, ...props }: OverlayProps = $props();
</script>

<div  transition:fade={{duration: transitionDuration}} class={twMerge("fixed inset-0 bg-primary-overlay", props.class)} role="presentation" {onclick} use:disableScroll={disableBodyScroll} >
  {@render children?.()}
</div>

