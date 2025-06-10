<script lang="ts" module>
	  import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import {twMerge} from 'tailwind-merge';
    
    export type RadioProps = {
        id: string;
        name?: string;
        label?: string;
        disabled?: boolean;
        value?: any;
        group?: any;
        labelPosition?: "left" | "right";
        size?: "sm" | "md" | "lg";
        children?: Snippet;
        icon?: Snippet;
        onclick?: (event: MouseEvent) => void;
        labelClass?: ClassNameValue;
        class?: ClassNameValue;
    };

</script>

<script lang="ts"> 

  let {id, name, label="", labelPosition="right", value=$bindable(), group=$bindable(), size="md", disabled=$bindable(false), onclick, labelClass, ...props}: RadioProps = $props();

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

</script>

<label for={id} class="inline-flex items-center gap-2 cursor-pointer select-none">
  {#if labelPosition === "left"}<span class={twMerge("text-sm", labelClass)}>{label}</span>{/if}
  <input {id} name={name ? name : id} type="radio" bind:value bind:group {disabled} class={twMerge("border-border-primary focus:ring-2 ring-focus-primary text-button-primary accent-button-primary cursor-pointer", 
    sizeMap[size], props.class)} />
  {#if labelPosition === "right"}<span class={twMerge("text-sm", labelClass)}>{label}</span>{/if}
</label>
