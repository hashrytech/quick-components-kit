<script lang="ts" module>
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type FeaturedProducts1Props = {
      title: string;
      titleDescription?: string;
      products: {uid: string, title: string, price: string, price_compare: string, image: string, badges?: string[], swatches?: string[]}[];
      titleClass?: ClassNameValue;
      imageClass?: ClassNameValue;
      priceClass?: ClassNameValue;
      priceCompareClass?: ClassNameValue;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">
	import { twMerge } from "tailwind-merge";

  let { title, products, titleClass, titleDescription, imageClass, priceClass, priceCompareClass, ...restProps }: FeaturedProducts1Props = $props();

</script>

<section class="space-y-6">
  <div class="text-center">
    <h2 class="text-2xl font-semibold">{title}</h2>
    <div class="w-32 bg-primary-button h-0.5 rounded-primary mx-auto mt-2"></div>
    {#if titleDescription}
    <p class="mt-6 px-6 max-w-2xl mx-auto">{titleDescription}</p>
    {/if}
  </div>

  <div class="mx-auto p-2">
    <div class={twMerge("grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto w-fit p-1", restProps.class)}>
      {#each products as product}
      <a href={`/products/${product.uid}`} class="border border-primary-card-border shadow-primary rounded-primary overflow-hidden bg-white">
        
        <div class="aspect-[4/3] rounded-primary">
          <img src={product.image} alt={product.title} class={twMerge("object-cover w-full h-[250px]", imageClass)} />
        </div>

        <div class="p-3">
          <h3 class={twMerge("text-base font-medium text-neutral-900", titleClass)}>{product.title}</h3>
          <div class="mt-1 flex items-center gap-2">
            <span class={twMerge("font-medium", priceClass)}>${product.price}</span>
            {#if product.price_compare}
              <span class={twMerge("text-base text-neutral-500 line-through", priceCompareClass)}>${product.price_compare}</span>
            {/if}
          </div>
        </div>
      </a>
      {/each}
    </div>
  </div>
  
</section>
