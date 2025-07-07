<script lang="ts" module>    
	  import { type Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import { fade } from 'svelte/transition';
    import {twMerge} from 'tailwind-merge';
    import { disableScroll } from '$lib/actions/disable-scroll.js';    
    
    export type OverlayProps = {
      disableBodyScroll?: boolean;
      ariaLabel?: string;
      transitionDuration?: number;
      children?: Snippet;
      onclick?: (event: MouseEvent) => void;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">
  let { disableBodyScroll=true, transitionDuration=100, ariaLabel="Overlay", onclick, children, ...props }: OverlayProps = $props();
</script>

<div transition:fade={{duration: transitionDuration}} class={twMerge("fixed top-0 left-0 right-0 bottom-0 bg-overlay-primary z-40", props.class)} role="presentation" {onclick} use:disableScroll={disableBodyScroll}>
  {@render children?.()}
</div>

