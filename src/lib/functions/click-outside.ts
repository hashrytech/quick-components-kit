export type ClickOutsideEvent = MouseEvent | TouchEvent | PointerEvent;

export interface ClickOutsideOptions {
  /**
   * Function to call when clicking outside
   */
  callback: (event: ClickOutsideEvent) => void;

  /**
   * Array of element IDs to ignore
   */
  ignoreIds?: string[];

  /**
   * Whether the action is enabled
   */
  enabled?: boolean;
}

/**
 * Triggers callback when clicking outside the element.
 */
export function clickOutside(node: HTMLElement, options: ClickOutsideOptions): {
  update(options: ClickOutsideOptions): void;  destroy(): void;} {
  let { callback, ignoreIds = [], enabled = true } = options;

  const handleClick = (event: ClickOutsideEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Click inside the node → ignore
    if (node.contains(target)) return;

    // Click is on an ignored element or one of its parents → ignore
    if (ignoreIds.length > 0) {
      let element: HTMLElement | null = target;
      while (element) {
        if (element.id && ignoreIds.includes(element.id)) {
          return;
        }
        element = element.parentElement;
      }
    }

    // Click is outside and not on ignored element
    callback(event);
  };

  // Attach listener
  document.addEventListener('click', handleClick, true);

  return {
    update(newOptions: ClickOutsideOptions) {
      ({ callback, ignoreIds = [], enabled = true } = newOptions);
    },
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
}
