<script lang="ts" module>
    import type { ClassNameValue } from 'tailwind-merge';
    /**
     * Props for the Icon component. See instructions: https://iconify.design/docs/usage/css/tailwind/tailwind4/
     *
     * @prop {string} icon - The icon string to be used in the span, example: icon-[ion--add-circle]     
     * @prop {() => void} [onclick] - Event handler for click events.
     * @prop {Snippet} [class] - Css classes for the input element.
     */
    export type IconProps = {
        icon: string;
        onclick?: (event: MouseEvent) => void;
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
  import {twMerge} from 'tailwind-merge';
  
  let { icon, onclick, ...restProps }: IconProps = $props();

</script>

<span class={twMerge("block shrink-0", icon, restProps.class)}></span>


