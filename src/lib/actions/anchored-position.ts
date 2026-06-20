/**
 * Placement of the floating element relative to its anchor. The first part is the
 * side the element prefers to sit on; the second is how it aligns along the
 * anchor's edge. The element flips to the opposite side when there isn't room.
 */
export type AnchoredPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/**
 * Options for the `anchoredPosition` action.
 */
export interface AnchoredPositionOptions {
  /** The trigger element the floating node is positioned against. */
  anchor?: HTMLElement | null;
  /** Preferred placement. The side flips automatically when space is tight. Default: `'bottom-start'`. */
  placement?: AnchoredPlacement;
  /** Gap in px between the anchor and the floating node. Default: `8`. */
  gap?: number;
  /** Minimum gap in px to keep from the viewport edges. Default: `8`. */
  padding?: number;
  /** When `false`, the action does nothing (leaves the node in normal flow). Default: `true`. */
  enabled?: boolean;
}

type ResolvedOptions = Required<Omit<AnchoredPositionOptions, 'anchor'>> & Pick<AnchoredPositionOptions, 'anchor'>;

function resolve(options: AnchoredPositionOptions): ResolvedOptions {
  return { placement: 'bottom-start', gap: 8, padding: 8, enabled: true, ...options };
}

/**
 * @action anchoredPosition
 *
 * Positions a floating element (popover panel, dropdown, tooltip) relative to an
 * anchor using `position: fixed`, then keeps it on-screen at any trigger position
 * or viewport size:
 *
 * - **flip** — drops below the anchor by default, flips above when there isn't room;
 * - **shift** — clamps horizontally so it never overflows the left/right edges;
 * - **size** — caps `max-height` to the available space and enables internal scroll.
 *
 * It re-runs on scroll (capture phase, so any scrolling ancestor counts), on window
 * resize, and when the node itself changes size (`ResizeObserver`). `position: fixed`
 * means it is not clipped by `overflow: hidden` ancestors, while staying inside the
 * component's DOM subtree so containment-based `clickOutside` keeps working.
 *
 * @param node - The floating element to position.
 * @param options - See `AnchoredPositionOptions`.
 *
 * @example
 * ```svelte
 * <button bind:this={trigger}>Open</button>
 * {#if open}
 *   <div use:anchoredPosition={{ anchor: trigger, placement: 'bottom-start' }}>…</div>
 * {/if}
 * ```
 */
export function anchoredPosition(node: HTMLElement, options: AnchoredPositionOptions) {
  let opts = resolve(options);

  function reposition(): void {
    const anchor = opts.anchor;
    if (!opts.enabled || !anchor) return;

    const { gap, padding } = opts;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Pin and clear prior constraints so the natural size can be measured.
    node.style.position = 'fixed';
    node.style.maxHeight = '';
    node.style.maxWidth = `${vw - padding * 2}px`;

    const a = anchor.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    const width = rect.width;
    const fullHeight = node.scrollHeight;

    const [side, align] = opts.placement.split('-') as ['bottom' | 'top', 'start' | 'end'];

    // Vertical placement with flip.
    const spaceBelow = vh - a.bottom - gap - padding;
    const spaceAbove = a.top - gap - padding;
    let placeBelow = side !== 'top';
    if (placeBelow && fullHeight > spaceBelow && spaceAbove > spaceBelow) placeBelow = false;
    else if (!placeBelow && fullHeight > spaceAbove && spaceBelow >= spaceAbove) placeBelow = true;

    let top: number;
    let maxHeight: number;
    if (placeBelow) {
      top = a.bottom + gap;
      maxHeight = vh - top - padding;
    } else {
      maxHeight = spaceAbove;
      top = a.top - gap - Math.min(fullHeight, maxHeight);
    }

    // Horizontal alignment with shift (clamp into the viewport).
    let left = align === 'end' ? a.right - width : a.left;
    left = Math.min(left, vw - padding - width);
    left = Math.max(left, padding);

    node.style.left = `${Math.round(left)}px`;
    node.style.top = `${Math.round(top)}px`;
    node.style.maxHeight = `${Math.max(0, Math.floor(maxHeight))}px`;
    node.style.overflowY = 'auto';
  }

  const onScroll = () => reposition();
  const onResize = () => reposition();

  window.addEventListener('scroll', onScroll, true);
  window.addEventListener('resize', onResize);

  const resizeObserver =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => reposition()) : null;
  resizeObserver?.observe(node);

  reposition();
  // One more pass next frame, after fonts/content settle.
  const raf = requestAnimationFrame(reposition);

  return {
    update(newOptions: AnchoredPositionOptions) {
      opts = resolve(newOptions);
      reposition();
    },
    destroy() {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      resizeObserver?.disconnect();
      cancelAnimationFrame(raf);
    }
  };
}
