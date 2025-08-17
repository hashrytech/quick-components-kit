<script lang="ts" module>
    import type { ClassNameValue } from 'tailwind-merge';

    export type ProductFilter1List = {
      title: string;
      values: ProductFilter1Value[];
    };

    export type ProductFilter1Value = {
      key: string;
      value: string;
      count?: number;
    };

    export type ProductFilter1Props = {
      filters: ProductFilter1List[];
      path?: string;
      startExpanded?: boolean;
      expandAlways?: boolean;
      selectedValues?: {key: string, value: string}[];
      showCounts?: boolean;
      onFilter?: (key: string, value: string) => void;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">
  import { twMerge } from "tailwind-merge";
  import ProductFilterBlock from './ProductFilterBlock.svelte';

  let { filters=$bindable([]), expandAlways=false, startExpanded=true, selectedValues=$bindable([]), showCounts=false, path="/products", onFilter, ...restProps }: ProductFilter1Props = $props();

</script>

<div class={twMerge("", restProps.class)}>
    <div class={twMerge("w-64 flex flex-col space-y-4 p-2 divide-y divide-neutral-300")}>
      {#each filters as filter}
      <ProductFilterBlock filter={filter} open={startExpanded} {expandAlways} {onFilter} bind:selectedValues {showCounts} />
      {/each}
    </div>
</div>
