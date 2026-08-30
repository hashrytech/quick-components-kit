<script lang="ts">
	import type { PageProps } from './$types.js';
  import { Banner1, COMPONENT_PREVIEWS, SAMPLE_PRODUCTS } from "$lib/index.js";
	import Searchbox from '$lib/ui/searchbox/Searchbox.svelte';

	let { data }: PageProps = $props();

  // Sample data lives in the preview manifest so the admin gallery and this
  // page show the same thing; a change in one cannot silently skip the other.
  const products = SAMPLE_PRODUCTS;

  // Rendered THROUGH the manifest, with the same sample props the admin's
  // design gallery uses. If an entry breaks, this page shows it.
  const headerPreview = COMPONENT_PREVIEWS.header_1;
  const header2Preview = COMPONENT_PREVIEWS.header_2;
  const footerPreview = COMPONENT_PREVIEWS.footer_1;
  const footer2Preview = COMPONENT_PREVIEWS.footer_2;
  const featuredPreview = COMPONENT_PREVIEWS.featured_products_1;

</script>

<div class="flex flex-col gap-2 min-h-screen">
    <headerPreview.component {...headerPreview.sampleProps} />

    <main class="flex flex-col gap-10 flex-1">        
        <Banner1 image="https://placehold.co/150x150" class="bg-white bg-cover bg-no-repeat" mainText="Welcome to Quick Store" subText="Your one-stop shop for all your needs" primaryButtonText="Shop Now" primaryButtonLink="/shop" secondaryButtonText="Learn More" secondaryButtonLink="/about" />
        <featuredPreview.component {...featuredPreview.sampleProps} {products} />
    </main>

    <footerPreview.component {...footerPreview.sampleProps} class="mt-20" />

    <!-- The second designs render here too, so this page fails visibly if a
         preview in the admin gallery would fail. -->
    <section class="mt-16 flex flex-col gap-2 border-t-4 border-dashed border-neutral-200 pt-8">
        <p class="px-4 text-sm text-neutral-500">Alternate chrome designs</p>
        <header2Preview.component {...header2Preview.sampleProps} />
        <footer2Preview.component {...footer2Preview.sampleProps} />
    </section>
</div>