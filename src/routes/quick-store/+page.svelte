<script lang="ts">
	import type { PageProps } from './$types.js';
  import { Header1, Footer1, Banner1, FeaturedProducts1 } from "$lib/index.js";
	import Searchbox from '$lib/ui/searchbox/Searchbox.svelte';

	let { data }: PageProps = $props();

  let products: {uid: string, title: string, price: string, price_compare: string, image: string, badges?: string[], swatches?: string[]}[] = [
    {
      uid: crypto.randomUUID(),
      title: "Portsmith Fleece",
      price: "49",
      price_compare: "69",
      image: "https://placehold.co/750x1250",
      badges: ["PRE-ORDER"],
      swatches: ["#1e293b", "#0f172a"]
    },
    {
      uid: crypto.randomUUID(),
      title: "Stocker Crew",
      price: "90",
      price_compare: "120",
      image: "https://placehold.co/400x300",
      badges: ["NEW SEASON"],
      swatches: ["#1e293b", "#94a3b8"]
    },
    {
      uid: crypto.randomUUID(),
      title: "Home Tee",
      price: "18",
      price_compare: "36",
      image: "https://placehold.co/150x150",
      badges: ["ON SALE", "NEW SEASON"],
      swatches: ["#0f172a", "#000", "#fff"]
    },
    {
      uid: crypto.randomUUID(),
      title: "Porcelain Tiles",
      price: "28",
      price_compare: "136",
      image: "https://placehold.co/150x150",
      badges: ["ON SALE", "NEW SEASON"],
      swatches: ["#0f172a", "#000", "#fff"]
    }
  ];
    
</script>

<div class="flex flex-col gap-2 min-h-screen">
    <Header1 title="Quick Store" logo="https://i.pinimg.com/1200x/e9/eb/76/e9eb76e6e14467f488e8204dc257ee8b.jpg" links={[
            { text: "Home", href: "/quick-store" },
            { text: "Products", href: "/quick-store/products" },
            { text: "About", href: "/about" },
            { text: "Contact", href: "/contact" }
        ]}
        cartLink="/cart" accountLink="/account" />

    <main class="flex flex-col gap-10 flex-1">        
        <Banner1 image="https://placehold.co/150x150" class="bg-white bg-cover bg-no-repeat" mainText="Welcome to Quick Store" subText="Your one-stop shop for all your needs" primaryButtonText="Shop Now" primaryButtonLink="/shop" secondaryButtonText="Learn More" secondaryButtonLink="/about" />
        <FeaturedProducts1 title="Featured Products" {products} titleDescription="Check out our featured products below. They are every bit as good as they look!" />
    </main>

    <Footer1 title="Quick Store" logo="https://i.pinimg.com/1200x/e9/eb/76/e9eb76e6e14467f488e8204dc257ee8b.jpg" tagline="Your one-stop shop for quality products at unbeatable prices." links={[
        {title: "Shop", items: [{"text": "All Products", "href": "/shop"}, {"text": "Categories", "href": "/categories"}, {"text": "Special Offers", "href": "/offers"}]},
        {title: "Company", items: [{"text": "About Us", "href": "/about"}, {"text": "Contact", "href": "/contact"}, {"text": "Careers", "href": "/careers"}]}
    ]} copyright="&copy; 2025 Quick Store. All rights reserved" class="mt-20" />
</div>