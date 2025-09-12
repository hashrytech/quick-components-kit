<script lang="ts">
	import type { PageProps } from './$types.js';
    import { Header1, Footer1, Banner1, FeaturedProducts1, TextInput, Select, Overlay, onKeydown } from "$lib/index.js";
	import ProductList1 from '$lib/ui/product-list/product-list-1/ProductList1.svelte';
	import type { ProductFilter1List } from '$lib/ui/product-filters/product-filter-1/ProductFilter1.svelte';
	import ProductFilter1 from '$lib/ui/product-filters/product-filter-1/ProductFilter1.svelte';
	import { Searchbox } from '$lib/ui/searchbox/index.js';
	import { Breadcrumbs1 } from '$lib/ui/breadcrumbs/breadcrumbs-1/index.js';
	import { fly } from 'svelte/transition';
	import type { OrderProduct } from '$lib/ui/order-product-line-item/order-product-line-item-1/OrderProductLineItem1.svelte';
	import OrderProductLineItem1 from '$lib/ui/order-product-line-item/order-product-line-item-1/OrderProductLineItem1.svelte';

    let { data }: PageProps = $props();

    let orderProductList: OrderProduct[] = [
        {
            name: 'Leather Tote Bag',
            quantity: 1,
            price: '$120.00',
            class: 'bg-white'
        },
        {
            name: 'Running Shoes',
            quantity: 2,
            price: '$89.00',
            class: 'bg-white'
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
        cartLink="/quick-store/cart" accountLink="/quick-store/account" />

    <main class="flex flex-col gap-2 flex-1">
        
        <div class="mx-auto max-w-7xl w-full px-4 py-6">
            <h1 class="text-2xl font-semibold tracking-tight">Your Cart</h1>

        <!-- Empty state (hide when items exist) -->
        <!--
        <div class="mt-8 rounded-2xl border border-dashed p-10 text-center">
            <p class="text-lg font-medium">Your cart is empty</p>
            <p class="text-neutral-500 mt-1">Browse products and add your favorites.</p>
            <a href="/shop" class="inline-flex mt-6 rounded-xl px-4 py-2 border bg-white hover:bg-neutral-50">
            Continue shopping
            </a>
        </div>
        -->
        
        <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Cart items -->
            <div class="lg:col-span-2 space-y-4">

                {#each orderProductList as orderProduct, index}
                <OrderProductLineItem1 {orderProduct} {index} />
                {/each}
                <!-- Item -->
                <article class="rounded-2xl border bg-white p-4 md:p-5">
                    <div class="flex gap-4">
                    <img src="https://placehold.co/120" alt="Product" class="h-24 w-24 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                    <div class="min-w-0 flex-1">
                        <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <h2 class="text-base font-medium text-neutral-900 truncate">Leather Tote Bag</h2>
                            <p class="text-sm text-neutral-500 mt-0.5">Color: Black • Size: One Size</p>
                        </div>
                        <p class="text-base font-semibold text-neutral-900">$120.00</p>
                        </div>

                        <div class="mt-3 flex flex-wrap items-center gap-3">
                        <!-- Quantity -->
                        <label class="sr-only" for="qty-1">Quantity</label>
                        <div class="inline-flex items-center rounded-xl border bg-white">
                            <button type="button" class="px-3 py-2 text-neutral-700 hover:bg-neutral-50">−</button>
                            <input
                            id="qty-1"
                            type="number"
                            inputmode="numeric"
                            value="1"
                            min="1"
                            class="w-12 border-0 text-center outline-none focus:ring-0"
                            />
                            <button type="button" class="px-3 py-2 text-neutral-700 hover:bg-neutral-50">+</button>
                        </div>

                        <!-- Actions -->
                        <button type="button" class="text-sm text-neutral-600 hover:text-neutral-900">
                            Move to wishlist
                        </button>
                        <button type="button" class="text-sm text-red-600 hover:text-red-700">
                            Remove
                        </button>
                        </div>
                    </div>
                    </div>

                    <!-- Price breakdown (mobile) -->
                    <div class="mt-3 border-t pt-3 text-sm text-neutral-500 md:hidden">
                    <div class="flex justify-between">
                        <span>Item</span><span>$120.00</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Qty</span><span>1</span>
                    </div>
                    <div class="flex justify-between font-medium text-neutral-800">
                        <span>Line total</span><span>$120.00</span>
                    </div>
                    </div>
                </article>

            <!-- Duplicate article blocks for more items -->
            <article class="rounded-2xl border bg-white p-4 md:p-5">
                <div class="flex gap-4">
                <img src="https://placehold.co/120" alt="Product" class="h-24 w-24 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <h2 class="text-base font-medium text-neutral-900 truncate">
                        Running Shoes
                        </h2>
                        <p class="text-sm text-neutral-500 mt-0.5">
                        Color: Gray • Size: 9
                        </p>
                    </div>
                    <p class="text-base font-semibold text-neutral-900">$89.00</p>
                    </div>

                    <div class="mt-3 flex flex-wrap items-center gap-3">
                    <label class="sr-only" for="qty-2">Quantity</label>
                    <div class="inline-flex items-center rounded-xl border bg-white">
                        <button type="button" class="px-3 py-2 text-neutral-700 hover:bg-neutral-50">−</button>
                        <input
                        id="qty-2"
                        type="number"
                        inputmode="numeric"
                        value="2"
                        min="1"
                        class="w-12 border-0 text-center outline-none focus:ring-0"
                        />
                        <button type="button" class="px-3 py-2 text-neutral-700 hover:bg-neutral-50">+</button>
                    </div>

                    <button type="button" class="text-sm text-neutral-600 hover:text-neutral-900">
                        Move to wishlist
                    </button>
                    <button type="button" class="text-sm text-red-600 hover:text-red-700">
                        Remove
                    </button>
                    </div>
                </div>
                </div>

                <div class="mt-3 border-t pt-3 text-sm text-neutral-500 md:hidden">
                <div class="flex justify-between">
                    <span>Item</span><span>$89.00</span>
                </div>
                <div class="flex justify-between">
                    <span>Qty</span><span>2</span>
                </div>
                <div class="flex justify-between font-medium text-neutral-800">
                    <span>Line total</span><span>$178.00</span>
                </div>
                </div>
            </article>
            </div>

            <!-- Summary -->
            <aside class="lg:col-span-1">
            <div class="rounded-2xl border bg-white p-4 md:p-5">
                <h2 class="text-lg font-semibold">Order Summary</h2>

                <!-- Promo -->
                <div class="mt-4">
                <label for="promo" class="text-sm text-neutral-600">Promo code</label>
                <div class="mt-1 flex gap-2">
                    <input
                    id="promo"
                    type="text"
                    placeholder="Enter code"
                    class="flex-1 rounded-xl border px-3 py-2 outline-none focus:border-neutral-800 focus:ring-0"
                    />
                    <button class="rounded-xl border bg-white px-3 py-2 hover:bg-neutral-50">
                    Apply
                    </button>
                </div>
                </div>

                <!-- Totals -->
                <dl class="mt-4 space-y-2 text-sm">
                <div class="flex justify-between">
                    <dt class="text-neutral-600">Subtotal</dt>
                    <dd class="font-medium text-neutral-900">$298.00</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-neutral-600">Shipping</dt>
                    <dd class="text-neutral-700">Calculated at checkout</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-neutral-600">Taxes</dt>
                    <dd class="text-neutral-700">Calculated at checkout</dd>
                </div>
                <div class="pt-2 border-t flex justify-between text-base">
                    <dt class="font-semibold">Total</dt>
                    <dd class="font-semibold text-neutral-900">$298.00</dd>
                </div>
                </dl>

                <!-- CTAs -->
                <div class="mt-5 space-y-2">
                <a
                    href="/checkout"
                    class="block w-full text-center rounded-xl bg-neutral-900 text-white py-2.5 hover:bg-neutral-800"
                >
                    Checkout
                </a>
                <a
                    href="/shop"
                    class="block w-full text-center rounded-xl border bg-white py-2.5 hover:bg-neutral-50"
                >
                    Continue shopping
                </a>

                <!-- Trust / info -->
                <p class="mt-3 text-xs text-neutral-500">
                    Secure checkout • Free returns within 30 days
                </p>
                </div>
            </div>
            </aside>
        </div>
    </div>

    </main>

    <Footer1 title="Quick Store" logo="https://i.pinimg.com/1200x/e9/eb/76/e9eb76e6e14467f488e8204dc257ee8b.jpg" tagline="Your one-stop shop for quality products at unbeatable prices." links={[
        {title: "Shop", items: [{"text": "All Products", "href": "/shop"}, {"text": "Categories", "href": "/categories"}, {"text": "Special Offers", "href": "/offers"}]},
        {title: "Company", items: [{"text": "About Us", "href": "/about"}, {"text": "Contact", "href": "/contact"}, {"text": "Careers", "href": "/careers"}]}
    ]} copyright="&copy; 2025 Quick Store. All rights reserved" class="mt-20" />
</div>