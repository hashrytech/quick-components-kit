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
     * @prop {TextInputSize} [size] - Size variant ("sm", "md", "lg") with predefined Tailwind styles.
     *        - "sm": h-[2.05rem] text-sm placeholder:text-sm
     *        - "md": h-[2.375rem] text-sm placeholder:text-sm
     *        - "lg": h-[2.8rem] text-lg placeholder:text-lg
     * @prop {() => void} [onchange] - Event handler for change events.
     * @prop {() => void} [onmouseup] - Event handler for mouseup events.
     * @prop {Snippet} [label] - Custom label snippet.
     * @prop {Snippet} [class] - Css classes for the input element.
     */
    export type TextInputProps = {
        id: string;        
        name?: string;
        value?: string;
        type?: TextInputType;
        placeholder?: string;
        labelText?: string;
        size?: TextInputSize;
        disabled?: boolean;
        required?: boolean;
        error?: string;
        onchange?: () => void;
        onmouseup?: () => void;
        label?: Snippet;
        icon?: Snippet;
        class?: ClassNameValue;
    };
    

</script>

<script lang="ts">
    import { twMerge } from 'tailwind-merge';
    
    let { id, type="text", name="", value=$bindable(""), placeholder="", labelText, size="md", disabled=false, required=false, error, onchange, onmouseup, label, icon, ...props}: TextInputProps = $props();

    /**
     * Predefined size classes for the TextBox input.
     * - "sm": h-[2.05rem] text-sm placeholder:text-sm
     * - "md": h-[2.375rem] text-sm placeholder:text-sm
     * - "lg": h-[2.8rem] text-lg placeholder:text-lg
     */
    let sizeStyle: Record<TextInputSize, string> = {
        sm: "h-[2.05rem] text-sm placeholder:text-sm",
        md: "h-[2.375rem] text-sm placeholder:text-sm",
        lg: "h-[2.8rem] text-base placeholder:text-base"
    };

</script>

<div class="flex flex-col gap-1 w-full">
    {#if label}{@render label()}{:else}{#if labelText}<label for={id} class="text-sm font-medium text-primary-label-text ml-1">{labelText}</label>{/if}{/if}
    <div class="relative">
        {#if icon}<div class="absolute inset-y-0 left-0 flex items-center justify-center rounded-l-primary m-0.5 w-10">{@render icon()}</div>{/if}
        <input {disabled} {required} {type} {id} name={name ? name: id} {placeholder} {onchange} {onmouseup} bind:value 
            class={twMerge("rounded-primary border-primary-input-border focus:border-primary-focus focus:ring-primary-focus placeholder:opacity-50 disabled:bg-neutral-300/30 disabled:border-neutral-300/30",
            error ? "bg-red-50 border-red-300" : "", 
            icon ? "pl-10" : "",
            sizeStyle[size], props.class)}
        />
    </div>
    {#if error}
    <p class="text-sm text-red-500 mt-0.5 bg-red-100/30 px-2 rounded-primary">{error}</p>
    {/if}
</div>