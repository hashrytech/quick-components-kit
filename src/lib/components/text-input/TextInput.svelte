<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { FullAutoFill } from 'svelte/elements';
    import type { ClassNameValue } from 'tailwind-merge';

    /**
     * Predefined size classes for the TextBox input.
     * - "sm": h-[2.05rem] text-sm placeholder:text-sm
     * - "md": h-[2.375rem] text-sm placeholder:text-sm
     * - "lg": h-[2.8rem] text-lg placeholder:text-lg
    */
    export type TextInputSize = "sm" | "md" | "lg";
    export type TextInputType = "text" | "password" | "number" | "email" | "tel" | "url" | "search" | "date" | "datetime-local" | "time" | "month" | "week" | "color";
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
        type?: TextInputType;
        placeholder?: string;
        labelText?: string;
        labelPosition?: "top" | "left" | "right" | "bottom";
        size?: TextInputSize;
        disabled?: boolean;
        required?: boolean;
        pattern?: string;
        error?: string;        
        labelClass?: ClassNameValue;
        firstDivClass?: ClassNameValue;
        secondDivClass?: ClassNameValue;        
        thirdDivClass?: ClassNameValue;
        autocomplete?: FullAutoFill | null;
        inputmode?: InputMode;
        min?: number;
        max?: number;
        step?: number;
        debounceDelay?: number;
        forcePositiveNumber?: boolean;
        onInput?: (value: string|number|null) => void;
        onchange?: (event: Event) => void;
        onmouseup?: () => void;
        label?: Snippet;
        leftIcon?: Snippet;
        rightIcon?: Snippet;
        class?: ClassNameValue;
    };
    

</script>

<script lang="ts">
    import { twMerge } from 'tailwind-merge';

    let { 
        id, 
        type="text", 
        name="", 
        value=$bindable(""), 
        placeholder="", 
        labelText="",
        labelClass, 
        labelPosition="top",
        size="md", 
        disabled=false, 
        required=false, 
        pattern,
        error,
        firstDivClass, 
        secondDivClass,
        thirdDivClass,
        autocomplete, 
        inputmode,
        min,
        max,
        step,
        debounceDelay=300, //ms
        forcePositiveNumber=false,
        onchange,
        onInput,
        onmouseup, 
        label, 
        leftIcon, 
        rightIcon, 
        ...restProps}: TextInputProps = $props();

    /**
     * Predefined size classes for the TextBox input.
     * - "sm": h-[2.05rem] text-sm placeholder:text-sm
     * - "md": h-[2.375rem] text-sm placeholder:text-sm
     * - "lg": h-[2.8rem] text-lg placeholder:text-lg
     */
    let sizeStyle: Record<TextInputSize, string> = {
        sm: "text-sm placeholder:text-sm px-2.5",
        md: "text-sm placeholder:text-sm px-2.5",
        lg: "text-base placeholder:text-base px-3"
    };

    let textBoxStyle: Record<TextInputSize, string> = {
        sm: "h-[2.05rem]",
        md: "h-[2.375rem]",
        lg: "h-[2.8rem]"
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
        if (forcePositiveNumber) {
            localValue = sanitizePositiveNumber(localValue);
            (e.target as HTMLInputElement).value = localValue; // reflect sanitized value in the UI
        }

        if(max && max > 0){
            if(Number(value) > max){
                localValue = String(max);
                (e.target as HTMLInputElement).value = localValue; // reflect max value in the UI
            }
        }

        if(min && min > 0){
            if(Number(value) < min){
                localValue = String(min);
                (e.target as HTMLInputElement).value = localValue; // reflect min value in the UI
            }
        }

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			value = localValue; // sync to bound value after delay
			onInput?.(value); // call handler if provided
		}, debounceDelay);
	}

    function sanitizePositiveNumber(value: string | number | null): string {
        // Handle null, undefined, or empty string
        if (value === null || value === undefined || value === "") {
            return "1";
        }

        // Convert to string and strip non-digits
        let v = value.toString().replace(/[^0-9]/g, "") || "1";

        // Convert to number
        let num = parseInt(v, 10);

        // If NaN, zero, or negative → force to 1
        if (isNaN(num) || num <= 0) {
            return "1";
        }

        // Return normalized positive integer as string
        return String(num);
    }

</script>

<div class={twMerge("", firstDivClass)}>
    <div class={twMerge("flex rounded-primary", directionClass[labelPosition] ?? directionClass.top, secondDivClass)}>
        
        {#if label}{@render label()}{/if}
        {#if !label && labelText}<label for={id} class={twMerge("text-sm font-medium text-primary-label-text ml-1", labelClass)}>{labelText}</label>{/if}

        <!-- Text Box -->
        <div class={twMerge("flex flex-row items-center rounded-primary border border-primary-input-border focus-within:ring focus-within:border-primary-focus focus-within:ring-primary-focus has-[input:disabled]:bg-neutral-300/30 has-[input:disabled]:border-neutral-300/30", 
            error ? "bg-red-50 border-red-300" : "", textBoxStyle[size], thirdDivClass)}>
            
            {#if leftIcon}<div class="h-full flex flex-col items-center justify-center {size == 'lg' ? 'pl-3' : 'pl-2.5'}">{@render leftIcon()}</div>{/if}
            
            <input {disabled} {required} {type} {id} name={name ? name: id} {placeholder} {pattern} {onmouseup} bind:value {autocomplete} {inputmode} {step} {min} {max} oninput={handleInput}
                class={twMerge("border-0 focus:border-0 focus:ring-0 active:border-0 outline-none p-0 bg-transparent placeholder:text-neutral-600/50 h-full w-full rounded-primary", sizeStyle[size], restProps.class)} />

            {#if rightIcon}<div class="h-full flex flex-col items-center justify-center {size == 'lg' ? 'pr-3' : 'pr-2.5'}">{@render rightIcon()}</div>{/if}
        </div>
        
    </div>
    
    {#if error}
    <p class="text-sm text-red-500 mt-0.5 bg-red-100/30 px-2 rounded-primary">{error}</p>
    {/if}
    
</div>