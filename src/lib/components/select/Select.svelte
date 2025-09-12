<script lang="ts" module>
  import type { ClassNameValue } from 'tailwind-merge';
  import type { Snippet } from 'svelte';

  export type Option = {
    value: string | number;
    key: string;
    disabled?: boolean;
  };

  export type SelectProps = {
    id: string;
    name?: string;
    labelText?: string;
    disabled?: boolean;
    value?: string | number;
    options?: Option[];
    size?: "sm" | "md" | "lg";
    labelPosition?: "left" | "top" | "right" | "bottom";
    class?: ClassNameValue;
    labelClass?: ClassNameValue;
    firstDivClass?: ClassNameValue;
    secondDivClass?: ClassNameValue;
    optionsClass?: ClassNameValue;
    error?: string;
    label?: Snippet;
    optionsSnippet?: Snippet;
    icon?: Snippet;
    onchange?: (event: Event) => void;
  };
</script>

<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  let { 
    id, 
    name, 
    label,
    labelText = "", 
    labelPosition = "right", 
    value = $bindable(), 
    options=$bindable([]), 
    size = "md", 
    disabled = $bindable(false), 
    firstDivClass,
    secondDivClass,
    labelClass, 
    optionsClass, 
    error, 
    onchange, 
    icon, 
    optionsSnippet, 
    ...restProps}: SelectProps = $props();

  const sizeMap = {
    sm: "text-sm py-1 h-[2.05rem]",
    md: "text-base py-2 h-[2.375rem]",
    lg: "text-lg py-3 h-[2.8rem]",
  };

  const directionClass = {
    top: "flex-col gap-1",
    bottom: "flex-col-reverse gap-1",
    left: "flex-row items-center gap-2",
    right: "flex-row-reverse items-center gap-2",
  };
</script>

<div class={twMerge("flex flex-col gap-1", firstDivClass)}>
  <div class={twMerge("flex", directionClass[labelPosition] ?? directionClass.top, secondDivClass)}>
    {#if label}
      {@render label()}
    {:else}
      {#if labelText}
      <label for={id} class={twMerge("text-sm font-medium text-primary-label-text ml-1 w-full", labelClass)}>{labelText}</label>
      {/if}
    {/if}

    <select {id} name={name ?? id} bind:value {disabled} onchange={onchange} 
      class={twMerge("rounded-primary border border-primary-input-border focus:border-primary-focus focus:ring-primary-focus placeholder:opacity-50 disabled:bg-neutral-300/30 disabled:border-neutral-300/30",
      sizeMap[size], error ? "bg-red-50 border-red-300" : "", restProps.class)}>
      {@render optionsSnippet?.()}
      {#each options as option}
        <option value={option.value} disabled={option.disabled} class={twMerge("", optionsClass)}>
          {option.key}
        </option>
      {/each}
    </select>
  </div>
  {#if error}
    <p class="text-sm text-red-500 mt-0.5 bg-red-100/30 px-2 rounded-primary">{error}</p>
  {/if}
</div>
