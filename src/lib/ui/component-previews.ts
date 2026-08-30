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
import { Header3 } from './headers/header-3/index.js';
import { Header4 } from './headers/header-4/index.js';
import { Header5 } from './headers/header-5/index.js';
import { Header6 } from './headers/header-6/index.js';
import { Header7 } from './headers/header-7/index.js';
import { Footer1 } from './footers/footer-1/index.js';
import { Footer2 } from './footers/footer-2/index.js';
import { Footer3 } from './footers/footer-3/index.js';
import { Footer4 } from './footers/footer-4/index.js';
import { Footer5 } from './footers/footer-5/index.js';
import { Footer6 } from './footers/footer-6/index.js';
import { Footer7 } from './footers/footer-7/index.js';
import { Banner1 } from './banners/banner-1/index.js';
import { FeaturedProducts1 } from './featured-products/featured-products-1/index.js';
import { FeaturedProducts2 } from './featured-products/featured-products-2/index.js';
import { FeaturedProducts3 } from './featured-products/featured-products-3/index.js';
import { FeaturedProducts4 } from './featured-products/featured-products-4/index.js';
import { FeaturedProducts5 } from './featured-products/featured-products-5/index.js';
import { FeaturedProducts6 } from './featured-products/featured-products-6/index.js';
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

/** A longer list for the designs that split links into columns — three would
 *  leave a column empty and hide the very thing the preview is showing. */
const SAMPLE_LINK_LIST = [
	{ text: 'All products', href: '#' },
	{ text: 'New arrivals', href: '#' },
	{ text: 'Delivery', href: '#' },
	{ text: 'Returns', href: '#' },
	{ text: 'About', href: '#' },
	{ text: 'Contact', href: '#' }
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

/** Cards in the shape the renderer actually passes — the same `PublicProductCard`
 *  ProductList1 takes. The older `SAMPLE_PRODUCTS` above feeds
 *  featured_products_1, which still has its own ad-hoc prop shape. */
const SAMPLE_CARDS = [
	{
		uid: 'card-1',
		name: 'Stoneware mug',
		description: 'Thrown and glazed in small batches, so no two carry the same colour.',
		media: { url: 'https://placehold.co/600x750', alt_text: 'Stoneware mug' },
		price_min: '18.00',
		available: true
	},
	{
		uid: 'card-2',
		name: 'Linen apron',
		description: 'Heavy linen with a deep pocket, softens with every wash.',
		media: { url: 'https://placehold.co/600x600', alt_text: 'Linen apron' },
		price_min: '34.00',
		price_max: '42.00',
		available: true
	},
	{
		uid: 'card-3',
		name: 'Olive board',
		description: 'Cut from a single piece, oiled and ready to use.',
		media: { url: 'https://placehold.co/600x750', alt_text: 'Olive board' },
		price_min: '65.00',
		available: true
	},
	{
		uid: 'card-4',
		name: 'Copper kettle',
		description: 'Holds two litres and takes a flame or an induction ring.',
		media: { url: 'https://placehold.co/600x600', alt_text: 'Copper kettle' },
		price_min: '120.00',
		available: false
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
	header_3: {
		label: 'Announcement bar',
		component: Header3,
		aspect: 0.14,
		sampleProps: {
			title: 'Your Store',
			links: SAMPLE_LINKS,
			cartLink: '#',
			cartCount: 2,
			accountLink: '#',
			announcementText: 'Free delivery over $75 · Order by 2pm for same-day pickup',
			showSearch: true
		}
	},
	header_4: {
		label: 'Split navigation',
		component: Header4,
		aspect: 0.11,
		sampleProps: {
			title: 'Your Store',
			links: SAMPLE_LINKS,
			cartLink: '#',
			cartCount: 2,
			accountLink: '#'
		}
	},
	header_5: {
		label: 'Search first',
		component: Header5,
		aspect: 0.17,
		sampleProps: {
			title: 'Your Store',
			links: SAMPLE_LINK_LIST,
			cartLink: '#',
			cartCount: 2,
			cartTotal: '$126.00',
			accountLink: '#'
		}
	},
	header_6: {
		label: 'Editorial',
		component: Header6,
		aspect: 0.18,
		sampleProps: {
			title: 'Your Store',
			links: SAMPLE_LINKS,
			cartLink: '#',
			cartCount: 2
		}
	},
	header_7: {
		label: 'Over the banner',
		component: Header7,
		aspect: 0.11,
		sampleProps: {
			title: 'Your Store',
			links: SAMPLE_LINKS,
			cartLink: '#',
			cartCount: 2,
			// Solid in the gallery: a transparent header previewed on white is
			// an empty card, and there is no banner behind it here.
			overBanner: false
		}
	},
	footer_3: {
		label: 'Columns and newsletter',
		component: Footer3,
		aspect: 0.45,
		sampleProps: {
			title: 'Your Store',
			tagline: 'A short line about the shop.',
			copyright: `© ${new Date().getFullYear()} Your Store`,
			links: SAMPLE_LINK_LIST,
			columnCount: 2,
			newsletterHeading: 'Stay in touch',
			newsletterText: 'Offers and new stock, once a month.'
		}
	},
	footer_4: {
		label: 'Newsletter band',
		component: Footer4,
		aspect: 0.4,
		sampleProps: {
			title: 'Your Store',
			copyright: `© ${new Date().getFullYear()} Your Store`,
			links: SAMPLE_LINKS,
			headline: 'Get first look at new stock',
			subText: 'One email a month. Unsubscribe any time.'
		}
	},
	footer_5: {
		label: 'Oversized name',
		component: Footer5,
		aspect: 0.5,
		sampleProps: {
			title: 'Your Store',
			copyright: `© ${new Date().getFullYear()} Your Store`,
			links: SAMPLE_LINK_LIST,
			columnCount: 2,
			addressLines: '14 Hope Road\nKingston 6'
		}
	},
	footer_6: {
		label: 'Centred with social',
		component: Footer6,
		aspect: 0.3,
		sampleProps: {
			title: 'Your Store',
			copyright: `© ${new Date().getFullYear()} Your Store`,
			links: SAMPLE_LINKS,
			instagramUrl: '#',
			facebookUrl: '#'
		}
	},
	footer_7: {
		label: 'Two tone',
		component: Footer7,
		aspect: 0.42,
		sampleProps: {
			title: 'Your Store',
			copyright: `© ${new Date().getFullYear()} Your Store`,
			links: SAMPLE_LINK_LIST,
			columnCount: 3,
			contactAddress: '14 Hope Road\nKingston 6',
			contactPhone: '(876) 555 0142'
		}
	},
	featured_products_2: {
		label: 'Quick-add grid',
		component: FeaturedProducts2,
		aspect: 0.55,
		sampleProps: {
			title: 'Featured products',
			products: SAMPLE_CARDS,
			currency: 'USD',
			viewAllLabel: 'View all'
		}
	},
	featured_products_3: {
		label: 'Scrolling row',
		component: FeaturedProducts3,
		aspect: 0.42,
		sampleProps: {
			title: 'Featured products',
			products: SAMPLE_CARDS,
			currency: 'USD'
		}
	},
	featured_products_4: {
		label: 'Hero and supporting',
		component: FeaturedProducts4,
		aspect: 0.65,
		sampleProps: {
			title: 'Featured products',
			heroEyebrow: 'Pick of the month',
			products: SAMPLE_CARDS,
			currency: 'USD'
		}
	},
	featured_products_5: {
		label: 'Staggered',
		component: FeaturedProducts5,
		aspect: 0.6,
		sampleProps: {
			title: 'Featured products',
			products: SAMPLE_CARDS,
			currency: 'USD'
		}
	},
	featured_products_6: {
		label: 'Catalogue rows',
		component: FeaturedProducts6,
		aspect: 0.9,
		sampleProps: {
			title: 'Featured products',
			products: SAMPLE_CARDS.slice(0, 2),
			currency: 'USD'
		}
	},
	product_list_1: {
		label: 'Product list',
		component: ProductList1,
		aspect: 0.7,
		sampleProps: {
			title: 'All products',
			products: SAMPLE_CARDS,
			currency: 'USD'
		}
	}
};

/** The previews for one slot kind, in catalog order. `kind` mirrors the API's
 *  `WEB_COMPONENT_KINDS`; anything unlisted is a body component. */
export function previewFor(componentId: string): ComponentPreview | undefined {
	return COMPONENT_PREVIEWS[componentId];
}
