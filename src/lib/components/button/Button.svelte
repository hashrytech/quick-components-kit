<script lang="ts" module>
	  import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type ButtonProps = {
        disabled?: boolean;
        children?: Snippet;
        icon?: Snippet;
        activeIcon?: Snippet;
        onclick?: (event: MouseEvent) => void;
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
  import {twMerge} from 'tailwind-merge';
  
  let { disabled=$bindable(), children, icon, activeIcon, onclick, ...props }: ButtonProps = $props();

</script>

<button {disabled} class={twMerge("flex flex-row items-center gap-2 px-4 py-2 focus:outline-primary-focus bg-primary-button hover:bg-primary-button-hover rounded-primary cursor-pointer focus:ring-primary-focus focus:ring", 
  "disabled:bg-primary-button/60 disabled:cursor-default", props.class)}
  {onclick}>
  {#if activeIcon}
  <span>{@render activeIcon()}</span>
  {:else if icon}
  <span>{@render icon()}</span>
  {/if}
  {@render children?.()}
</button>

