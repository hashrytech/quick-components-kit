<script lang="ts" module>
	import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';	   
    
    export type TableColProps = {
        children: Snippet
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    let { children, ...props }: TableColProps = $props();

</script>

<td class={twMerge("text-left align-middle p-2.5 bg-inherit", props.class)}>{@render children?.()}</td>