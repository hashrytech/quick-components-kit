<!--
@component Radio

A styled radio input with label and size variants. Use `bind:group` to link
multiple radios into a group — the selected value is reflected in the bound variable.

All native `<input type="radio">` attributes (except `size`, `type`, `class`) are forwarded.

## Props

- `id: string` — Required. Unique id for the input element.
- `label?: string` — Label text rendered next to the radio.
- `labelPosition?: 'left' | 'right' | 'top' | 'bottom'` — Label placement. Default: `'right'`.
- `value?: unknown` — The value this radio represents.
- `group?: unknown` — Bindable. The currently selected value in the group.
- `size?: 'sm' | 'md' | 'lg'` — Radio circle size. Default: `'md'`.
- `disabled?: boolean` — Disables the input.
- `name?: string` — Groups radios for form submission; defaults to `id`.
- `labelClass?: ClassNameValue` — Extra classes on the label `<span>`.
- `containerClass?: ClassNameValue` — Extra classes on the wrapping `<label>`.
- `class?: ClassNameValue` — Extra classes on the `<input>` element.

## Example

```svelte
<script>
  import { Radio } from '$lib/components/radio';
  let selected = $state('a');
</script>

<radio id="opt-a" label="Option A" value="a" bind:group={selected} />
<radio id="opt-b" label="Option B" value="b" bind:group={selected} />
```
-->

<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { ClassNameValue } from 'tailwind-merge';
  import { twMerge } from 'tailwind-merge';

  export type RadioProps = Omit<HTMLInputAttributes, 'size' | 'type' | 'class'> & {
    id: string;
    label?: string;
    group?: unknown;
    labelPosition?: 'left' | 'right' | 'top' | 'bottom';
    size?: 'sm' | 'md' | 'lg';
    children?: Snippet;
    icon?: Snippet;
    labelClass?: ClassNameValue;
    class?: ClassNameValue;
    containerClass?: ClassNameValue;
  };

</script>

<script lang="ts"> 

  let {
    id,
    name,
    label = "",
    labelPosition = "right",
    value = $bindable(),
    group = $bindable(),
    size = "md",
    disabled = $bindable(false),
    containerClass,
    labelClass,
    class: className,
    ...inputProps
  }: RadioProps = $props();

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const directionClass = {
    left: 'flex-row',
    right: 'flex-row',
    top: 'flex-col',
    bottom: 'flex-col',
  };

  const alignmentClass = {
    left: 'items-center',
    right: 'items-center',
    top: 'items-start',
    bottom: 'items-start',
  };

</script>

<label for={id} class={twMerge("flex gap-2 cursor-pointer select-none", directionClass[labelPosition], alignmentClass[labelPosition], containerClass)}>
  {#if labelPosition === "left" || labelPosition === "top"}
    <span class={twMerge("text-sm", labelClass)}>{label}</span>
  {/if}
  <input {...inputProps} {id} name={name ? name : id} type="radio" {value} bind:group {disabled} 
    class={twMerge("focus:ring-2 ring-primary-focus text-primary-input-accent accent-primary-input-accent cursor-pointer",
    group === value ? "border-primary-input-accent" : "border-primary-input-border", sizeMap[size], className)} />
  {#if labelPosition === "right" || labelPosition === "bottom"}
    <span class={twMerge("text-sm", labelClass)}>{label}</span>
  {/if}
</label>
