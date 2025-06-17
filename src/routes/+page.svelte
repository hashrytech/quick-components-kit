<script lang="ts">
    import { TextInput} from "$lib/components/text-input/index.js";
    import Button from "$lib/components/button/Button.svelte";
	import LinkButton from "$lib/components/link-button/LinkButton.svelte";
	import HamburgerMenu from "$lib/components/hamburger-menu/HamburgerMenu.svelte";	
	import Drawer from "$lib/components/drawer/Drawer.svelte";	
    import Modal from "$lib/components/modal/Modal.svelte";
	import Checkbox from "$lib/components/checkbox/Checkbox.svelte";
	import Radio from "$lib/components/radio/Radio.svelte";    
	import TabNavigation from "$lib/components/tab-navigation/TabNavigation.svelte";

    let menuVerticalOpen = $state(false);
    let menuHorizontalOpen = $state(false);
    let modalOpen = $state(false);
    let radioValue = $state("Apple");
</script>

<h1 class="mt-4 text-center bg-primary-600 p-2 rounded-lg text-white font-semibold text-xl mx-2">Quick Components Kit</h1>

<div class="flex flex-row gap-10 w-full py-5 bg-gray-50 rounded">
    <div class="flex flex-col gap-1 px-2 w-full">
        <p class="font-medium">Primary</p>
        <div class="flex flex-row gap-0.5 justify-center items-center w-full">
        {#each ["bg-primary-50", "bg-primary-100", "bg-primary-200", "bg-primary-300", "bg-primary-400", "bg-primary-500", "bg-primary-600", "bg-primary-700", "bg-primary-800", "bg-primary-900", "bg-primary-950"] as bg_color}
            <div class="h-10 w-full {bg_color} text-center flex items-center justify-center font-medium rounded text-sm">&nbsp;</div>
        {/each}
        </div>
    </div>

    <div class="flex flex-col gap-1 px-2 w-full">
        <p class="font-medium">Secondary</p>
        <div class="flex flex-row gap-0.5 justify-center items-center w-full">
        {#each ["bg-secondary-50", "bg-secondary-100", "bg-secondary-200", "bg-secondary-300", "bg-secondary-400", "bg-secondary-500", "bg-secondary-600", "bg-secondary-700", "bg-secondary-800", "bg-secondary-900", "bg-secondary-950"] as bg_color}
            <div class="h-10 w-full {bg_color} text-center flex items-center justify-center font-medium rounded text-sm">&nbsp;</div>
        {/each}
        </div>
    </div>
</div>

<form class="flex flex-col gap-4">
    <div class="flex flex-wrap w-full max-w-lg gap-2">
        <TextInput id="Small" placeholder="Small..." labelText="Small" inputClasses="" size="sm" required={true} type="text">
            {#snippet icon()}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                class="lucide lucide-anvil-icon lucide-anvil">
                <path d="M7 10H6a4 4 0 0 1-4-4 1 1 0 0 1 1-1h4"/>
                <path d="M7 5a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1 7 7 0 0 1-7 7H8a1 1 0 0 1-1-1z"/>
                <path d="M9 12v5"/>
                <path d="M15 12v5"/>
                <path d="M5 20a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3 1 1 0 0 1-1 1H6a1 1 0 0 1-1-1"/>
            </svg>
            {/snippet}
        </TextInput>
        <TextInput id="Medium" placeholder="Medium..." labelText="Medium" inputClasses="" size="md" disabled={true} />
        <TextInput id="Large" placeholder="Large..." labelText="Large" inputClasses="" size="lg" error="A name is required." />
    </div>
    <button type="submit" class="bg-green-500 p-2 rounded-primary">Submit</button>
</form>
<hr />
    
<div class="flex flex-row gap-10 items-center">
    <div class="flex flex-row gap-4 items-center">
        <p>Button</p>
        <Button class="text-white text-base font-semibold">Get Started</Button>
    </div>

    <div class="flex flex-row gap-4 items-center">
        <p>Button Disabled</p>
        <Button disabled={true} class="text-white text-base font-semibold">Get Started</Button>
    </div>

    <div class="flex flex-row gap-4 items-center">
        <p>Link Button</p>
        <LinkButton href="/" class="text-white text-base font-semibold">Get Started</LinkButton>
    </div>
</div>

<hr />

<div class="flex flex-row flex-wrap gap-10 items-center">
    <div class="flex flex-row gap-4 items-center">
        <p>Hamburger Menu &amp; Left Drawer</p>
        <HamburgerMenu ariaLabel="Toggle Horizontal Menu" bind:open={menuHorizontalOpen} onclick={()=> {menuHorizontalOpen = !menuHorizontalOpen}} />
        <Drawer bind:open={menuHorizontalOpen} position="left" />
    </div>

    <div class="flex flex-row gap-4 items-center">
        <p>Hamburger Menu &amp; Top Drawer</p>
        <HamburgerMenu ariaLabel="Toggle Vertical Menu" bind:open={menuVerticalOpen} onclick={()=> {menuVerticalOpen = !menuVerticalOpen}} useCloseBtn={false} />
        <Drawer bind:open={menuVerticalOpen} position="top" />
    </div>
</div>

<hr />

<div class="flex flex-row gap-10 items-center">
    <div class="flex flex-row gap-4 items-center">
        <p>Modal</p>
        <Button class="text-white text-base font-semibold bg-sky-500" onclick={()=> modalOpen=true}>Show Modal</Button>
    </div>

    <Modal bind:open={modalOpen} class="">
        <div class="p-4 hidden">
            <h2 class="text-lg font-semibold mb-2">Modal Title</h2>
            <p class="mb-4">This is a simple modal dialog. You can put any content here.</p>
            <Button class="text-white text-base font-semibold bg-red-500" onclick={()=> modalOpen=false}>Close Modal</Button>
        </div>
    </Modal>
</div>

<hr />

<div class="flex flex-row gap-10 items-center">
    <div class="flex flex-row gap-4 items-center">
        <Checkbox id="checkbox1" label="Check Box Active" checked={true} />
    </div>

    <div class=" inline-flex gap-4 items-center">
        <Radio id="radio1" label="Radio Button 1" name="fruit" value="Apple" bind:group={radioValue} />
        <Radio id="radio2" label="Radio Button 2" name="fruit" value="Banana" bind:group={radioValue} />            
    </div>
</div>

<hr />

<div class="flex flex-row gap-10 items-center">
    <TabNavigation class="hover:border-lime-500" 
         links={[
        { text: "Tab 1", href: "/", active: true },
        { text: "Tab 2", href: "#tab2", active: false },
        { text: "Tab 3", href: "#tab3", active: false }
    ]} />
</div>





