<script lang="ts" module>    
	  import { onDestroy, onMount, type Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import { fade } from 'svelte/transition';
    import {twMerge} from 'tailwind-merge';
    
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
  let {disableBodyScroll=true, transitionDuration=0, ariaLabel="Modal", onclick, children, ...props}: OverlayProps = $props();

  const lockScroll = () => document.body.style.overflow = 'hidden';
  const unlockScroll = () => document.body.style.overflow = '';

  onMount(() => {
		lockScroll();
	});

  onDestroy(() => {
    unlockScroll();
  });

</script>

<div transition:fade={{duration: transitionDuration}} class={twMerge("fixed top-0 left-0 right-0 bottom-0 bg-overlay-primary", props.class)} role="presentation" {onclick}></div>

