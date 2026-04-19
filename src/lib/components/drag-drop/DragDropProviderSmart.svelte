<!--
@component DragDropProviderSmart

A self-managing drag-and-drop zone that automatically handles `consider` / `finalize`
events and maintains its own internal item list. Supports cross-zone transfers with
`ontransfer` and `onreceive` callbacks.

Use `DragDropProvider` instead if you want full manual control over the item list.

## Props

All `DragDropZoneOptions` props (except `items` and `onActiveItemChange`) are accepted, plus:

- `items: T[]` — Required. External item array. Synced back into internal state when not dragging.
- `isolated?: boolean = false` — Creates an independent drag context (no cross-zone).
- `parentTag?: keyof HTMLElementTagNameMap = 'ul'` — HTML tag for the container element.
- `ontransfer?: (detail) => void` — Fires when an item leaves this zone to another.
- `onreceive?: (detail) => void` — Fires when an item arrives from another zone.
- `children?: Snippet<[{ items, isDragging, activeItem, draggedIndex }]>` — Slot with managed state.
- `class?: string` — Extra classes on the container element.

## Example

```svelte
<script>
  let list = $state([{ id: '1', name: 'Alpha' }, { id: '2', name: 'Beta' }]);
  const getId = (item) => item.id;
</script>

<dragdropprovider items={list} getItemId={getId} zoneId="zone-1"
  ontransfer={({ items }) => (list = items)}
  onreceive={({ items }) => (list = items)}
>
  {#snippet children({ items })}
    {#each items as item (item.id)}
      <li>{item.name}</li>
    {/each}
  {/snippet}
</dragdropprovider>
```
-->

<script lang="ts" module>
    import type { Snippet } from 'svelte';
    import { dragDropZone, type DragDropZoneOptions, type DragDropEvent } from '../../modules/drag-drop/index.js';
    import { createDragDropContext, registerContextOnElement, unregisterContextFromElement, type InternalDragDropContext } from '../../modules/drag-drop/context.js';

    export type DragDropProviderSmartProps<T extends object> = Omit<DragDropZoneOptions<T>, 'items' | 'onActiveItemChange'> & {
        items: T[];
        isolated?: boolean;
        parentTag?: keyof HTMLElementTagNameMap;
        ontransfer?: (detail: { items: T[]; item: T; targetZoneId: string; sourceZoneId: string }) => void;
        onreceive?: (detail: { items: T[]; item: T; sourceZoneId: string; targetZoneId: string }) => void;
        children?: Snippet<[{ items: T[]; isDragging: boolean; activeItem: T | undefined; draggedIndex: number | undefined }]>;
        class?: string;
    };
</script>

<script lang="ts" generics="T extends object">
    let {
        items: externalItems,
        isolated = false,
        parentTag = 'ul',
        ontransfer,
        onreceive,
        children,
        class: className,
        getItemId,
        ...zoneOptions
    }: DragDropProviderSmartProps<T> = $props();

    const ctx: InternalDragDropContext<T> = createDragDropContext<T>(isolated);

    let internalItems = $state<T[]>([...externalItems]);
    let isDragging = $state(false);
    let activeItem = $state<T | undefined>(undefined);
    let draggedIndex = $state<number | undefined>(undefined);
    let isDragActive = $state(false);

    // Order-independent structural comparison (Decision 61)
    function getIdSet(list: T[]): Set<string> {
        return new Set(list.map((item) => getItemId(item)));
    }

    function isStructurallyDifferent(a: T[], b: T[]): boolean {
        if (a.length !== b.length) return true;
        const setA = getIdSet(a);
        for (const item of b) {
            if (!setA.has(getItemId(item))) return true;
        }
        return false;
    }

    // React to external items changes (Decision 42)
    $effect(() => {
        if (isDragActive) return; // freeze during drag
        if (isStructurallyDifferent(internalItems, externalItems)) {
            internalItems = [...externalItems];
        }
    });

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
        isDragActive = detail.item !== undefined;
        activeItem = detail.item;
        draggedIndex = detail.index;
    }

    function handleConsider(e: CustomEvent<DragDropEvent<T>>) {
        internalItems = e.detail.items;
    }

    function handleFinalize(e: CustomEvent<DragDropEvent<T>>) {
        const { trigger } = e.detail.info;

        if (trigger === 'droppedIntoZone') {
            // Same-zone drop or receiving from another zone
            const prevItems = internalItems;
            internalItems = e.detail.items;

            // Check if this was a cross-zone receive (an item appeared that wasn't here before)
            const prevIds = getIdSet(prevItems);
            const newItem = e.detail.items.find((item) => !prevIds.has(getItemId(item)));
            if (newItem) {
                // This zone received an item from another zone
                const activeDrag = ctx.getActiveDrag();
                if (activeDrag) {
                    onreceive?.({
                        items: internalItems,
                        item: newItem,
                        sourceZoneId: activeDrag.sourceZoneId,
                        targetZoneId: zoneOptions.zoneId ?? ''
                    });
                }
            }
        } else if (trigger === 'removedFromZone') {
            // This zone sent an item to another zone
            const prevIds = getIdSet(internalItems);
            const removedItem = internalItems.find((item) => !e.detail.items.some((ni) => getItemId(ni) === getItemId(item)));
            internalItems = e.detail.items;

            if (removedItem) {
                const activeDrag = ctx.getActiveDrag();
                ontransfer?.({
                    items: internalItems,
                    item: removedItem,
                    targetZoneId: activeDrag?.currentZoneId ?? '',
                    sourceZoneId: zoneOptions.zoneId ?? ''
                });
            }
        } else if (trigger === 'droppedOutsideOfAny') {
            internalItems = e.detail.items;
        }
    }

    const mergedOptions: DragDropZoneOptions<T> = $derived({
        ...zoneOptions,
        getItemId,
        items: internalItems,
        onActiveItemChange: handleActiveItemChange
    });
</script>

<svelte:element
    this={parentTag}
    use:registerCtx
    use:dragDropZone={mergedOptions}
    class={className}
    onconsider={handleConsider}
    onfinalize={handleFinalize}
>
    {@render children?.({ items: internalItems, isDragging, activeItem, draggedIndex })}
</svelte:element>
