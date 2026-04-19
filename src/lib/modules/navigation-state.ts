export type NavigationStateOptions = {
  /**
   * Initial URL search params value. Accepts any form that `URLSearchParams` accepts:
   * a query string, a `string[][]` of key-value pairs, a plain object, or an existing
   * `URLSearchParams` instance.
   */
  init?: string[][] | Record<string, string> | string | URLSearchParams;
  /**
   * Listeners to register immediately. Each function is called with the serialised
   * query string whenever the state changes (via `navigate`, `search`, `filter`, etc.).
   */
  onNavigateFns?: Array<(queryString?: string) => void | Promise<void>>;
  /**
   * Key/value pairs that are always present in the params. They are set on construction
   * and are protected from deletion in `clear()`.
   */
  defaultParams?: Record<string, string | number | boolean>;
};

/**
 * @class NavigationState
 *
 * A reactive URL search-param store built on top of `URLSearchParams`. Manages
 * pagination, search terms, and arbitrary filter params, and notifies registered
 * listeners whenever state changes so UI can re-fetch or update the browser URL.
 *
 * ## Key methods
 *
 * | Method | Description |
 * |--------|-------------|
 * | `onNavigate(fn)` | Register a change listener. Returns an unsubscribe function. |
 * | `navigate()` | Emit the current state to all listeners without changing params. |
 * | `clone()` | Return a new `NavigationState` with the same params (for Svelte reactivity). |
 * | `clear(keys?)` | Delete all non-default params, or only the specified keys. |
 * | `search(term)` | Set the search param and reset pagination. Pass `null` or `""` to clear. |
 * | `filter(key, value)` | Set a filter param and reset pagination. |
 * | `removeFilter(key, value)` | Remove a specific filter value. |
 * | `paginate(values)` | Replace pagination params (limit/offset) and emit. |
 *
 * ## Usage
 *
 * ```ts
 * const nav = new NavigationState({
 *   defaultParams: { limit: 20, offset: 0 },
 *   onNavigateFns: [(qs) => fetchData(qs)],
 * });
 *
 * // Listen for changes
 * const unsub = nav.onNavigate((qs) => console.log('changed:', qs));
 *
 * // Search (clears pagination automatically)
 * await nav.search('hello');
 *
 * // Filter
 * await nav.filter('status', 'active');
 *
 * // Clear everything except defaultParams
 * nav.clear();
 *
 * // Clean up listener
 * unsub();
 * ```
 */
export class NavigationState extends URLSearchParams {
  static readonly SEARCH_PARAM: string = 'q';
  static readonly LIMIT_PARAM: string = 'limit';
  static readonly OFFSET_PARAM: string = 'offset';

  private listeners = new Set<(queryString?: string) => void>();
  private defaultParams?: Record<string, string | number | boolean>;
  private onNavigateFns?: Array<(queryString?: string) => void | Promise<void>>;

  constructor(opts: NavigationStateOptions = {}) {
    super(opts.init);
    this.defaultParams = opts.defaultParams ?? {};
    this.onNavigateFns = opts.onNavigateFns ?? [];
    if (opts.onNavigateFns) {
      opts.onNavigateFns.forEach((fn) => this.onNavigate(fn));
    }
    this.setDefaultParams(this.defaultParams);
  }

  /* NOTE: arrow functions preserve 'this' when passed as Svelte 5 bindings or props */

  private emit = () => {
    for (const fn of this.listeners) fn(this.toString());
  };

  /**
   * Register a listener that is called with the serialised query string on every change.
   * @returns An unsubscribe function that removes the listener when called.
   *
   * @example
   * ```ts
   * const unsub = nav.onNavigate((qs) => fetch(`/api/items?${qs}`));
   * // later:
   * unsub();
   * ```
   */
  public onNavigate = (fn: (queryString?: string) => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  /**
   * Emit the current state to all listeners without modifying any params.
   * Useful for triggering an initial data fetch after setting up listeners.
   */
  public navigate = async () => {
    this.emit();
  };

  /**
   * Return a new `NavigationState` instance with the same params, listeners, and
   * defaults. Use this when you need a new object reference for Svelte reactivity.
   */
  public clone = (): NavigationState => {
    return new NavigationState({
      init: this,
      onNavigateFns: this.onNavigateFns,
      defaultParams: this.defaultParams,
    });
  };

  /**
   * Delete params. If `keyList` is provided, only those keys are deleted; otherwise
   * every key that is not in `defaultParams` is deleted.
   *
   * @param keyList - Optional list of specific keys to clear.
   *
   * @example
   * ```ts
   * nav.clear();               // clear all non-default params
   * nav.clear(['status', 'q']); // clear only these two keys
   * ```
   */
  public clear = (keyList?: string[]): void => {
    // for...of iterates values; for...in would iterate array indices ("0","1","2")
    const keys = keyList && keyList.length > 0 ? keyList : Array.from(this.keys());
    for (const key of keys) {
      const isDefaultKey = this.defaultParams && key in this.defaultParams;
      if (!isDefaultKey) this.delete(key);
    }
  };

  /** Set a single default param (does not emit). */
  public setDefaultParam = (key: string, value: string) => {
    this.set(key, value);
  };

  /** Set multiple default params at once (does not emit). */
  public setDefaultParams = (params: Record<string, string | number | boolean>) => {
    for (const key in params) {
      this.set(key, String(params[key]));
    }
  };

  /** Remove the limit and offset pagination params without emitting. */
  public clearPagination = () => {
    this.delete(NavigationState.LIMIT_PARAM);
    this.delete(NavigationState.OFFSET_PARAM);
  };

  /**
   * Replace pagination params and emit.
   *
   * @example
   * ```ts
   * await nav.paginate({ limit: '20', offset: '40' });
   * ```
   */
  public paginate = async (values: Record<string, string>) => {
    this.clearPagination();
    for (const key in values) {
      this.set(key, values[key]);
    }
    this.emit();
  };

  /**
   * Set the search term param and reset pagination, then emit.
   * Pass `null` or `""` to clear the search param.
   *
   * Note: `0` (the number zero) is treated as a valid search term and will be set.
   *
   * @example
   * ```ts
   * await nav.search('hello');  // sets ?q=hello
   * await nav.search(null);     // removes ?q
   * await nav.search('');       // removes ?q
   * ```
   */
  public search = async (term: string | number | null) => {
    this.clearPagination();
    this.delete(NavigationState.SEARCH_PARAM);
    // Use explicit null/empty check — `if (term)` would incorrectly skip 0
    if (term !== null && term !== undefined && term !== '') {
      this.set(NavigationState.SEARCH_PARAM, String(term));
    }
    this.emit();
  };

  /**
   * Set a filter param and reset pagination, then emit.
   *
   * @example
   * ```ts
   * await nav.filter('status', 'active');
   * await nav.filter('page', 2);
   * ```
   */
  public filter = async (
    key: string,
    value: string | number | boolean | null | undefined | Array<string | number | boolean>
  ) => {
    this.clearPagination();
    this.set(key, String(value));
    this.emit();
  };

  /**
   * Remove a specific filter value for a key, then emit.
   * If `value` is omitted the key is deleted unconditionally.
   *
   * @example
   * ```ts
   * await nav.removeFilter('status', 'active'); // removes only if value matches
   * await nav.removeFilter('status');           // removes the key entirely
   * ```
   */
  public removeFilter = async (
    key: string,
    value?: string | number | boolean | null | undefined | Array<string | number | boolean>
  ) => {
    this.clearPagination();
    if (value === undefined) {
      this.delete(key);
    } else {
      this.getAll(key).forEach((v) => {
        if (v === String(value)) this.delete(key);
      });
    }
    this.emit();
  };
}
