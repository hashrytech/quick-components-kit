<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import type { ClassNameValue } from 'tailwind-merge';

  type ForwardedSpanProps = Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'onclick'>;

  /**
   * @component Icon
   *
   * Renders an Iconify CSS icon as a `<span>` using the Tailwind 4 CSS approach.
   * See: https://iconify.design/docs/usage/css/tailwind/tailwind4/
   *
   * ## Props
   *
   * - `icon` — Iconify class string. The consuming app must enable `@iconify/tailwind4`
   *   and install the icon collection used by that class.
   * - `class?` — Additional Tailwind classes for size, colour, animation, etc. Icons have no
   *   intrinsic size — always pass a size class such as `size-5`.
   * - `onclick?` — Click handler. When provided, `role="button"` and keyboard support
   *   (Enter / Space) are added automatically.
   * - All standard `<span>` HTML attributes are forwarded (`aria-*`, `data-*`, `tabindex`, etc.).
   *   Pass `aria-label` to mark the icon as meaningful; omitting it marks it `aria-hidden`.
   */
  export type IconProps = ForwardedSpanProps & {
    icon: string;
    onclick?: (event: MouseEvent) => void;
    class?: ClassNameValue;
  };
</script>

<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  let { icon, onclick, class: className, 'aria-label': ariaLabel, ...rest }: IconProps = $props();

  const isInteractive = $derived(!!onclick);

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
  class={twMerge('inline-block shrink-0', icon, className)}
  role={isInteractive ? 'button' : undefined}
  tabindex={isInteractive ? 0 : undefined}
  aria-label={ariaLabel}
  aria-hidden={!isInteractive && !ariaLabel ? true : undefined}
  {onclick}
  onkeydown={isInteractive ? handleKeydown : undefined}
  {...rest}
></span>
