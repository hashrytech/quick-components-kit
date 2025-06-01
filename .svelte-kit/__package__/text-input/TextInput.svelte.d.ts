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
 * @prop {ClassNameValue} [inputStyle] - Additional Tailwind classes to apply to the input. Example: "border-red-500 text-green-600"
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
    inputStyle?: ClassNameValue;
    size?: TextInputSize;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    onchange?: () => void;
    onmouseup?: () => void;
    label?: Snippet;
    icon?: Snippet;
};
declare const TextInput: import("svelte").Component<TextInputProps, {}, "">;
type TextInput = ReturnType<typeof TextInput>;
export default TextInput;
