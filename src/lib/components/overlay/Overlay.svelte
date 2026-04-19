<!--
@component Overlay

A full-screen fixed overlay with a fade transition. Used as the backdrop behind
modals and drawers. Optionally locks body scroll while visible.

## Props

- `disableBodyScroll?: boolean = true` — Locks `<body>` scroll while the overlay is mounted.
- `transitionDuration?: number` — Fade duration in ms. Defaults to the global `config.transitionDuration`.
- `children?: Snippet` — Optional content rendered on top of the backdrop.
- `onclick?: (event: Event) => void` — Click handler (typically closes the parent modal/drawer).
- `class?: ClassNameValue` — Extra classes on the overlay `<div>`.

## Example

```svelte
<script>
  import { Overlay } from '$lib/components/overlay';
  let open = $state(false);
</script>

{#if open}
  <overlay onclick={() => (open = false)} />
{/if}
```
-->

<script lang="ts" module>
	  import { type Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import { fade } from 'svelte/transition';
    import {twMerge} from 'tailwind-merge';
    import { disableScroll } from '$lib/actions/disable-scroll.js';
	  import { config } from '$lib/configs/config.js';

    export type OverlayProps = {
      disableBodyScroll?: boolean;
      transitionDuration?: number;
      children?: Snippet;
      onclick?: (event: Event) => void;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">
  let { disableBodyScroll=true, transitionDuration=config.transitionDuration, onclick, children, ...props }: OverlayProps = $props();
</script>

<div transition:fade={{duration: transitionDuration}} class={twMerge("fixed inset-0 bg-primary-overlay", props.class)} role="presentation" {onclick} use:disableScroll={disableBodyScroll} >
  {@render children?.()}
</div>
