<script lang="ts" module>
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type Header1Props = {        
        title: string;
        logo?: string;
        links?: { text : string, href: string}[];
        cartLink?: string;
        accountLink?: string;
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
    import { HamburgerMenu, onKeydown, Overlay } from "$lib/index.js";
	import { fly } from 'svelte/transition';
	import { twMerge } from "tailwind-merge";

    let { logo, title, links=[], cartLink, accountLink, ...restProps }: Header1Props = $props();

    let mobileMenuOpen = $state(false);

    function closeMobileMenu() {
		mobileMenuOpen = false;
	};
  
</script>

<header class="px-4 shadow-sm">

    <div class={twMerge("flex min-h-16 justify-between items-center w-full max-w-7xl mx-auto", restProps.class)}>
        {#if logo || title}
        <div class="flex items-center gap-2">
            {#if logo}<a href="/"><img src={logo} alt="Logo" class="h-8 w-auto" /></a>{/if}
            {#if title}<a href="/"><span class="text-lg font-semibold">{title}</span></a>{/if}
        </div>
        {/if}

        {#if links}
        <nav class="hidden md:flex gap-6 text-base font-medium text-neutral-700">
            {#each links as { text, href } }
            <a href={href} class="hover:text-primary-button-hover">{text}</a>
            {/each}
        </nav>
        {/if}
        
        {#if cartLink || accountLink}
        <div class="flex items-center gap-4">            
            <a href={cartLink} class="text-neutral-700 hover:text-primary-button-hover size-6" aria-label="Shopping Cart">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.00488 9H19.9433L20.4433 7H8.00488V5H21.7241C22.2764 5 22.7241 5.44772 22.7241 6C22.7241 6.08176 22.7141 
                        6.16322 22.6942 6.24254L20.1942 16.2425C20.083 16.6877 19.683 17 19.2241 17H5.00488C4.4526 17 4.00488 16.5523 4.00488 
                        16V4H2.00488V2H5.00488C5.55717 2 6.00488 2.44772 6.00488 3V9ZM6.00488 23C4.90031 23 4.00488 22.1046 4.00488 21C4.00488 
                        19.8954 4.90031 19 6.00488 19C7.10945 19 8.00488 19.8954 8.00488 21C8.00488 22.1046 7.10945 23 6.00488 23ZM18.0049 
                        23C16.9003 23 16.0049 22.1046 16.0049 21C16.0049 19.8954 16.9003 19 18.0049 19C19.1095 19 20.0049 19.8954 20.0049 
                        21C20.0049 22.1046 19.1095 23 18.0049 23Z">
                    </path>
                </svg>
            </a>
            <a href={accountLink} aria-label="Account" class="text-neutral-700 hover:text-primary-button-hover size-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 
                        18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 
                        11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z">
                    </path>
                </svg>
            </a>
            <HamburgerMenu bind:open={mobileMenuOpen} onclick={() => (mobileMenuOpen = !mobileMenuOpen)} class="md:hidden"/>
        </div>
        {/if}        

    </div>

    {#if mobileMenuOpen}
    <Overlay transitionDuration={150} onclick={()=> mobileMenuOpen = false} />
    <div transition:fly={{ duration: 150, x: -64 }} class="w-64 fixed top-0 bottom-0 left-0 h-fit rounded-b shadow-primary overflow-y-auto" use:onKeydown={{ key: 'Escape', callback: closeMobileMenu }}>
        
        {#if logo || title}
        <div class="text-neutral-700 border-b-2 border-neutral-100 bg-white gap-3 flex flex-row items-center h-16 shadow-2xl px-4">
            {#if logo}<img src={logo} alt="Logo" class="size-8" />{/if}
            {#if title}<span class="text-lg font-bold text-neutral-800">{title}</span>{/if}
        </div>
        {/if}
        
        <nav class="flex flex-col items-start text-white text-base min-h-screen bg-white shadow-primary px-2 pt-2">
            {#each links as { text, href } }
            <a {href} class="py-2 text-neutral-700 hover:bg-primary-100 px-4 rounded-primary w-full" onclick={closeMobileMenu}>{text}</a>
            {/each}
        </nav>
    </div>
    {/if}

</header>
