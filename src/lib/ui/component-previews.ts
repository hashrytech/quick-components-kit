/**
 * Preview metadata for the tenant-composable storefront components.
 *
 * The admin builder renders these components live to show a merchant what each
 * design looks like. It renders the REAL component rather than a picture on
 * purpose: a screenshot goes stale silently — someone changes the header,
 * nobody redraws the image, and a merchant picks a design and gets something
 * else. A live render cannot drift.
 *
 * `sampleProps` fills the gaps the admin cannot: a shop being edited supplies
 * its own name, logo and page links, but nothing supplies a cart count or a
 * product list. Anything the caller passes wins over the sample.
 *
 * These props were previously hardcoded in `routes/quick-store/+page.svelte`.
 * That demo page now consumes this manifest, so the props have one definition
 * and the page doubles as a live check that every preview still renders.
 */
import type { Component } from 'svelte';

import { Header1 } from './headers/header-1/index.js';
import { Header2 } from './headers/header-2/index.js';
import { Footer1 } from './footers/footer-1/index.js';
import { Footer2 } from './footers/footer-2/index.js';
import { Banner1 } from './banners/banner-1/index.js';
import { FeaturedProducts1 } from './featured-products/featured-products-1/index.js';
import { ProductList1 } from './product-list/product-list-1/index.js';

export type ComponentPreview = {
	/** What a merchant sees under the card. Describes the LOOK — "Centred" —
	 *  never the id. */
	label: string;
	/** The real component, rendered small. */
	component: Component<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
	/** Stand-ins for props no caller can supply. Overridden by real values. */
	sampleProps: Record<string, unknown>;
	/** Roughly how tall the design is relative to its width, so a gallery can
	 *  reserve the right space before it renders. */
	aspect: number;
};

/** Nav links for chrome previews. Short and generic — a preview should read as
 *  a shape, not as someone else's shop. */
const SAMPLE_LINKS = [
	{ text: 'Home', href: '#' },
	{ text: 'Shop', href: '#' },
	{ text: 'About', href: '#' }
];

/** Lifted verbatim from the demo route so the two cannot disagree. */
export const SAMPLE_PRODUCTS = [
	{
		uid: 'preview-1',
		title: 'Portsmith Fleece',
		price: '49',
		price_compare: '69',
		image: 'https://placehold.co/750x1250',
		badges: ['PRE-ORDER'],
		swatches: ['#1e293b', '#0f172a']
	},
	{
		uid: 'preview-2',
		title: 'Stocker Crew',
		price: '90',
		price_compare: '120',
		image: 'https://placehold.co/400x300',
		badges: ['NEW SEASON'],
		swatches: ['#1e293b', '#94a3b8']
	},
	{
		uid: 'preview-3',
		title: 'Home Tee',
		price: '18',
		price_compare: '36',
		image: 'https://placehold.co/150x150',
		badges: ['ON SALE', 'NEW SEASON'],
		swatches: ['#0f172a', '#000', '#fff']
	},
	{
		uid: 'preview-4',
		title: 'Porcelain Tiles',
		price: '28',
		price_compare: '136',
		image: 'https://placehold.co/150x150',
		badges: ['ON SALE', 'NEW SEASON'],
		swatches: ['#0f172a', '#000', '#fff']
	}
];

/** Keyed by the API's `Web_Component` id, so a caller can look up a preview
 *  straight from a catalog row. */
export const COMPONENT_PREVIEWS: Record<string, ComponentPreview> = {
	header_1: {
		label: 'Logo left',
		component: Header1,
		aspect: 0.09,
		sampleProps: {
			title: 'Your Store',
			links: SAMPLE_LINKS,
			cartLink: '#',
			cartCount: 2
		}
	},
	header_2: {
		label: 'Centred',
		component: Header2,
		aspect: 0.16,
		sampleProps: {
			title: 'Your Store',
			links: SAMPLE_LINKS,
			cartLink: '#',
			cartCount: 2
		}
	},
	footer_1: {
		label: 'Simple',
		component: Footer1,
		aspect: 0.22,
		sampleProps: {
			title: 'Your Store',
			tagline: 'A short line about the shop.',
			copyright: `© ${new Date().getFullYear()} Your Store`,
			links: [
				{ title: 'Shop', items: [{ text: 'All products', href: '#' }] },
				{ title: 'Help', items: [{ text: 'Contact', href: '#' }] }
			]
		}
	},
	footer_2: {
		label: 'Minimal',
		component: Footer2,
		aspect: 0.13,
		sampleProps: {
			title: 'Your Store',
			copyright: `© ${new Date().getFullYear()} Your Store`
		}
	},
	banner_1: {
		label: 'Banner',
		component: Banner1,
		aspect: 0.4,
		sampleProps: {
			mainText: 'Welcome to the shop',
			subText: 'A line of supporting text.',
			image: 'https://placehold.co/150x150'
		}
	},
	featured_products_1: {
		label: 'Featured products',
		component: FeaturedProducts1,
		aspect: 0.6,
		sampleProps: {
			title: 'Featured Products',
			titleDescription: 'A few things worth a look.',
			products: SAMPLE_PRODUCTS
		}
	},
	product_list_1: {
		label: 'Product list',
		component: ProductList1,
		aspect: 0.7,
		sampleProps: {
			title: 'All products',
			products: SAMPLE_PRODUCTS
		}
	}
};

/** The previews for one slot kind, in catalog order. `kind` mirrors the API's
 *  `WEB_COMPONENT_KINDS`; anything unlisted is a body component. */
export function previewFor(componentId: string): ComponentPreview | undefined {
	return COMPONENT_PREVIEWS[componentId];
}
