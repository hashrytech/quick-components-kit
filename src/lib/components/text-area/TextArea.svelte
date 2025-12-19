<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { FullAutoFill } from 'svelte/elements';
    import type { ClassNameValue } from 'tailwind-merge';

    /**
     * Predefined size classes for the TextArea input.
     * - "sm": h-[2.05rem] text-sm placeholder:text-sm
     * - "md": h-[2.375rem] text-sm placeholder:text-sm
     * - "lg": h-[2.8rem] text-lg placeholder:text-lg
    */
    export type TextAreaSize = "sm" | "md" | "lg";
    export type TextInputType = "text" | "password" | "number" | "email" | "tel" | "url" | "search";
    export type InputMode = "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";

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
        value?: string|number|null;        
        placeholder?: string;
        labelText?: string;
        labelPosition?: "top" | "left" | "right" | "bottom";
        size?: TextAreaSize;
        disabled?: boolean;
        required?: boolean;
        error?: string;
        labelClass?: ClassNameValue;
        firstDivClass?: ClassNameValue;
        secondDivClass?: ClassNameValue;
        autocomplete?: FullAutoFill | null;        
        minlength?: number;
        maxlength?: number;
        debounceDelay?: number;
        onInput?: (value: string|number) => void;
        onchange?: (event: Event) => void;
        onmouseup?: () => void;
        label?: Snippet;        
        class?: ClassNameValue;
    };
    

</script>

<script lang="ts">
    import { twMerge } from 'tailwind-merge';

    let { 
        id,
        name="", 
        value=$bindable(""), 
        placeholder="", 
        labelText="",
        labelClass, 
        labelPosition="top",
        size="md", 
        disabled=false, 
        required=false, 
        error, 
        firstDivClass, 
        secondDivClass,        
        autocomplete,         
        minlength,
        maxlength,
        debounceDelay=300, //ms
        onchange,
        onInput,
        onmouseup, 
        label,
        ...restProps}: TextInputProps = $props();

    /**
     * Predefined size classes for the TextBox input.
     * - "sm": h-[2.05rem] text-sm placeholder:text-sm
     * - "md": h-[2.375rem] text-sm placeholder:text-sm
     * - "lg": h-[2.8rem] text-lg placeholder:text-lg
     */
    let sizeStyle: Record<TextAreaSize, string> = {
        sm: "text-sm placeholder:text-sm px-2.5",
        md: "text-sm placeholder:text-sm px-2.5",
        lg: "text-base placeholder:text-base px-3"
    };

    const directionClass = {
        top: "flex-col gap-1",
        bottom: "flex-col-reverse gap-1",
        left: "flex-row items-center gap-2",
        right: "flex-row-reverse items-center gap-2",
    };

    // --- Debounce logic ---
	let localValue = value; // local for immediate typing
	let debounceTimer: ReturnType<typeof setTimeout>;

    function handleInput(e: Event) {
		localValue = (e.target as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			value = localValue; // sync to bound value after delay
			onInput?.(value); // call handler if provided
		}, debounceDelay);
	}

</script>

<div class={twMerge("", firstDivClass)}>
    <div class={twMerge("flex rounded-primary", directionClass[labelPosition] ?? directionClass.top, secondDivClass)}>        
        {#if label}{@render label()}{/if}
        {#if !label && labelText}<label for={id} class={twMerge("text-sm font-medium text-primary-label-text ml-1", labelClass)}>{labelText}</label>{/if}        
            
        <textarea {disabled} {required} {id} name={name ? name: id} {placeholder} {onmouseup} bind:value {autocomplete} {minlength} {maxlength} oninput={handleInput}
            class={twMerge("placeholder:text-neutral-600/50 h-full w-full rounded-primary border border-primary-input-border focus-within:ring focus-within:border-primary-focus focus-within:ring-primary-focus disabled:bg-neutral-300/30 disabled:border-neutral-300/30", sizeStyle[size], restProps.class)}>
        </textarea>
    </div>
    
    {#if error}
    <p class="text-sm text-red-500 mt-0.5 bg-red-100/30 px-2 rounded-primary">{error}</p>
    {/if}
    
</div>