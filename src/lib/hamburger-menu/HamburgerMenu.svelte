<script lang="ts" module>
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type ButtonProps = {
        open?: boolean;
        ariaLabel: string;
        linesClasses?: string;
        numberOfLines?: number;
        onclick?: (event: MouseEvent) => void;
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
  import {twMerge} from 'tailwind-merge';
  
  let { open=$bindable(true), ariaLabel, linesClasses, numberOfLines=3, onclick, ...props }: ButtonProps = $props();

</script>

<button class={twMerge("p-2 rounded focus:outline-none focus:ring-2 focus:ring-focus-primary cursor-pointer relative w-fit", props.class)} aria-label={ariaLabel} {onclick}>
    <!-- Icon -->
    <div class="space-y-2">
      {#each Array(numberOfLines) as _}
      <span class={twMerge("block w-7 h-0.5 bg-button-primary", linesClasses)}></span>
      {/each}
    </div>
</button>

