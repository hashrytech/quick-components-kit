<script lang="ts" module>
	import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';

    /**
     * Predefined size classes for the TextBox input.
     * - "sm": h-[2.05rem] text-sm placeholder:text-sm
     * - "md": h-[2.375rem] text-sm placeholder:text-sm
     * - "lg": h-[2.8rem] text-lg placeholder:text-lg
    */
    export type TextInputSize = "sm" | "md" | "lg";
    export type TextInputType = "text" | "password" | "number" | "email" | "tel" | "url";

    /**
     * Props for the TextBox component.
     *
     * @prop {string} id - The unique ID of the input field.
     * @prop {string} [name] - The name attribute for form submission.
     * @prop {string} [value] - The bound value of the input.
     * @prop {string} [placeholder] - Placeholder text.
     * @prop {string} [labelText] - Optional label text.
     * @prop {ClassNameValue} [inputClasses] - Additional Tailwind classes to apply to the input. Example: "border-red-500 text-green-600"
     * @prop {TextInputSize} [size] - Size variant ("sm", "md", "lg") with predefined Tailwind styles.
     *        - "sm": h-[2.05rem] text-sm placeholder:text-sm
     *        - "md": h-[2.375rem] text-sm placeholder:text-sm
     *        - "lg": h-[2.8rem] text-lg placeholder:text-lg
     * @prop {() => void} [onchange] - Event handler for change events.
     * @prop {() => void} [onmouseup] - Event handler for mouseup events.
     * @prop {Snippet} [label] - Custom label snippet.
     */
    export type TextInputProps = {
        id: string;        
        name?: string;
        value?: string;
        type?: TextInputType;
        placeholder?: string;
        labelText?: string;        
        inputClasses?: ClassNameValue;
        size?: TextInputSize;
        disabled?: boolean;
        required?: boolean;
        error?: string;
        onchange?: () => void;
        onmouseup?: () => void;
        label?: Snippet;
        icon?: Snippet;
    };
    

</script>

<script lang="ts">
    import { twMerge } from 'tailwind-merge';
    
    let { id, type="text", name="", value=$bindable(""), placeholder="", labelText, size="md", inputClasses="", disabled=false, required=false, error, onchange, onmouseup, label, icon}: TextInputProps = $props();

    /**
     * Predefined size classes for the TextBox input.
     * - "sm": h-[2.05rem] text-sm placeholder:text-sm
     * - "md": h-[2.375rem] text-sm placeholder:text-sm
     * - "lg": h-[2.8rem] text-lg placeholder:text-lg
     */
    let sizeStyle: Record<TextInputSize, string> = {
        sm: "h-[2.05rem] text-sm placeholder:text-sm",
        md: "h-[2.375rem] text-sm placeholder:text-sm",
        lg: "h-[2.8rem] text-lg placeholder:text-lg"
    };

</script>

<div class="flex flex-col gap-1 w-full">
    {#if label}{@render label()}{:else}{#if labelText}<label for={id} class="text-sm font-medium text-neutral-600 ml-1">{labelText}</label>{/if}{/if}
    <div class="relative">
        {#if icon}<div class="absolute inset-y-0 left-0 flex items-center justify-center rounded-l-primary m-0.5 w-10">{@render icon()}</div>{/if}
        <input {disabled} {required} {type} {id} name={name ? name: id} {placeholder} {onchange} {onmouseup} bind:value 
            class={twMerge("rounded-primary border-border-primary focus:border-primary-500 focus:ring-primary-500 placeholder:opacity-50 disabled:bg-neutral-300/30 disabled:border-gray-300/30",
            error ? "bg-red-50 border-red-300 ring-red-300" : "", 
            icon ? "pl-10" : "",
            sizeStyle[size], inputClasses)}
        />
    </div>
    {#if error}
    <p class="text-sm text-red-500 mt-0.5 bg-red-100/30 px-2 rounded-primary">{error}</p>
    {/if}
</div>