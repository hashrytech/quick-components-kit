<script lang="ts" module>
	import TextInput from '$lib/components/text-input/TextInput.svelte';	
  import type { ClassNameValue } from 'tailwind-merge';

  export type ProductListNavigation1Props = {
    searchTerm?: string;
    firstDivClass?: string;
    secondDivClass?: string;
    thirdDivClass?: string;
    class?: ClassNameValue;
    onclick?: (event: Event) => void;
    onInput?: (value: string|number) => void
  };

</script>

<script lang="ts">
  import { twMerge } from "tailwind-merge";

  let { searchTerm = $bindable(""), firstDivClass, secondDivClass, thirdDivClass, onclick, onInput, ...restProps }: ProductListNavigation1Props = $props();

</script>

<TextInput id="searchBox" placeholder="Product search..." bind:value={searchTerm} type="search" {onInput} {firstDivClass} {secondDivClass} {thirdDivClass} class={"pl-3 " + restProps.class} autocomplete="off">

    <!--{#snippet leftIcon()}
    <button aria-label="Search" class="w-fit ml-2 h-full hover:bg-primary-100 cursor-pointer hidden" {onclick}>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 mx-auto text-neutral-400" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none"/>
            <circle cx="112" cy="112" r="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
            <line x1="168.57" y1="168.57" x2="224" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
        </svg>
    </button>
    {/snippet}
    -->

    {#snippet rightIcon()}
    <button aria-label="Search" class="size-10 hover:bg-primary-100 border-l-2 border-primary-500 cursor-pointer" {onclick}>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 mx-auto text-neutral-400" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none"/>
            <circle cx="112" cy="112" r="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
            <line x1="168.57" y1="168.57" x2="224" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
        </svg>
    </button>
    {/snippet}
</TextInput>