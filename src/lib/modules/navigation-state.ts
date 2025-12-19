export type NavigationStateOptions = {
  init?: string[][] | Record<string, string> | string | URLSearchParams;
  onNavigateFns?: Array<(queryString?: string) => void | Promise<void>>;
  defaultParams?: Record<string, string | number | boolean>;
};

export class NavigationState extends URLSearchParams {
    static readonly SEARCH_PARAM: string = "q"
    static readonly LIMIT_PARAM: string = "limit"
    static readonly OFFSET_PARAM: string = "offset"

    private listeners = new Set<(queryString?: string) => void>();    
    private defaultParams?: Record<string, string|number|boolean>;
    private onNavigateFns?: Array<(queryString?: string) => void | Promise<void>>;
    
    constructor(opts: NavigationStateOptions = {}) {
        super(opts.init);
        this.defaultParams = opts.defaultParams ?? {};
        this.onNavigateFns = opts.onNavigateFns ?? [];
        if(opts.onNavigateFns) {
            opts.onNavigateFns.forEach(fn => this.onNavigate(fn));
        }
        this.setDefaultParams(this.defaultParams);
    }

    /* NOTE we use arrow functions because we want to preserve 'this' context when using it as svelte 5 bindings or to pass as functions to components */

    private emit = () => {
        //console.log("Nav Listeners: ", this.listeners.size);
        for (const fn of this.listeners) fn(this.toString());
    }

    public onNavigate = (fn: (queryString?: string) => void) => {        
        this.listeners.add(fn);
        return () => this.listeners.delete(fn); // unsubscribe
    }

    public navigate = async () => {
        this.emit();
    }

    /** Make a copy (so we can return new instances for Svelte reactivity) */
    public clone = (): NavigationState => {
        return new NavigationState({init: this, onNavigateFns: this.onNavigateFns, defaultParams: this.defaultParams});
    }

    /** Clear the specified keys (or everything if no keys passed) */
    public clear = (keyList?: string[]): void => {
        const all_keys = keyList && keyList.length > 0 ? keyList : Array.from(this.keys());
        for(const akey in all_keys){
            const isDefaultkey = this.defaultParams && akey in this.defaultParams;
            if(!isDefaultkey)
                this.delete(akey);
        }
    }

    public setDefaultParam = (key: string, value: string) => {
        this.set(key, value);
    }

    public setDefaultParams = (params: Record<string, string|number|boolean>) => {
        for (const key in params) {
            this.set(key, String(params[key]));
        }
    }

    public clearPagination = () => {
        this.delete(NavigationState.LIMIT_PARAM);
        this.delete(NavigationState.OFFSET_PARAM);
    }

    /* The below emit events after performing their actions */

    public paginate = async (values: Record<string, string>) => {
        this.clearPagination();
        for(const key in values){
            this.set(key, values[key]);
        }        
        this.emit();
    }
    
    public search = async (term: string | number | null) => {
        this.clearPagination();
        this.delete(NavigationState.SEARCH_PARAM);
        if(term) this.set(NavigationState.SEARCH_PARAM, String(term));
        this.emit();
    };
    
    public filter = async (key: string, value: string | number | boolean | null | undefined | Array<string | number | boolean>) => {
        this.clearPagination();
        this.set(key, String(value));
        this.emit();
    }

    public removeFilter = async (key: string, value?: string | number | boolean | null | undefined | Array<string | number | boolean>) => {
        this.clearPagination();
        this.getAll(key).forEach((v) => {
            if (v === String(value)) {
                this.delete(key);
            }
        });
        this.emit();
    }
}
