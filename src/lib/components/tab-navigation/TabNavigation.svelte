<!--
@component TabNavigation

A horizontal tab-style navigation bar that renders a list of links. The active
link is underlined with the primary accent colour.

## Props

- `links: TabNavigationLink[]` — Required. Array of `{ text, href, active }` objects.
- `preload?: boolean = true` — Whether SvelteKit preloads data on hover.
- `reload?: boolean = false` — Whether SvelteKit does a full page reload on click.
- `divClasses?: ClassNameValue` — Extra classes on the outer wrapping `<div>`.
- `class?: ClassNameValue` — Extra classes applied to each `<a>` link.

## Example

```svelte
<script>
  import { TabNavigation } from '$lib/components/tab-navigation';
  const links = [
    { text: 'Overview', href: '/overview', active: true },
    { text: 'Settings', href: '/settings', active: false },
  ];
</script>

<tabnavigation {links} />
```
-->

<script lang="ts" module>
    import { twMerge } from "tailwind-merge";
    import type { ClassNameValue } from 'tailwind-merge';

    export type TabNavigationLink = {
      text: string;
      href: string;
      active: boolean;
    };

    export type TabNavigationProps = {
      links: TabNavigationLink[];
      preload?: boolean;
      reload?: boolean;
      divClasses?: ClassNameValue;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">
    let { links=$bindable(), preload=true, reload=false, divClasses, ...props }: TabNavigationProps = $props();
</script>

<div class={twMerge("flex flex-row flex-wrap gap-4 justify-start xxxs:justify-center items-start py-2 px-4 mt-8 font-semibold", divClasses)}>
    {#each links as link}
    <a class={twMerge("px-4 py-1 hover:border-primary-input-accent/40 hover:border-b-2 text-neutral-800 bg-transparent hover:bg-transparent rounded-none", link.active ? "border-primary-input-accent border-b-2": "", props.class)}
        data-sveltekit-reload={reload} data-sveltekit-preload-data={preload ? 'hover' : false}
        aria-current={link.active ? 'page' : undefined}
        href={link.href}>
        {link.text}
    </a>
    {/each}
</div>