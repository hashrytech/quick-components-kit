<script lang="ts" module>
    import TextInput from '$lib/components/text-input/TextInput.svelte';	
    import type { ClassNameValue } from 'tailwind-merge';

    export type OrderProduct = {
        name: string;
        quantity: number;
        price: string;
        class?: ClassNameValue;
    };
    
    export type ShoppingCartList1Props = {
        orderProduct: OrderProduct;
        index: number;
        class?: ClassNameValue;
    };    

</script>

<script lang="ts">

    let { orderProduct, index=0, ...restProps }: ShoppingCartList1Props = $props();

</script>

<div class="rounded-primary border border-primary-input-border p-2">
    <div class="flex gap-4">
        <img src="https://placehold.co/120" alt="Product" class="h-24 w-24 rounded-primary object-cover flex-shrink-0" loading="lazy" />
        <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <h3 class="text-base font-medium text-neutral-900 truncate">{orderProduct.name}</h3>
                    <p class="text-sm text-neutral-500 mt-0.5">Color: Black • Size: One Size</p>
                </div>
                <p class="text-base font-semibold text-neutral-900">{orderProduct.price}</p>
            </div>

            
            <div class="mt-3 flex flex-wrap items-center gap-3">
                <!-- Quantity -->
                <label class="sr-only" for={"qtyId" + index}>Quantity</label>
                <div class="inline-flex items-center gap-2">
                    <button type="button" class="p-0.5 text-neutral-700 hover:bg-primary-button-hover cursor-pointer text-2xl rounded-full" aria-label="Increase quantity">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11V13H19V11H5Z"></path></svg>
                    </button>
                    <TextInput bind:value={orderProduct.quantity} id={"qtyId" + index} type="number" inputmode="numeric" min={1} class="w-12 text-center" />
                    <button type="button" class="p-0.5 text-neutral-700 hover:bg-primary-button-hover cursor-pointer text-2xl rounded-full" aria-label="Increase quantity">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>
                    </button>
                </div>

                <!-- Actions -->
                <button type="button" class="text-sm text-red-600 hover:text-red-700 cursor-pointer" aria-label="Remove item">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-neutral-600 hover:text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path></svg>
                </button>

            </div>
        </div>
    </div>

    <!-- Price breakdown (mobile) -->
    <div class="mt-3 border-t border-primary-input-border pt-3 text-sm text-neutral-500 md:hidden">
        <div class="flex justify-between">
            <span>Item</span><span>$120.00</span>
        </div>
    </div>
    <div class="flex justify-between">
        <span>Qty</span><span>1</span>
    </div>
    <div class="flex justify-between font-medium text-neutral-800">
        <span>Line total</span><span>$120.00</span>
    </div>
</div>

