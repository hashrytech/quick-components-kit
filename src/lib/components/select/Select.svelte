<script lang="ts" module>
  import type { ClassNameValue } from 'tailwind-merge';
  import type { Snippet } from 'svelte';

  export type Option = {
    value: string | number;
    label: string;
    disabled?: boolean;
  };

  export type SelectProps = {
    id: string;
    name?: string;
    label?: string;
    disabled?: boolean;
    value?: string | number;
    options: Option[];
    size?: "sm" | "md" | "lg";
    labelPosition?: "left" | "top" | "right" | "bottom";
    class?: ClassNameValue;
    labelClass?: ClassNameValue;
    optionsClass?: ClassNameValue;
    icon?: Snippet;
    onchange?: (event: Event) => void;
  };
</script>

<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  let { id, name, label = "", labelPosition = "top", value = $bindable(), options=$bindable([]), size = "md", disabled = $bindable(false), labelClass, optionsClass, onchange, ...restProps}: SelectProps = $props();

  const sizeMap = {
    sm: "text-sm py-1 px-2 h-8",
    md: "text-base py-2 px-3 h-10",
    lg: "text-lg py-3 px-4 h-12",
  };

  const directionClass = {
    top: "flex-col gap-1",
    bottom: "flex-col-reverse gap-1",
    left: "flex-row items-center gap-2",
    right: "flex-row-reverse items-center gap-2",
  };
</script>

<div class={twMerge("flex", directionClass[labelPosition] ?? directionClass.top)}>
  {#if label}
    <label for={id} class={twMerge("text-sm font-medium text-primary-label-text ml-1", labelClass)}>{label}</label>
  {/if}

  <select {id} name={name ?? id} bind:value {disabled} onchange={onchange} 
    class={twMerge("rounded-primary border border-primary-input-border focus:border-primary-focus focus:ring-primary-focus placeholder:opacity-50 disabled:bg-neutral-300/30 disabled:border-neutral-300/30",
    sizeMap[size], restProps.class)}>
    {#each options as option}
      <option value={option.value} disabled={option.disabled} class={twMerge("", optionsClass)}>
        {option.label}
      </option>
    {/each}
  </select>
</div>
