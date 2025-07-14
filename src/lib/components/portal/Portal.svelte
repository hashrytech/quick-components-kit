<!--
@component Portal

A utility component that renders its children outside the current DOM hierarchy by appending or prepending them into a target DOM element (e.g., `document.body`). Useful for modals, drawers, toasts, and overlays to avoid z-index and layout conflicts.

## Props

- `target?`: `HTMLElement` — The DOM node to render the content into. Defaults to `document.body` if not provided. Useful for directing content to a specific container.
- `append?: boolean` — If true (default), the portal will be appended to the end of the target node. If false, it will be prepended to the begining. This controls the render order of layered content.
- `children?`: `Snippet` — The Svelte children content to render inside the portal. Use `{@render}` to render dynamic fragments.
- `class?`: `ClassNameValue` — Tailwind CSS or custom classes applied to the outer container div.

## Behavior

- On mount, a new `div` is created and prepended to the `target`.
- On destroy, the element is removed from the DOM.
- Children are rendered via `{@render children?.()}` to support dynamic content blocks.

## Usage

```svelte
<script lang="ts">
  import Portal from './Portal.svelte';
  let show = true;
</script>

{#if show}
  <Portal>
    <div class="absolute top-0 left-0 h-screen w-screen bg-black/50 z-50">
      <div class="bg-white p-6 rounded shadow">Hello from Portal!</div>
    </div>
  </Portal>
{/if}
```
-->

<script lang="ts" module>    
	import { type Snippet } from 'svelte';
  import type { ClassNameValue } from 'tailwind-merge';    
  import {twMerge} from 'tailwind-merge';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  
  export type PortalProps = {
    target?: HTMLElement;
    append?: boolean;    
    children?: Snippet;
    class?: ClassNameValue;
  };

</script>

<script lang="ts">
  let { target = browser ? document.body : undefined, append = true, children, ...props }: PortalProps = $props();  
  let el: HTMLDivElement;

  onMount(() => {    
    if (!browser || !el) return;
    if(append)
        target?.append(el);
    else        
      target?.prepend(el);
  });

  onDestroy(() => {
    el?.remove();
  });
</script>

<!-- This div will be appended to `target` -->
<div bind:this={el} class={twMerge("", props.class)}>
  {@render children?.()}
</div>