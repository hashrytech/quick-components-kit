import type { Component } from 'svelte';

export { default as Drawer } from './Drawer.svelte';

export type DrawerComponent = Component<{
	open?: boolean;
	escapeKeyClose?: boolean;
	disableBodyScroll?: boolean;
	ariaLabel?: string;
	transitionDuration?: number;
	transitionDistance?: number;
	position?: 'left' | 'right' | 'top' | 'bottom';
	overlayClasses?: string;
	class?: string;
	children?: unknown; // Or use Snippet if needed
}>;