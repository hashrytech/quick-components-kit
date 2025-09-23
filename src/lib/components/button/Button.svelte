<script lang="ts" module>
	  import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type ButtonProps = {
        disabled?: boolean;
        children?: Snippet;
        icon?: Snippet;
        loadingIcon?: Snippet;
        loading?: boolean;
        onclick?: (event: MouseEvent) => void;
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
  import {twMerge} from 'tailwind-merge';
  
  let { disabled=$bindable(), loading=$bindable(false), children, icon, loadingIcon, onclick, ...props }: ButtonProps = $props();

</script>

<button {disabled} class={twMerge("flex flex-row items-center gap-2 px-4 py-2 focus:outline-primary-focus bg-primary-button hover:bg-primary-button-hover rounded-primary cursor-pointer focus:ring-primary-focus focus:ring", 
  "disabled:bg-primary-button/60 disabled:cursor-default", props.class)}
  {onclick}>  
  {#if loadingIcon && loading}
  <span class="shrink-0 animate-spin font-semibold">{@render loadingIcon()}</span>
  {:else if icon}
  {@render icon()}
  {/if}
  {@render children?.()}
</button>

