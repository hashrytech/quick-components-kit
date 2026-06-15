<!--
@component SavedViewTabs

A horizontal, click/state-driven tab row of saved "views" (Shopify-tabs /
Linear-views style). An always-present, non-deletable **Default** tab sits first;
each saved view is a tab with an overflow menu (rename / duplicate / set default /
delete). A trailing **+** creates a new view.

The component is presentational: it raises callbacks and leaves persistence to
the consumer. Bind `activeId` (`null` = the Default tab).

## Props
- `views: SavedViewSummary[]` — the user's saved views (already ordered).
- `activeId?: string | null` — bindable selected view uid (`null` = Default).
- `defaultLabel?: string` — label for the Default tab. Default `"Default"`.
- `onselect?(id)`, `oncreate?()`, `onrename?(id)`, `onduplicate?(id)`,
  `onsetdefault?(id)`, `ondelete?(id)` — action callbacks.
-->

<script lang="ts" module>
	export interface SavedViewSummary {
		uid: string;
		name: string;
		is_default?: boolean;
	}

	export type SavedViewTabsProps = {
		views: SavedViewSummary[];
		activeId?: string | null;
		defaultLabel?: string;
		class?: import('tailwind-merge').ClassNameValue;
		onselect?: (id: string | null) => void;
		oncreate?: () => void;
		onrename?: (id: string) => void;
		onduplicate?: (id: string) => void;
		onsetdefault?: (id: string) => void;
		ondelete?: (id: string) => void;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		views,
		activeId = $bindable(null),
		defaultLabel = 'Default',
		class: className,
		onselect,
		oncreate,
		onrename,
		onduplicate,
		onsetdefault,
		ondelete
	}: SavedViewTabsProps = $props();

	let menuOpenId = $state<string | null>(null);

	// Close the open overflow menu on Escape (in addition to the backdrop click).
	$effect(() => {
		if (!menuOpenId) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') menuOpenId = null;
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	function select(id: string | null) {
		activeId = id;
		onselect?.(id);
	}

	function toggleMenu(id: string) {
		menuOpenId = menuOpenId === id ? null : id;
	}

	function act(fn: ((id: string) => void) | undefined, id: string) {
		menuOpenId = null;
		fn?.(id);
	}

	function tabClass(active: boolean): string {
		return twMerge(
			'px-3 py-1.5 text-sm font-medium whitespace-nowrap border-b-2 cursor-pointer',
			active
				? 'border-primary-input-accent text-neutral-800'
				: 'border-transparent text-neutral-500 hover:text-neutral-800'
		);
	}
</script>

<div class={twMerge('flex flex-row flex-wrap items-center gap-1 border-b border-neutral-200', className)}>
	<!-- `== null` is intentional: highlight Default for both null and undefined activeId. -->
	<button type="button" class={tabClass(activeId == null)} onclick={() => select(null)}>
		{defaultLabel}
	</button>

	{#each views as view (view.uid)}
		<div class="relative flex items-center">
			<button type="button" class={tabClass(activeId === view.uid)} onclick={() => select(view.uid)}>
				{view.name}
				{#if view.is_default}<span aria-label="Default view" title="Default view">★</span>{/if}
			</button>
			<button
				type="button"
				aria-label="View options"
				class="px-1 text-neutral-400 hover:text-neutral-700"
				onclick={() => toggleMenu(view.uid)}>⋯</button
			>

			{#if menuOpenId === view.uid}
				<button
					type="button"
					aria-hidden="true"
					tabindex="-1"
					class="fixed inset-0 z-10 cursor-default"
					onclick={() => (menuOpenId = null)}
				></button>
				<div
					role="menu"
					class="absolute right-0 top-full z-20 mt-1 min-w-36 rounded-md border border-neutral-200 bg-white py-1 shadow-lg"
				>
					<button type="button" role="menuitem" class="block w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-100" onclick={() => act(onrename, view.uid)}>Rename</button>
					<button type="button" role="menuitem" class="block w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-100" onclick={() => act(onduplicate, view.uid)}>Duplicate</button>
					<button type="button" role="menuitem" class="block w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-100" onclick={() => act(onsetdefault, view.uid)}>Set as default</button>
					<button type="button" role="menuitem" class="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50" onclick={() => act(ondelete, view.uid)}>Delete</button>
				</div>
			{/if}
		</div>
	{/each}

	<button
		type="button"
		aria-label="New view"
		class="px-2 py-1.5 text-neutral-500 hover:text-neutral-800"
		onclick={() => oncreate?.()}>+</button
	>
</div>
