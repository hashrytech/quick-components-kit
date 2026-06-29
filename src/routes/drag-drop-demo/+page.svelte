<script lang="ts">
    import { flip } from 'svelte/animate';
    import {
        dragDropZone,
        itemId,
        createDragDropContext,
        registerContextOnElement,
        unregisterContextFromElement,
    } from '$lib/modules/drag-drop/index.js';

    type Item = { id: string; label: string };

    // ─── Single-zone reorder (existing) ──────────────────────────────────────
    let items = $state<Item[]>([
        { id: '1', label: 'Item One' },
        { id: '2', label: 'Item Two' },
        { id: '3', label: 'Item Three' },
        { id: '4', label: 'Item Four' },
    ]);

    function consider(e: CustomEvent<{ items: Item[] }>) {
        items = e.detail.items;
    }

    function finalize(e: CustomEvent<{ items: Item[] }>) {
        items = e.detail.items;
    }

    // ─── Cross-zone columns (NEW: createDragDropContext + registerContextOnElement) ──
    // Mirrors how hashry-admin's email editor wires cross-column/cross-section drag:
    //   1. create ONE drag context per group of zones (isolated = independent),
    //   2. register it on an ANCESTOR element of the zones (the action resolves the
    //      context by walking the DOM — it does NOT read Svelte getContext),
    //   3. give every zone the SAME `group`. Zones sharing a context + group exchange items.
    const GROUP = 'demo-columns';
    const dndContext = createDragDropContext<Item>(true);
    function registerCtx(el: HTMLElement) {
        registerContextOnElement(el, dndContext);
        return { destroy: () => unregisterContextFromElement(el) };
    }

    let draggedId = $state<string | undefined>(undefined);
    let placeholderOutline = $state(true);

    let columns = $state<Item[][]>([
        [
            { id: 'a', label: 'Apple' },
            { id: 'b', label: 'Banana' },
        ],
        [{ id: 'c', label: 'Cherry' }],
        [
            { id: 'd', label: 'Date' },
            { id: 'e', label: 'Elderberry' },
        ],
    ]);

    // Each zone emits its OWN new list (the cross-zone contract): the source column
    // fires without the moved item, the target column fires with it. Just write each
    // zone's items back — exactly what the email editor's block_column does.
    function syncColumn(index: number, e: CustomEvent<{ items: Item[] }>) {
        columns = columns.map((col, i) => (i === index ? e.detail.items : col));
    }
</script>

<main style="font-family:system-ui;padding:24px;max-width:760px;">
    <h1>Drag Drop Demo</h1>

    <h2 style="margin-top:8px;">Single zone — reorder</h2>
    <ul
        use:dragDropZone={{ items, getItemId: itemId('id') }}
        onconsider={consider}
        onfinalize={finalize}
        data-testid="zone"
        style="list-style:none;padding:0;width:300px;"
    >
        {#each items as item (item.id)}
            <li
                animate:flip={{ duration: 150 }}
                data-testid="item"
                data-item-id={item.id}
                style="padding:12px;margin:4px 0;background:#eee;"
            >
                <button data-dnd-handle aria-label="drag handle" style="cursor:grab;margin-right:8px;">⠿</button>
                {item.label}
            </li>
        {/each}
    </ul>

    <h2 style="margin-top:32px;">Cross-zone — drag items between columns</h2>
    <p style="color:#475569;font-size:14px;">
        Grab the <strong>⠿</strong> handle and drag an item from one column into another.
        All three columns share one drag context (registered on the wrapper) and the same
        <code>group</code>, so they exchange items. This exercises the newly-exported
        <code>registerContextOnElement</code> / <code>createDragDropContext</code>.
    </p>
    <label style="display:inline-flex;align-items:center;gap:6px;font-size:14px;color:#475569;margin-bottom:10px;">
        <input type="checkbox" bind:checked={placeholderOutline} />
        Show dashed placeholder outline
    </label>
    <div use:registerCtx style="display:flex;gap:16px;align-items:flex-start;">
        {#each columns as column, index (index)}
            <ul
                use:dragDropZone={{ items: column, getItemId: itemId('id'), group: GROUP, swapThreshold: 0.7, hideDraggedSource: false, onActiveItemChange: (d) => (draggedId = d.item ? d.item.id : undefined) }}
                onconsider={(e) => syncColumn(index, e)}
                onfinalize={(e) => syncColumn(index, e)}
                data-testid={`column-${index}`}
                style="list-style:none;margin:0;padding:8px;min-height:96px;width:180px;background:#f1f5f9;border:1px dashed #cbd5e1;border-radius:8px;"
            >
                {#each column as item (item.id)}
                    <li animate:flip={{ duration: 150 }} data-item-id={item.id} style="list-style:none;margin:4px 0;">
                        {#if item.id === draggedId}
                            <div aria-hidden="true" style={placeholderOutline ? "padding:10px;min-height:40px;border:2px dashed oklch(68.6% 0.1491 81.53);background:oklch(98.6% 0.0256 81.53);border-radius:6px;" : "min-height:40px;"}></div>
                        {:else}
                            <div style="padding:10px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;display:flex;align-items:center;">
                                <button data-dnd-handle aria-label="drag handle" style="cursor:grab;margin-right:8px;">⠿</button>
                                {item.label}
                            </div>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/each}
    </div>

    <pre style="margin-top:16px;background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;font-size:12px;overflow:auto;">{JSON.stringify(columns.map((c) => c.map((i) => i.id)), null, 0)}</pre>
</main>
