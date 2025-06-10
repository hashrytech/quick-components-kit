<script lang="ts" module>
	  import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type ButtonProps = {
        children?: Snippet;
        icon?: Snippet;
        onclick?: (event: MouseEvent) => void;
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
  import {twMerge} from 'tailwind-merge';
  
  let {children, icon, onclick, ...props}: ButtonProps = $props();

</script>

<button class={twMerge("flex flex-row items-center gap-2 px-4 py-2 bg-button-primary hover:bg-button-primary-hover rounded-primary w-fit cursor-pointer text-white focus:outline-focus-primary", props.class)}
  {onclick}>
  {#if icon}<span class="w-10">{@render icon()}</span>{/if}
  {@render children?.()}
</button>

