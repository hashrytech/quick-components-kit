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

<th scope="col" class={twMerge("p-3 text-left uppercase font-semibold", props.class)}>{@render children?.()}</th>