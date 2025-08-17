<script lang="ts" module>
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type HamburgerProps = {
        open?: boolean;
        useCloseBtn?: boolean;
        ariaLabel?: string;
        linesClasses?: string;
        linesParentClasses?: string;
        onclick?: (event: MouseEvent) => void;
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
  import {twMerge} from 'tailwind-merge';
  
  let { open=$bindable(true), ariaLabel="menu button", linesClasses, linesParentClasses, useCloseBtn=true, onclick, ...props }: HamburgerProps = $props();

</script>

<button aria-label={ariaLabel} class={twMerge("px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-primary-focus cursor-pointer w-fit", props.class)} {onclick}>
  <div class={twMerge("flex flex-col items-center justify-center size-7 transition-all gap-2", linesParentClasses)}>
    <!-- Top bar -->
    <span class={twMerge("h-0.5 w-7 bg-primary-button transition-transform duration-300 origin-center", open && useCloseBtn ? "rotate-45 translate-y-2.5" : "", linesClasses)}></span>

    <!-- Middle bar -->
    <span class={twMerge("h-0.5 w-7 bg-primary-button transition-opacity duration-300", open && useCloseBtn ? "opacity-0" : "opacity-100", linesClasses)}></span>

    <!-- Bottom bar -->
    <span class={twMerge("h-0.5 w-7 bg-primary-button transition-transform duration-300 origin-center", open && useCloseBtn ? "-rotate-45 -translate-y-2.5" : "", linesClasses)}></span>
  </div>
</button>