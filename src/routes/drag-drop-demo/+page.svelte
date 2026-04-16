<script lang="ts">
    import { dragDropZone, itemId } from '$lib/modules/drag-drop/index.js';

    type Item = { id: string; label: string };

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
</script>

<main>
    <h1>Drag Drop Demo</h1>
    <ul
        use:dragDropZone={{ items, getItemId: itemId('id') }}
        onconsider={consider}
        onfinalize={finalize}
        data-testid="zone"
        style="list-style:none;padding:0;width:300px;"
    >
        {#each items as item (item.id)}
            <li
                data-testid="item"
                data-item-id={item.id}
                style="padding:12px;margin:4px 0;background:#eee;cursor:grab;"
            >
                <button data-dnd-handle aria-label="drag handle" style="cursor:grab;margin-right:8px;">⠿</button>
                {item.label}
            </li>
        {/each}
    </ul>
</main>
