<script lang="ts" module>
    import type { Snippet } from 'svelte';
    import { dragDropZone, type DragDropZoneOptions, type DragDropEvent } from '../../modules/drag-drop/index.js';
    import { createDragDropContext, registerContextOnElement, unregisterContextFromElement, type InternalDragDropContext } from '../../modules/drag-drop/context.js';

    export type DragDropProviderProps<T extends object> = Omit<DragDropZoneOptions<T>, 'items'> & {
        items: T[];
        isolated?: boolean;
        parentTag?: keyof HTMLElementTagNameMap;
        onconsider?: (e: CustomEvent<DragDropEvent<T>>) => void;
        onfinalize?: (e: CustomEvent<DragDropEvent<T>>) => void;
        children?: Snippet<[{ isDragging: boolean; activeItem: T | undefined; draggedIndex: number | undefined }]>;
        class?: string;
    };
</script>

<script lang="ts" generics="T extends object">
    let {
        items,
        isolated = false,
        parentTag = 'ul',
        onconsider,
        onfinalize,
        children,
        class: className,
        ...zoneOptions
    }: DragDropProviderProps<T> = $props();

    // createDragDropContext must be called during component init — it calls setContext internally.
    // If isolated=false and a parent context exists, it returns the existing one.
    const ctx: InternalDragDropContext<T> = createDragDropContext<T>(isolated);

    let isDragging = $state(false);
    let activeItem = $state<T | undefined>(undefined);
    let draggedIndex = $state<number | undefined>(undefined);

    let containerEl: HTMLElement | undefined = $state();

    // Register context on the DOM element so child dragDropZone actions can resolve it via WeakMap.
    // This runs as a synchronous action so it fires before child actions.
    function registerCtx(el: HTMLElement) {
        registerContextOnElement(el, ctx);
        return {
            destroy() {
                unregisterContextFromElement(el);
            }
        };
    }

    function handleActiveItemChange(detail: { item: T | undefined; index: number | undefined; trigger: unknown }) {
        isDragging = detail.item !== undefined;
        activeItem = detail.item;
        draggedIndex = detail.index;
    }

    const mergedOptions: DragDropZoneOptions<T> = $derived({
        ...zoneOptions,
        items,
        onActiveItemChange: handleActiveItemChange
    });
</script>

<svelte:element
    this={parentTag}
    use:registerCtx
    use:dragDropZone={mergedOptions}
    bind:this={containerEl}
    class={className}
    {onconsider}
    {onfinalize}
>
    {@render children?.({ isDragging, activeItem, draggedIndex })}
</svelte:element>
