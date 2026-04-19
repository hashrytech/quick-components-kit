<!--
@component LinkButton

An `<a>` element styled as a primary button. Passes all native anchor attributes through.

## Props

- `href: string` — Required. The link destination.
- `preload?: boolean = true` — Whether SvelteKit preloads data on hover.
- `reload?: boolean = false` — Whether SvelteKit does a full page reload.
- `children?: Snippet` — Button label content.
- `icon?: Snippet` — Optional icon rendered before the label.
- `class?: ClassNameValue` — Extra classes on the `<a>` element.

All other native `<a>` attributes (`target`, `rel`, `download`, `aria-*`, etc.) are forwarded.

## Example

```svelte
<!-- Basic usage -->
<a href="/dashboard">Go to Dashboard</a>

<!-- External link — target and rel are forwarded via spread -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">Open</a>
```
-->

<script lang="ts" module>
    import type { Snippet } from 'svelte';
    import type { HTMLAnchorAttributes } from 'svelte/elements';
    import type { ClassNameValue } from 'tailwind-merge';

    type ForwardedAnchorProps = Omit<HTMLAnchorAttributes, 'class' | 'href'>;

    export type LinkButtonProps = ForwardedAnchorProps & {
      preload?: boolean;
      reload?: boolean;
      href: string;
      children?: Snippet;
      icon?: Snippet;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">
  import {twMerge} from 'tailwind-merge';

  let {href, preload=true, reload=false, children, icon, class: className, ...props}: LinkButtonProps = $props();

</script>

<a {href} data-sveltekit-reload={reload} data-sveltekit-preload-data={preload ? 'hover' : false}
  class={twMerge("flex flex-row items-center gap-2 px-4 py-2 bg-primary-button hover:bg-primary-button-hover rounded-primary w-fit cursor-pointer text-white focus:outline-focus-primary", className)}
  {...props}>
  {#if icon}<span class="w-10">{@render icon()}</span>{/if}
  {@render children?.()}
</a>
