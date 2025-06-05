<script lang="ts" module>
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type HamburgerProps = {
        open?: boolean;
        useCloseBtn?: boolean;
        ariaLabel: string;
        linesClasses?: string;
        onclick?: (event: MouseEvent) => void;
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
  import {twMerge} from 'tailwind-merge';
  
  let { open=$bindable(true), ariaLabel, linesClasses, useCloseBtn=true, onclick, ...props }: HamburgerProps = $props();

</script>

<!--
<button class={twMerge("p-2 rounded focus:outline-none focus:ring-2 focus:ring-focus-primary cursor-pointer w-fit", props.class)} aria-label={ariaLabel} {onclick}>    
    <div class="space-y-2">
      {#each Array(numberOfLines) as _}
      <span class={twMerge("block w-7 h-0.5 bg-button-primary", linesClasses)}></span>
      {/each}
    </div>
</button>

<button class={twMerge("p-2 rounded focus:outline-none focus:ring-2 focus:ring-focus-primary cursor-pointer w-fit", props.class)} aria-label={ariaLabel} {onclick}>
  <div class="relative w-7 h-7">   
    <span class={twMerge("absolute left-0 top-1.5 w-full h-0.5 bg-button-primary transition-all duration-300", open ? "rotate-45 top-3.5" : "")}></span>   
    <span class={twMerge("absolute left-0 top-3.5 w-full h-0.5 bg-button-primary transition-all duration-300", open ? "opacity-0" : "opacity-100")}></span>   
    <span class={twMerge("absolute left-0 bottom-1 w-full h-0.5 bg-button-primary transition-all duration-300", open ? "-rotate-45 top-3.5" : "")}></span>
  </div>
</button>
-->

<button aria-label={ariaLabel} class={twMerge("p-2 rounded focus:outline-none focus:ring-2 focus:ring-focus-primary cursor-pointer w-fit", props.class)} {onclick}>
  <div class="flex flex-col items-center justify-center size-7 transition-all gap-2">
    <!-- Top bar -->
    <span class={twMerge("h-0.5 w-7 bg-button-primary transition-transform duration-300 origin-center", open && useCloseBtn ? "rotate-45 translate-y-2.5" : "", linesClasses)}></span>

    <!-- Middle bar -->
    <span class={twMerge("h-0.5 w-7 bg-button-primary transition-opacity duration-300", open && useCloseBtn ? "opacity-0" : "opacity-100", linesClasses)}></span>

    <!-- Bottom bar -->
    <span class={twMerge("h-0.5 w-7 bg-button-primary transition-transform duration-300 origin-center", open && useCloseBtn ? "-rotate-45 -translate-y-2.5" : "", linesClasses)}></span>
  </div>
</button>