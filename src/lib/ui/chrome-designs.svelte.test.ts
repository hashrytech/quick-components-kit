/**
 * The second chrome designs, and the preview manifest the admin builder reads.
 *
 * The manifest is the contract between this kit and the builder's gallery: if
 * an entry is missing or its sample props do not render, a merchant sees an
 * empty card and cannot tell one design from another.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';

import Header2 from './headers/header-2/Header2.svelte';
import Footer2 from './footers/footer-2/Footer2.svelte';
import { COMPONENT_PREVIEWS } from './component-previews.js';

const LINKS = [
	{ text: 'Home', href: '/' },
	{ text: 'Shop', href: '/shop' }
];

describe('Header2 (centred)', () => {
	it('renders the brand and its navigation', () => {
		render(Header2, { props: { title: 'Corner Shop', links: LINKS } });
		expect(screen.getByText('Corner Shop')).toBeTruthy();
		expect(screen.getByText('Shop')).toBeTruthy();
	});

	it('keeps a long shop name from running under the cart', () => {
		// The controls are absolutely positioned at the right; without an inset
		// and a truncate, a long name sits on top of them at 280px.
		render(Header2, {
			props: { title: 'An Extremely Long Shop Name That Would Overflow', cartLink: '/cart' }
		});
		const brand = screen.getByText('An Extremely Long Shop Name That Would Overflow');
		expect(brand.className).toContain('truncate');
	});

	it('shows a cart badge only when there is something in it', () => {
		const { unmount } = render(Header2, {
			props: { title: 'Shop', cartLink: '/cart', cartCount: 0 }
		});
		expect(screen.queryByText('0')).toBeNull();
		unmount();

		render(Header2, { props: { title: 'Shop', cartLink: '/cart', cartCount: 3 } });
		expect(screen.getByText('3')).toBeTruthy();
	});
});

describe('Footer2 (minimal)', () => {
	it('renders the brand and copyright', () => {
		render(Footer2, { props: { title: 'Corner Shop', copyright: '© 2026 Corner Shop' } });
		expect(screen.getByText('Corner Shop')).toBeTruthy();
		expect(screen.getByText('© 2026 Corner Shop')).toBeTruthy();
	});

	it('accepts no links at all', () => {
		// Choosing the minimal design is choosing not to have them. The
		// renderer must not be able to inject links it has nowhere to put.
		render(Footer2, {
			props: { title: 'Corner Shop', links: LINKS } as never
		});
		expect(screen.queryByText('Home')).toBeNull();
		expect(screen.queryByText('Shop')).toBeNull();
	});
});

describe('preview manifest', () => {
	it('covers every tenant-composable component', () => {
		expect(Object.keys(COMPONENT_PREVIEWS).sort()).toEqual([
			'banner_1',
			'featured_products_1',
			'footer_1',
			'footer_2',
			'header_1',
			'header_2',
			'product_list_1'
		]);
	});

	it('labels each design by how it looks, not by its id', () => {
		// "Header 2" is the problem the gallery exists to solve.
		for (const [id, preview] of Object.entries(COMPONENT_PREVIEWS)) {
			expect(preview.label, id).toBeTruthy();
			expect(preview.label.toLowerCase(), id).not.toContain(id.replace('_', ' '));
		}
	});

	it('renders every chrome design from its own sample props', () => {
		// The gallery relies on this: an entry whose samples do not render
		// leaves a merchant with a blank card.
		for (const id of ['header_1', 'header_2', 'footer_1', 'footer_2']) {
			const preview = COMPONENT_PREVIEWS[id];
			const { unmount } = render(preview.component, { props: preview.sampleProps as never });
			expect(screen.getByText('Your Store'), id).toBeTruthy();
			unmount();
		}
	});
});
