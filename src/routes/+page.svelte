<script lang="ts">
    import {TextBox as TextInput} from "$lib/text-input/index.js";
    import Button from "$lib/button/Button.svelte";
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

<form class="w-full">
    <div class="flex w-full max-w-lg gap-2">
        <TextInput id="Apple" placeholder="Small..." labelText="Small" inputStyle="" size="sm" required={true} type="text">
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
        <TextInput id="Apple" placeholder="Medium..." labelText="Medium" inputStyle="" size="md" disabled={true} />
        <TextInput id="Apple" placeholder="Large..." labelText="Large" inputStyle="" size="lg" error="A name is required." />
    </div>

    <button type="submit" class="bg-green-500 p-2 rounded-primary">Submit</button>
</form>
