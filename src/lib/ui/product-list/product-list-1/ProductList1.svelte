<script lang="ts" module>
	import { Button } from '$lib/components/button/index.js';
  import type { ClassNameValue } from 'tailwind-merge';

  export type Product = {
    uid: string; 
    title: string; 
    description?: string;
    price: string; 
    price_compare?: string; 
    image: string; 
    badges?: string[]; 
    swatches?: string[];
  }

  export type ProductList1Props = {
    products: Product[];
    titleClass?: ClassNameValue;
    imageClass?: ClassNameValue;
    priceClass?: ClassNameValue;
    priceCompareClass?: ClassNameValue;
    onShowMore?: () => void;
    onAddToCart?: (product: Product) => void;
    class?: ClassNameValue;
  };

</script>

<script lang="ts">
  import { twMerge } from "tailwind-merge";
  let { products, titleClass, imageClass, priceClass, priceCompareClass, onShowMore, onAddToCart, ...restProps }: ProductList1Props = $props();
  
</script>

<section class="flex flex-col gap-16">
  <div class="mx-auto p-2">
    <div class={twMerge("grid [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] gap-4 mx-auto", restProps.class)}>
      {#each products as product}
      <div class="border border-primary-card-border shadow-primary rounded-primary overflow-hidden bg-white">
        <a href="/products/{product.uid}" class="aspect-[4/3] rounded-primary">
          <img src={product.image} alt={product.title} class={twMerge("object-cover w-full h-[250px]", imageClass)} />
        </a>
        <div class="p-3 flex flex-col gap-2">
          <h3 class={twMerge("text-base font-medium", titleClass)}>{product.title}</h3>
          <p class={twMerge("text-sm font-normal line-clamp-3", titleClass)}>{product.description}</p>
          <div class="mt-1 flex items-center gap-2">
            <span class={twMerge("font-semibold", priceClass)}>${product.price}</span>
            {#if product.price_compare}
              <span class={twMerge("text-base text-neutral-500 line-through", priceCompareClass)}>${product.price_compare}</span>
            {/if}
          </div>
        </div>
        <Button class="py-1 w-full !rounded-none text-white text-sm justify-center" onclick={()=> {onAddToCart?.(product)}}>
            {#snippet icon()}
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>
            {/snippet}
            Add to cart
        </Button>
      </div>
      {/each}
    </div>
  </div>

  
  <Button class="py-2 px-4 w-fit text-white text-sm justify-center mx-auto font-semibold" onclick={onShowMore}>
    {#snippet loadingIcon()}
    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.05469 13H5.07065C5.55588 16.3923 8.47329 19 11.9998 19C15.5262 19 18.4436 16.3923 18.9289 13H20.9448C20.4474 17.5 16.6323 21 11.9998 21C7.36721 21 3.55213 17.5 3.05469 13ZM3.05469 11C3.55213 6.50005 7.36721 3 11.9998 3C16.6323 3 20.4474 6.50005 20.9448 11H18.9289C18.4436 7.60771 15.5262 5 11.9998 5C8.47329 5 5.55588 7.60771 5.07065 11H3.05469Z"></path></svg>
    {/snippet}

    {#snippet icon()}
    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>
    {/snippet}
    Show More
  </Button>
  
</section>
