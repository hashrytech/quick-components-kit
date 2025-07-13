<script lang="ts" module>
	  import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';
    import {twMerge} from 'tailwind-merge';
    
    export type CheckBoxProps = {
      id: string;
      name?: string;
      label?: string;
      disabled?: boolean;
      checked?: boolean;
      value?: any;
      group?: any[];
      labelPosition?: "left" | "right";
      size?: "sm" | "md" | "lg";
      children?: Snippet;
      icon?: Snippet;
      onclick?: (event: Event) => void;
      onchange?: (event: Event) => void;
      labelClass?: ClassNameValue;
      class?: ClassNameValue;
    };

</script>

<script lang="ts"> 

  let {id, name, label="", labelPosition="right", checked=$bindable(false), value, group=$bindable(), size="md", disabled=$bindable(false), onclick, onchange, labelClass, ...props}: CheckBoxProps = $props();

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

</script>

<label for={id} class="flex items-center gap-2 cursor-pointer select-none">
  {#if labelPosition === "left"}<span class={twMerge("text-sm", labelClass)}>{label}</span>{/if}
  <input {id} name={name ? name : id} type="checkbox" bind:checked {group} {disabled} {value} class={twMerge("rounded focus:ring-2 ring-primary-focus text-primary-input-accent accent-primary-input-accent cursor-pointer", 
    checked === true ? "border-primary-input-accent" : "border-primary-input-border", sizeMap[size], props.class)} {onclick} {onchange} />
  {#if labelPosition === "right"}<span class={twMerge("text-sm", labelClass)}>{label}</span>{/if}
</label>
