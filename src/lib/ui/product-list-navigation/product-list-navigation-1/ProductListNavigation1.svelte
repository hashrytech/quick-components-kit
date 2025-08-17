<script lang="ts" module>
	import Select from '$lib/components/select/Select.svelte';
	import Breadcrumbs1 from '$lib/ui/breadcrumbs/breadcrumbs-1/Breadcrumbs1.svelte';
  import type { ClassNameValue } from 'tailwind-merge';

  export type ProductListNavigation1Props = {
    filters: { key: string; value: string }[];
    searchTerm: string;
    class?: ClassNameValue;
  };

  /*let filters = $state([
    { key: 'brand', value: 'Nike' },
    { key: 'category', value: 'Shoes' },
    { key: 'size', value: '10' },
    { key: 'color', value: 'Red' },
    { key: 'material', value: 'Leather' },
    { key: 'style', value: 'Sporty' },
    { key: 'fitadjjadjadkjadkjadlkjadlkad', value: 'Regularad;kjadkadjkadjadlkjadlkjadlkjad' },
    { key: 'length', value: 'Medium' },
    { key: 'width', value: 'Standard' },
    { key: 'height', value: 'Regular' }
  ]);*/    

</script>

<script lang="ts">
  import { twMerge } from "tailwind-merge";
  
  let { filters=$bindable([]), searchTerm=$bindable(""), ...restProps }: ProductListNavigation1Props = $props();

  function removeFilter(key: string, value: string) {
    filters = filters.filter(f => !(f.key === key && f.value === value));
  }

  function clearFilters() {
    filters = [];
  }

</script>

<section class={twMerge("min-h-10 px-2 flex flex-row flex-wrap justify-between gap-10", restProps.class)}>
    <div class="flex flex-row gap-2 items-center justify-end w-full">
      <button class="cursor-pointer px-2 sm:hidden" aria-label="Filter Product List">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-7 text-neutral-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 14L4 5V3H20V5L14 14V20L10 22V14Z"></path>
        </svg>
      </button>
      
    </div>
</section>
