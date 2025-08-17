<script lang="ts">
	import type { PageProps } from './$types.js';
    import { Header1, Footer1, Banner1, FeaturedProducts1, TextInput, Select, Overlay, onKeydown } from "$lib/index.js";
	import ProductList1 from '$lib/ui/product-list/product-list-1/ProductList1.svelte';
	import type { ProductFilter1List } from '$lib/ui/product-filters/product-filter-1/ProductFilter1.svelte';
	import ProductFilter1 from '$lib/ui/product-filters/product-filter-1/ProductFilter1.svelte';
	import { Searchbox } from '$lib/ui/searchbox/index.js';
	import { Breadcrumbs1 } from '$lib/ui/breadcrumbs/breadcrumbs-1/index.js';
	import { fly } from 'svelte/transition';

    let { data }: PageProps = $props();    

    let selectedValues: { key: string; value: string }[] = $state([{key: "Brand", value: "Nike"}]);

    let searchTerm: string = $state("Apple");
    let filterMenuOpen: boolean = $state(false);
    let filters: ProductFilter1List[] = $state([
        {
            title: "Category",
            values: [
                { key: "clothing", value: "Clothing", count: 10 },
                { key: "accessories", value: "Accessories", count: 5 },
                { key: "shoes", value: "Shoes", count: 8 }
            ]
        },
        {
            title: "Brand",
            values: [
                { key: "nike", value: "Nike", count: 7 },
                { key: "adidas", value: "Adidas", count: 6 },
                { key: "puma", value: "Puma", count: 4 }
            ]
        },
        {
            title: "Size",
            values: [
                { key: "s", value: "Small", count: 10 },
                { key: "m", value: "Medium", count: 5 },
                { key: "l", value: "Large", count: 8 }
            ]
        }
    ]);
    
    let products: {uid: string, title: string, description?: string, price: string, price_compare: string, image: string, badges?: string[], swatches?: string[]}[] = [];

    for(let i = 0; i < 8; i++)
    {
      products.push({
        uid: crypto.randomUUID(),
        title: "Random Name " + (i + 1),
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged." + (i + 1),
        price: "49",
        price_compare: "69",
        image: "https://placehold.co/400x300",
        badges: ["PRE-ORDER"],
        swatches: ["#1e293b", "#0f172a"]
      });
    }

    function onFilter(key: string, value: string) {
        const index = selectedValues.findIndex(item => item.key === key && item.value === value);
        if (index === -1) {
            selectedValues = [...selectedValues, { key, value }];
        } else {
            selectedValues = selectedValues.filter((_, i) => i !== index);
        }
        filterMenuOpen = false;
    }

    function removeFilter(key: string, value: string) {
        selectedValues = selectedValues.filter(f => !(f.key === key && f.value === value));
    }

    function clearFilters() {
        selectedValues = [];
    }

    function closeFilterMenu() {
		filterMenuOpen = false;
	};
    
</script>

<div class="flex flex-col gap-2 min-h-screen">
    <Header1 title="Quick Store" logo="https://i.pinimg.com/1200x/e9/eb/76/e9eb76e6e14467f488e8204dc257ee8b.jpg" links={[
            { text: "Home", href: "/quick-store" },
            { text: "Products", href: "/quick-store/products" },
            { text: "About", href: "/about" },
            { text: "Contact", href: "/contact" }
        ]}
        cartLink="/cart" accountLink="/account" />

    <main class="flex flex-col gap-2 flex-1">
        <div class="w-[98%] mx-auto md:w-full bg-primary-500 py-0.5 px-0.5">
            <Searchbox firstDivClass="w-full max-w-2xl mx-auto" secondDivClass="w-full bg-white !rounded-none" thirdDivClass="w-full !rounded-none border-none" class="bg-white" bind:searchTerm onInput={(value) => { searchTerm = value }} />
        </div>

        <div class="flex flex-col gap-4">
            <Breadcrumbs1 bind:filters={selectedValues} onRemove={removeFilter} onClear={clearFilters} class="px-2" />
            
            <div class="flex flex-row flex-wrap gap-2 items-center px-3 w-full">
                {#if searchTerm}
                <h4 class="text-sm mr-auto">Search Results for: <span class="font-medium text-neutral-800 text-base break-all">"{searchTerm}"</span></h4>
                {/if}

                <div class="flex flex-row gap-2 ml-auto">
                    <button class="cursor-pointer px-2 sm:hidden" aria-label="Filter Product List" onclick={()=> filterMenuOpen = !filterMenuOpen}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-7 text-neutral-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 14L4 5V3H20V5L14 14V20L10 22V14Z"></path>
                        </svg>
                    </button>
                    
                    {#if filterMenuOpen}
                    <Overlay transitionDuration={150} onclick={()=> filterMenuOpen = false} />
                    <div transition:fly={{ duration: 150, x: -64 }} class="w-64 fixed top-0 bottom-0 left-0 h-full shadow-primary bg-white overflow-y-auto" use:onKeydown={{ key: 'Escape', callback: closeFilterMenu }}>                        
                        <div class="text-neutral-700 flex flex-row items-center h-16 px-3 border-b border-neutral-200">
                            <p class="text-lg font-bold text-neutral-800">Filters</p>
                        </div>
                        <ProductFilter1 {filters} bind:selectedValues {onFilter} class="block hidden:block" />
                    </div>
                    {/if}
                    
                    <Select id="sortProducts" class="text-sm">
                        {#snippet optionsSnippet()}
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating-asc">Rating: Low to High</option>
                        <option value="rating-desc">Rating: High to Low</option>
                        {/snippet}
                    </Select>
                </div>
            </div>
        </div>
        
        <div class="flex flex-row gap-2">
            <ProductFilter1 {filters} bind:selectedValues {onFilter} class="hidden sm:block" />
            <ProductList1 {products} />
        </div>
    </main>

    <Footer1 title="Quick Store" logo="https://i.pinimg.com/1200x/e9/eb/76/e9eb76e6e14467f488e8204dc257ee8b.jpg" tagline="Your one-stop shop for quality products at unbeatable prices." links={[
        {title: "Shop", items: [{"text": "All Products", "href": "/shop"}, {"text": "Categories", "href": "/categories"}, {"text": "Special Offers", "href": "/offers"}]},
        {title: "Company", items: [{"text": "About Us", "href": "/about"}, {"text": "Contact", "href": "/contact"}, {"text": "Careers", "href": "/careers"}]}
    ]} copyright="&copy; 2025 Quick Store. All rights reserved" class="mt-20" />
</div>