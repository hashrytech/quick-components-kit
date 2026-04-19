<!--
@component HamburgerMenu

An animated three-line hamburger button that morphs into an × close icon when `open` is true.

## Props

- `open?: boolean = false` — Whether the menu is currently open. Bindable. Controls the animated state.
- `useCloseBtn?: boolean = true` — When true, the bars animate to an × when `open` is true.
- `ariaLabel?: string = 'menu button'` — Accessible label for the button.
- `linesClasses?: string` — Extra classes applied to each bar `<span>`.
- `linesParentClasses?: string` — Extra classes applied to the flex container of the bars.
- `onclick?: (event: MouseEvent) => void` — Click handler.
- `class?: ClassNameValue` — Extra classes on the `<button>` element.

## Example

```svelte
<script>
  import { HamburgerMenu } from '$lib/components/hamburger-menu';
  let open = $state(false);
</script>

<HamburgerMenu bind:open onclick={() => (open = !open)} />
```
-->

<script lang="ts" module>
    import type { ClassNameValue } from 'tailwind-merge';

    export type HamburgerProps = {
        open?: boolean;
        useCloseBtn?: boolean;
        ariaLabel?: string;
        linesClasses?: string;
        linesParentClasses?: string;
        onclick?: (event: MouseEvent) => void;
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
  import {twMerge} from 'tailwind-merge';

  let { open=$bindable(false), ariaLabel="menu button", linesClasses, linesParentClasses, useCloseBtn=true, onclick, ...props }: HamburgerProps = $props();

</script>

<button type="button" aria-label={ariaLabel} aria-expanded={open} class={twMerge("px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-primary-focus cursor-pointer w-fit", props.class)} {onclick}>
  <div class={twMerge("flex flex-col items-center justify-center size-7 transition-all gap-2", linesParentClasses)}>
    <!-- Top bar -->
    <span class={twMerge("h-0.5 w-7 bg-primary-button transition-transform duration-300 origin-center", open && useCloseBtn ? "rotate-45 translate-y-2.5" : "", linesClasses)}></span>

    <!-- Middle bar -->
    <span class={twMerge("h-0.5 w-7 bg-primary-button transition-opacity duration-300", open && useCloseBtn ? "opacity-0" : "opacity-100", linesClasses)}></span>

    <!-- Bottom bar -->
    <span class={twMerge("h-0.5 w-7 bg-primary-button transition-transform duration-300 origin-center", open && useCloseBtn ? "-rotate-45 -translate-y-2.5" : "", linesClasses)}></span>
  </div>
</button>