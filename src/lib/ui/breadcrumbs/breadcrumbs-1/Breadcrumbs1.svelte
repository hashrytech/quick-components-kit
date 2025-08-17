<script lang="ts">
	import { twMerge, type ClassNameValue } from "tailwind-merge";
  let {filters=$bindable([]), onRemove, onClear, ...restProps}:
    { 
      filters: { key: string; value: string }[]; 
      onRemove: (key: string, value: string) => void; 
      onClear: () => void; 
      class?: ClassNameValue; 
    } = $props();

</script>

<nav aria-label="Breadcrumb filters" class={twMerge("flex flex-wrap items-center gap-2 text-sm", restProps.class)}>

  <!-- Dynamic filters -->
  {#if filters.length > 0}
    {#each filters as { key, value }}
      <button class="flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-neutral-700 hover:bg-neutral-200 cursor-pointer break-all" onclick={() => onRemove?.(key, value)}>
        <span class="capitalize text-neutral-600">{key}:</span>
        <span class="font-medium">{value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 text-neutral-500 shrink-0">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 
              01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    {/each}
    <!-- Clear all -->    
    <button class="text-red-600 hover:underline cursor-pointer" onclick={onClear}>Clear all</button>
  {/if}
</nav>
