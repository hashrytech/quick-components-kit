<!--
@component ToastContainer

A fixed-position container that hosts `Toast` components injected by `showToast()` and its
convenience wrappers (`successToast`, `failToast`, etc.). Place once near the root of your
layout.

## Props

- `position?: ToastPosition = 'top-right'` — Screen corner / edge. One of:
  `'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'`.
- `id?: string = 'toast_area'` — Element id. Must match the `target` used in `showToast()`.
- `reverseFlex?: boolean = false` — Reverses the stack order (newest toast at the top).

## Example

Place once in your root layout:

```
import { ToastContainer, successToast } from '$lib/components/toast';
```

```svelte
<toastcontainer position="top-right" />
<button onclick={() => successToast('Saved!', 'Changes saved.')}>Save</button>
```
-->

<script lang="ts">
  import type { ToastPosition } from './Toast.svelte';

  let { position = 'top-right', id = "toast_area", reverseFlex = false }: { position?: ToastPosition, id?: string, reverseFlex?: boolean } = $props();
  
  // Position classes using Tailwind
  const positionClasses: Record<ToastPosition, string> = {
    'top-left': 'top-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0 flex-col-reverse',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse',
    'bottom-right': 'bottom-0 right-0 flex-col-reverse'
  };
  
</script>

<div {id} class="fixed z-[9999] flex {reverseFlex ? 'flex-col-reverse' : 'flex-col'} gap-3 p-4 pointer-events-none {positionClasses[position]}">
  
</div>

<style>
  /* Responsive adjustments */
  @media (max-width: 640px) {
    div {
      left: 0 !important;
      right: 0 !important;
      transform: none !important;
      align-items: center;
    }
    
    div :global(> *) {
      width: calc(100% - 2rem);
      max-width: 400px;
    }
  }
</style>