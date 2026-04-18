<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { ClassNameValue } from 'tailwind-merge';

  type ForwardedButtonProps = Omit<HTMLButtonAttributes, 'class' | 'disabled' | 'onclick' | 'type'>;

  export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
  export type ButtonSize = 'sm' | 'md' | 'lg';

  export type ButtonProps = ForwardedButtonProps & {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    disableOnLoading?: boolean;
    icon?: string | Snippet;
    loadingIcon?: string | Snippet;
    iconClass?: ClassNameValue;
    variant?: ButtonVariant;
    size?: ButtonSize;
    class?: ClassNameValue;
    children?: Snippet;
    onclick?: (event: MouseEvent) => void;
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-button hover:bg-primary-button-hover text-white disabled:bg-primary-button/60',
    secondary: 'bg-secondary-button hover:bg-secondary-button-hover text-white disabled:bg-secondary-button/60',
    ghost: 'bg-transparent hover:bg-primary-500/10 text-primary-700 disabled:opacity-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-600/60',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2',
  };
</script>

<script lang="ts">
  import { twMerge } from 'tailwind-merge';
  import { Icon } from '$lib/components/icon/index.js';

  let {
    type = 'button',
    disabled,
    loading,
    disableOnLoading = true,
    icon,
    loadingIcon,
    iconClass,
    variant = 'primary',
    size = 'md',
    children,
    onclick,
    class: className,
    ...rest
  }: ButtonProps = $props();

  const isDisabled = $derived(disabled || (loading && disableOnLoading));
</script>

<button
  {type}
  disabled={isDisabled || undefined}
  aria-busy={loading || undefined}
  class={twMerge(
    'flex flex-row items-center cursor-pointer focus:outline-primary-focus focus:ring focus:ring-primary-focus rounded-primary disabled:cursor-default',
    variantClasses[variant],
    sizeClasses[size],
    className
  )}
  {onclick}
  {...rest}
>
  {#if loading}
    {#if loadingIcon}
      {#if typeof loadingIcon === 'string'}
        <Icon icon={loadingIcon} class={twMerge('animate-spin', iconClass)} />
      {:else}
        <span class="shrink-0 animate-spin">{@render loadingIcon()}</span>
      {/if}
    {:else if icon}
      {#if typeof icon === 'string'}
        <Icon icon={icon} class={twMerge('animate-spin', iconClass)} />
      {:else}
        <span class="shrink-0 animate-spin">{@render icon()}</span>
      {/if}
    {/if}
  {:else if icon}
    {#if typeof icon === 'string'}
      <Icon icon={icon} class={twMerge(iconClass)} />
    {:else}
      {@render icon()}
    {/if}
  {/if}
  {@render children?.()}
</button>
