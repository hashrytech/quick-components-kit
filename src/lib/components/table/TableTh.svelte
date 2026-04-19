<!--
@component TableTh

A styled `<th scope="col">` header cell for use inside a `Table` headings snippet.

## Props

- `children: Snippet` — Required. Header cell content.
- `class?: ClassNameValue` — Extra classes on the `<th>` element.

## Example

```svelte
{#snippet headings()}
  <th>ID</th>
  <th>Name</th>
{/snippet}
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';

    export type TableThProps = {
        children: Snippet
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    let { children, ...props }: TableThProps = $props();

</script>

<th scope="col" class={twMerge("p-3 text-left uppercase font-semibold bg-inherit", props.class)}>{@render children?.()}</th>