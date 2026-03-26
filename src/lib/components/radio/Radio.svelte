<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { ClassNameValue } from 'tailwind-merge';
  import { twMerge } from 'tailwind-merge';

  export type RadioProps = Omit<HTMLInputAttributes, 'size' | 'type' | 'class'> & {
    id: string;
    label?: string;
    group?: unknown;
    labelPosition?: 'left' | 'right' | 'top' | 'bottom';
    size?: 'sm' | 'md' | 'lg';
    children?: Snippet;
    icon?: Snippet;
    labelClass?: ClassNameValue;
    class?: ClassNameValue;
    containerClass?: ClassNameValue;
  };

</script>

<script lang="ts"> 

  let {
    id,
    name,
    label = "",
    labelPosition = "right",
    value = $bindable(),
    group = $bindable(),
    size = "md",
    disabled = $bindable(false),
    containerClass,
    labelClass,
    class: className,
    ...inputProps
  }: RadioProps = $props();

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
  {#if labelPosition === "left" || labelPosition === "top"}
    <span class={twMerge("text-sm", labelClass)}>{label}</span>
  {/if}
  <input {...inputProps} {id} name={name ? name : id} type="radio" {value} bind:group {disabled} 
    class={twMerge("focus:ring-2 ring-primary-focus text-primary-input-accent accent-primary-input-accent cursor-pointer",
    group === value ? "border-primary-input-accent" : "border-primary-input-border", sizeMap[size], className)} />
  {#if labelPosition === "right" || labelPosition === "bottom"}
    <span class={twMerge("text-sm", labelClass)}>{label}</span>
  {/if}
</label>
