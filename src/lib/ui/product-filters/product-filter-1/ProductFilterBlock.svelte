

<script lang="ts">
  import Checkbox from "$lib/components/checkbox/Checkbox.svelte";
	import { twMerge, type ClassNameValue } from "tailwind-merge";
  //import { twMerge } from "tailwind-merge";
  import type { ProductFilter1List } from "./ProductFilter1.svelte";
  import { slide } from "svelte/transition";

  let { open=$bindable(false), filter=$bindable(), expandAlways=false, showCounts=true, countsClass, selectedValues=$bindable([]), onFilter }: 
    {open?: boolean, filter: ProductFilter1List, expandAlways?: boolean, showCounts?: boolean, countsClass?: ClassNameValue, selectedValues?: {key: string, value: string}[], onFilter?: (key: string, value: string) => void } = $props();

  /*let hasKeyValue = $derived.by(() => {
    return selectedValues?.some(item => item.key === filter.title && item.value === value);
  }); */

  function hasSelectedValue(arr: { key: string; value: string }[] | undefined, key: string, value: string): boolean {
    return !!arr?.some(item => item.key === key && item.value === value);
  }


</script>

<div class="flex flex-col gap-4 pb-4">
    <button class="flex flex-row justify-between items-center ml-1 cursor-pointer" onclick={() => open = !open}>
        <h4 class="truncate font-medium text-neutral-700">{filter.title}</h4>
        {#if !expandAlways}
        {#if open}
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-neutral-500" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11V13H19V11H5Z"></path></svg>
        {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-neutral-500" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>
        {/if}
        {/if}
    </button>

    {#if open}
    <div transition:slide={{ duration: 100, axis: "y" }} class="flex flex-col gap-2 ml-1.5">
        {#each filter.values as keyValue}
        {@const isChecked = hasSelectedValue(selectedValues, filter.title, keyValue.value)}
        <div class="flex flex-row gap-2 items-center">
          <Checkbox checked={isChecked} id={keyValue.key} value={keyValue.value} label={keyValue.value} class="size-4" onchange={()=> onFilter?.(filter.title, keyValue.value)} />
          {#if showCounts}
          <p class={twMerge("text-sm", countsClass)}>({keyValue.count})</p>
          {/if}
        </div>
        {/each}
    </div>
    {/if}
</div>