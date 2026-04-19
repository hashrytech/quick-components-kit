/**
 * Options for the `onKeydown` action.
 */
export type KeyHandler = {
  /** The key to listen for, matching `KeyboardEvent.key` (e.g. `"Escape"`, `"Enter"`, `" "`). */
  key: string;
  /** Callback invoked when the key is pressed and has not already been prevented. */
  callback: (event: KeyboardEvent) => void;
};

/**
 * @action onKeydown
 *
 * Svelte action that calls a callback when a specific keyboard key is pressed on the node.
 * Only fires if the event has not already been prevented by another handler.
 *
 * Reactive: pass updated `key` / `callback` via `update` without remounting.
 *
 * @param node - The element to listen on. Must be focusable or contain a focused descendant
 *   for keydown events to reach it (or use on a parent that receives bubbled events).
 * @param options - `{ key, callback }` — see `KeyHandler`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { onKeydown } from '$lib/actions/on-keydown';
 *   let open = $state(true);
 * </script>
 *
 * <!-- Close on Escape -->
 * <div use:onKeydown={{ key: 'Escape', callback: () => (open = false) }} tabindex="-1">
 *   ...
 * </div>
 *
 * <!-- Reactively change the target key -->
 * <div use:onKeydown={{ key: currentKey, callback: handleKey }} tabindex="-1">
 *   ...
 * </div>
 * ```
 */
export function onKeydown(node: HTMLElement, { key, callback }: KeyHandler) {
  const handle = (event: KeyboardEvent) => {
    if (event.key === key && !event.defaultPrevented) {
      callback(event);
    }
  };

  node.addEventListener('keydown', handle);

  return {
    update(newParams: KeyHandler) {
      node.removeEventListener('keydown', handle);
      key = newParams.key;
      callback = newParams.callback;
      node.addEventListener('keydown', handle);
    },
    destroy() {
      node.removeEventListener('keydown', handle);
    }
  };
}
