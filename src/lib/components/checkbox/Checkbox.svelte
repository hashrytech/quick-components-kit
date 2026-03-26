<script lang="ts" module>
	  import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
    import type { ClassNameValue } from 'tailwind-merge';
    import {twMerge} from 'tailwind-merge';
    
    export type CheckBoxProps = Omit<HTMLInputAttributes, 'size' | 'type' | 'class'> & {
      id: string;
      name?: string;
      label?: string;
      disabled?: boolean;
      checked?: boolean;
      value?: unknown;
      group?: unknown[];
      labelPosition?: "left" | "right" | "top" | "bottom";
      size?: "sm" | "md" | "lg";
      children?: Snippet;
      icon?: Snippet;
      labelClass?: ClassNameValue;
      class?: ClassNameValue;
      containerClass?: ClassNameValue;
    };

</script>

<script lang="ts"> 

  let {id, name, label="", labelPosition="right", checked=$bindable(false), value, group=$bindable(), size="md", disabled=$bindable(false), labelClass, class: className, containerClass, ...inputProps}: CheckBoxProps = $props();

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const directionClass = {
    left: 'flex-row',
    right: 'flex-row',
    top: 'flex-col',
    bottom: 'flex-col',
  };

  const alignmentClass = {
    left: 'items-center',
    right: 'items-center',
    top: 'items-start',
    bottom: 'items-start',
  };

</script>

<label for={id} class={twMerge("flex gap-2 cursor-pointer select-none", directionClass[labelPosition], alignmentClass[labelPosition], containerClass)}>
  {#if labelPosition === "left" || labelPosition === "top"}<span class={twMerge("text-sm", labelClass)}>{label}</span>{/if}
  <input {id} {...inputProps} name={name ? name : id} type="checkbox" bind:checked {group} {disabled} {value} class={twMerge("rounded focus:ring-2 ring-primary-focus text-primary-input-accent accent-primary-input-accent cursor-pointer", 
    checked === true ? "border-primary-input-accent" : "border-primary-input-border", sizeMap[size], className)} />
  {#if labelPosition === "right" || labelPosition === "bottom"}<span class={twMerge("text-sm", labelClass)}>{label}</span>{/if}
</label>
