<script lang="ts" module>
	  import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type ButtonProps = {
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
  
  let {href, preload=true, reload=false, children, icon, ...props}: ButtonProps = $props();

</script>

<a {href} data-sveltekit-reload={reload} data-sveltekit-preload-data={preload ? 'hover' : false} class={twMerge("flex flex-row items-center gap-2 px-4 py-2 bg-button-primary hover:bg-button-primary-hover rounded-primary w-fit cursor-pointer text-white focus:outline-focus-primary", props.class)}>
  {#if icon}<span class="w-10">{@render icon()}</span>{/if}
  {@render children?.()}
</a>

