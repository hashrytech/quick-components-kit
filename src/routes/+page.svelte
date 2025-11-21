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
    import { Table, TableTh, TableTd } from "$lib/components/table/index.js";
	import Select from "$lib/components/select/Select.svelte";
	import TextArea from "$lib/components/text-area/TextArea.svelte";

    let menuVerticalOpen = $state(false);
    let menuHorizontalOpen = $state(false);
    let modalOpen = $state(false);
    let radioValue = $state("Apple");
    let showMultiSelect = $state(true);
    let selectValue = $state("apple");
</script>

<h1 class="mt-4 text-center bg-primary-600 p-2 rounded-lg text-white font-semibold text-xl mx-2">Quick Components Kit</h1>
<a href="/quick-store">Go to Quick Store</a>

<div class="flex flex-row gap-10 w-full bg-gray-50 rounded">
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
        <TextInput id="Small" placeholder="Small..." labelText="Small" class="" size="sm" required={true} type="text">
            {#snippet leftIcon()}
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
        <TextInput id="Medium" placeholder="Medium..." labelText="Medium" class="" size="md" disabled={true} />
        <TextInput id="Medium" placeholder="Medium..." labelText="Medium" class="" size="md" disabled={false} />
        <TextInput id="Small" placeholder="Small..." labelText="Small" class="" size="sm" disabled={false} />
        <TextInput id="Large" placeholder="Large (Force Positive Number) ..." labelText="Large" class="" size="lg" error="A name is required." forcePositiveNumber={true} type="number" onInput={(e)=> console.log(e)} />
        <TextInput id="searchBox" value="search box" placeholder="Product search...">
        
        {#snippet leftIcon()}
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 
                6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 
                12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z">
            </path>
        </svg>
        {/snippet}

        {#snippet rightIcon()}
        <button aria-label="clear search">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 
                  22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 
                  16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z">
              </path>
          </svg>
        </button>
        {/snippet}

      </TextInput>
    </div>
    <button type="submit" class="bg-green-500 p-2 rounded-primary w-full">Submit</button>
</form>
<hr />
    
<div class="flex flex-row flex-wrap gap-10 items-center">
    <div class="flex flex-row gap-4 items-center">
        <p>Button</p>
        <Button cssIcon="icon-[ion--add-circle]" cssIconClass="size-6 text-neutral-900" class="text-white text-base font-semibold">Get Started</Button>
    </div>

    <div class="flex flex-row gap-4 items-center">
        <p>Icon Button</p>
        <Button class="">
            {#snippet icon()}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                    <path d="M185.33,114.21l29.14-27.42.17-.17a32,32,0,0,0-45.26-45.26c0,.06-.11.11-.17.17L141.79,70.67l-83-30.2a8,8,0,0,0-8.39,1.86l-24,24a8,8,0,0,0,1.22,
                    12.31l63.89,42.59L76.69,136H56a8,8,0,0,0-5.65,2.34l-24,24A8,8,0,0,0,29,175.42l36.82,14.73,14.7,36.75.06.16a8,8,0,0,0,13.18,2.47l23.87-23.88A8,8,0,0,0,120,
                    200V179.31l14.76-14.76,42.59,63.89a8,8,0,0,0,12.31,1.22l24-24a8,8,0,0,0,1.86-8.39Zm-.07,97.23-42.59-63.88A8,8,0,0,0,136.8,144c-.27,0-.53,0-.79,0a8,8,0,0,0-5.66,
                    2.35l-24,24A8,8,0,0,0,104,176v20.69L90.93,209.76,79.43,181A8,8,0,0,0,75,176.57l-28.74-11.5L59.32,152H80a8,8,0,0,0,5.66-2.34l24-24a8,8,0,0,0-1.22-12.32L44.56,70.74l13.5-13.49,
                    83.22,30.26a8,8,0,0,0,8.56-2L180.78,52.6A16,16,0,0,1,203.4,75.23l-32.87,30.93a8,8,0,0,0-2,8.56l30.26,83.22Z">
                    </path>
                </svg>
            {/snippet}
            Get Started
        </Button>
    </div>

    <div class="flex flex-row gap-4 items-center">
        <p>Active Icon Button</p>
        <Button class="">
            {#snippet icon()}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256">
                    <path d="M185.33,114.21l29.14-27.42.17-.17a32,32,0,0,0-45.26-45.26c0,.06-.11.11-.17.17L141.79,70.67l-83-30.2a8,8,0,0,0-8.39,1.86l-24,24a8,8,0,0,0,1.22,
                    12.31l63.89,42.59L76.69,136H56a8,8,0,0,0-5.65,2.34l-24,24A8,8,0,0,0,29,175.42l36.82,14.73,14.7,36.75.06.16a8,8,0,0,0,13.18,2.47l23.87-23.88A8,8,0,0,0,120,
                    200V179.31l14.76-14.76,42.59,63.89a8,8,0,0,0,12.31,1.22l24-24a8,8,0,0,0,1.86-8.39Zm-.07,97.23-42.59-63.88A8,8,0,0,0,136.8,144c-.27,0-.53,0-.79,0a8,8,0,0,0-5.66,
                    2.35l-24,24A8,8,0,0,0,104,176v20.69L90.93,209.76,79.43,181A8,8,0,0,0,75,176.57l-28.74-11.5L59.32,152H80a8,8,0,0,0,5.66-2.34l24-24a8,8,0,0,0-1.22-12.32L44.56,70.74l13.5-13.49,
                    83.22,30.26a8,8,0,0,0,8.56-2L180.78,52.6A16,16,0,0,1,203.4,75.23l-32.87,30.93a8,8,0,0,0-2,8.56l30.26,83.22Z">
                    </path>
                </svg>
            {/snippet}
            {#snippet loadingIcon()}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256" class="animate-spin">
                    <path d="M185.33,114.21l29.14-27.42.17-.17a32,32,0,0,0-45.26-45.26c0,.06-.11.11-.17.17L141.79,70.67l-83-30.2a8,8,0,0,0-8.39,1.86l-24,24a8,8,0,0,0,1.22,
                    12.31l63.89,42.59L76.69,136H56a8,8,0,0,0-5.65,2.34l-24,24A8,8,0,0,0,29,175.42l36.82,14.73,14.7,36.75.06.16a8,8,0,0,0,13.18,2.47l23.87-23.88A8,8,0,0,0,120,
                    200V179.31l14.76-14.76,42.59,63.89a8,8,0,0,0,12.31,1.22l24-24a8,8,0,0,0,1.86-8.39Zm-.07,97.23-42.59-63.88A8,8,0,0,0,136.8,144c-.27,0-.53,0-.79,0a8,8,0,0,0-5.66,
                    2.35l-24,24A8,8,0,0,0,104,176v20.69L90.93,209.76,79.43,181A8,8,0,0,0,75,176.57l-28.74-11.5L59.32,152H80a8,8,0,0,0,5.66-2.34l24-24a8,8,0,0,0-1.22-12.32L44.56,70.74l13.5-13.49,
                    83.22,30.26a8,8,0,0,0,8.56-2L180.78,52.6A16,16,0,0,1,203.4,75.23l-32.87,30.93a8,8,0,0,0-2,8.56l30.26,83.22Z">
                    </path>
                </svg>
            {/snippet}
            Get Started
        </Button>
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
        <Drawer bind:open={menuHorizontalOpen} position="left">
            <p>Hello</p>
            <p>This is a left drawer.</p>
            <div class="flex flex-col gap-4 w-full">
                <Button class="text-white text-base font-semibold bg-red-500" onclick={()=> { menuHorizontalOpen=false; console.log("MENU: ", menuHorizontalOpen)}}>Close Drawer</Button>
                <Button class="text-white text-base font-semibold bg-red-500">Test Trap</Button>
            </div>
        </Drawer>
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

    <Modal bind:open={modalOpen} class="!rounded-none">
        <div class="p-4">
            <h2 class="text-lg font-semibold mb-2">Modal Title</h2>
            <p class="mb-4">This is a simple modal dialog. You can put any content here.</p>
            <Button class="text-white text-base font-semibold bg-red-500" onclick={()=> modalOpen=false}>Close Modal</Button>
            <Button class="text-white text-base font-semibold bg-red-500" onclick={()=> modalOpen=false}>Test Modal</Button>
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
    <TabNavigation class="hover:border-lime-500/40" 
         links={[
        { text: "Tab 1", href: "/", active: true },
        { text: "Tab 2", href: "#tab2", active: false },
        { text: "Tab 3", href: "#tab3", active: false }
    ]} />
</div>

<hr />

<div class="flex flex-col gap-10 items-center z-10">
    <Button class="text-white text-base font-semibold bg-blue-500" onclick={()=> showMultiSelect = !showMultiSelect}>
        Toggle Multi Select
    </Button>
    <Table rows={[
        { id: 1, name: "John Doe", age: 30 },
        { id: 2, name: "Jane Smith", age: 25 },
        { id: 3, name: "Alice Johnson", age: 28 }]}
        getKey={(u) => u.id.toString()} bind:showMultiSelect checkboxClass="border-neutral-300">
        {#snippet headings()}
        <TableTh class="w-[30rem]">DLDJHDLJLKDLDJDLKJDL</TableTh>
        <TableTh class="w-[30rem]">Name</TableTh>
        <TableTh class="w-[30rem]">Age</TableTh>
        {/snippet}

        {#snippet tableRow(row)}
        <TableTd>{row.id}</TableTd>
        <TableTd>{row.name}</TableTd>
        <TableTd>{row.age}</TableTd>        
        {/snippet}

        {#snippet tableRowMobile(row)}
        <div class="flex flex-col gap-2">
            <p class="font-semibold">ID: {row.id}</p>
            <p class="font-semibold">Name: {row.name}</p>
            <p class="font-semibold">Age: {row.age}</p>
        </div>
        {/snippet}
    </Table>
</div>

<div class="flex flex-col gap-10 items-start justify-start">
    <Select labelPosition="right" id="select1" labelText="Select Example" options={[{ value: "apple", key: "Apple", disabled: false }, { value: "banana", key: "Banana", disabled: true }, { value: "cherry", key: "Cherry" }]} 
        bind:value={selectValue} size="lg" class="w-64" />
</div>

<TextArea id="textArea1" labelText="Text Area Example" placeholder="Enter your text here..." minlength={10} maxlength={15} class="w-64 resize-none" size="lg" />
<TextArea id="textArea2" labelText="Text Area 2" placeholder="Enter your text here..." minlength={10} maxlength={15} class="w-64 resize-none" size="md" disabled={true} />



