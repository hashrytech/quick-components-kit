/**
 * The second wave of storefront designs.
 *
 * Covers the rules that are invisible when they break: a control that quietly
 * disappears, a product added to a cart without the choice it needed, and an
 * overlay header rendering white text on white.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';

import Header3 from './headers/header-3/Header3.svelte';
import Header5 from './headers/header-5/Header5.svelte';
import Header6 from './headers/header-6/Header6.svelte';
import Header7 from './headers/header-7/Header7.svelte';
import Footer3 from './footers/footer-3/Footer3.svelte';
import Footer4 from './footers/footer-4/Footer4.svelte';
import Footer5 from './footers/footer-5/Footer5.svelte';
import Footer6 from './footers/footer-6/Footer6.svelte';
import FeaturedProducts2 from './featured-products/featured-products-2/FeaturedProducts2.svelte';
import FeaturedProducts4 from './featured-products/featured-products-4/FeaturedProducts4.svelte';
import FeaturedProducts6 from './featured-products/featured-products-6/FeaturedProducts6.svelte';

const LINKS = [
	{ text: 'Home', href: '/' },
	{ text: 'Shop', href: '/shop' },
	{ text: 'About', href: '/about' },
	{ text: 'Contact', href: '/contact' }
];

const SIMPLE = {
	uid: 'p1',
	name: 'Stoneware mug',
	media: { url: '/mug.jpg' },
	price_min: '18.00',
	available: true
};

const WITH_OPTIONS = {
	uid: 'p2',
	name: 'Linen apron',
	description: 'Heavy linen, softens with every wash.',
	media: { url: '/apron.jpg' },
	price_min: '34.00',
	price_max: '42.00',
	available: true
};

describe('Header3 — announcement bar', () => {
	it('hides the strip when there is nothing to announce', () => {
		// Blank text IS the off switch. A separate toggle would be a second
		// thing to keep in step with the message.
		const { unmount } = render(Header3, { props: { title: 'Shop' } });
		expect(screen.queryByText(/Free delivery/)).toBeNull();
		unmount();

		render(Header3, { props: { title: 'Shop', announcementText: 'Free delivery over $75' } });
		expect(screen.getByText('Free delivery over $75')).toBeTruthy();
	});

	it('leaves search out entirely unless it is asked for', () => {
		const { unmount } = render(Header3, { props: { title: 'Shop', showSearch: false } });
		expect(screen.queryByRole('search')).toBeNull();
		unmount();

		render(Header3, { props: { title: 'Shop', showSearch: true } });
		expect(screen.getByRole('search')).toBeTruthy();
	});
});

describe('Header5 — search first', () => {
	it('searches through the product list, so the result is a shareable URL', () => {
		render(Header5, { props: { title: 'Shop', links: LINKS } });
		const form = screen.getByRole('search') as HTMLFormElement;
		expect(form.getAttribute('action')).toBe('/products');
		expect(form.getAttribute('method')?.toUpperCase()).toBe('GET');
		expect(form.querySelector('input[name="q"]')).toBeTruthy();
	});

	it('shows the cart total only when there is one and it is wanted', () => {
		const { unmount } = render(Header5, {
			props: { title: 'Shop', cartLink: '/cart', cartTotal: '$126.00', showCartTotal: false }
		});
		expect(screen.queryByText('$126.00')).toBeNull();
		unmount();

		render(Header5, {
			props: { title: 'Shop', cartLink: '/cart', cartTotal: '$126.00', showCartTotal: true }
		});
		expect(screen.getByText('$126.00')).toBeTruthy();
	});
});

describe('Header6 — editorial', () => {
	it('names the cart in the shop own words', () => {
		render(Header6, { props: { title: 'Shop', cartLink: '/cart', cartLabel: 'Basket', cartCount: 2 } });
		expect(screen.getByText('Basket (2)')).toBeTruthy();
	});
});

describe('Header7 — over the banner', () => {
	it('turns solid when the page has no banner behind it', () => {
		// Transparent over nothing is white text on white — the header vanishes
		// rather than looking wrong, which is worse.
		const { container, unmount } = render(Header7, {
			props: { title: 'Shop', overBanner: false }
		});
		const header = container.querySelector('header') as HTMLElement;
		expect(header.className).toContain('bg-white');
		expect(header.className).not.toContain('absolute');
		unmount();

		const { container: over } = render(Header7, { props: { title: 'Shop', overBanner: true } });
		expect((over.querySelector('header') as HTMLElement).className).toContain('absolute');
	});

	it('clamps the darkening a merchant can ask for', () => {
		// 100 would turn the banner into a black rectangle.
		const { container } = render(Header7, {
			props: { title: 'Shop', overBanner: true, overlayOpacity: 100 }
		});
		const shade = container.querySelector('[style*="linear-gradient"]') as HTMLElement;
		expect(shade.getAttribute('style')).toContain('rgba(0,0,0,0.6)');
	});
});

describe('footers that lay out their own columns', () => {
	it('deals links round-robin so no column comes out empty', () => {
		render(Footer3, { props: { title: 'Shop', links: LINKS.slice(0, 3), columnCount: 2 } });
		const lists = document.querySelectorAll('footer ul');
		expect(lists.length).toBe(2);
		expect(lists[0].querySelectorAll('li').length).toBe(2);
		expect(lists[1].querySelectorAll('li').length).toBe(1);
	});

	it('drops the newsletter when there is nothing to ask', () => {
		const { unmount } = render(Footer3, { props: { title: 'Shop', links: LINKS } });
		expect(document.querySelector('footer form')).toBeNull();
		unmount();

		render(Footer3, { props: { title: 'Shop', links: LINKS, newsletterHeading: 'Stay in touch' } });
		expect(document.querySelector('footer form')).toBeTruthy();
	});

	it('leaves a working link row when the newsletter band is empty', () => {
		// Footer 4 is a newsletter footer. With no headline it must still be a
		// footer, not an empty band.
		render(Footer4, { props: { title: 'Shop', links: LINKS } });
		expect(document.querySelector('footer form')).toBeNull();
		expect(screen.getByText('About')).toBeTruthy();
	});
});

describe('Footer5 — oversized name', () => {
	it('lets a long shop name be shortened for the large mark', () => {
		render(Footer5, {
			props: { title: 'The Very Long Corner Shop Company', wordmark: 'Corner Shop' }
		});
		expect(screen.getByText('Corner Shop')).toBeTruthy();
	});

	it('hides the decorative mark from screen readers', () => {
		// The name is already announced above; hearing it twice helps nobody.
		const { container } = render(Footer5, { props: { title: 'Corner Shop' } });
		const mark = container.querySelector('[aria-hidden="true"]');
		expect(mark?.textContent?.trim()).toBe('Corner Shop');
	});
});

describe('Footer6 — social icons', () => {
	it('shows only the networks the shop actually uses', () => {
		render(Footer6, { props: { title: 'Shop', instagramUrl: 'https://example.com/ig' } });
		expect(screen.getByLabelText('Instagram')).toBeTruthy();
		expect(screen.queryByLabelText('Facebook')).toBeNull();
	});
});

describe('FeaturedProducts2 — quick add', () => {
	it('adds a plain product straight to the cart', () => {
		render(FeaturedProducts2, { props: { products: [SIMPLE], currency: 'USD' } });
		const form = document.querySelector('form') as HTMLFormElement;
		expect(form.getAttribute('action')).toBe('/products/p1?/add');
		expect(screen.getByRole('button', { name: 'Add to cart' })).toBeTruthy();
	});

	it('sends a product with choices to its page instead', () => {
		// A price range means variants. Adding one without its variant makes a
		// cart line that cannot be fulfilled.
		render(FeaturedProducts2, { props: { products: [WITH_OPTIONS], currency: 'USD' } });
		expect(document.querySelector('form')).toBeNull();
		expect(screen.getByText('Choose options')).toBeTruthy();
	});

	it('offers no add at all for something sold out', () => {
		render(FeaturedProducts2, {
			props: { products: [{ ...SIMPLE, available: false }], currency: 'USD' }
		});
		expect(document.querySelector('form')).toBeNull();
		expect(screen.getByText('Sold out')).toBeTruthy();
	});
});

describe('product layouts with nothing to show', () => {
	it('says so rather than rendering an empty frame', () => {
		for (const Component of [FeaturedProducts2, FeaturedProducts4, FeaturedProducts6]) {
			const { unmount } = render(Component, {
				props: { products: [], currency: 'USD', title: 'Featured' }
			});
			expect(screen.getByText('Nothing to show yet.')).toBeTruthy();
			unmount();
		}
	});
});

describe('FeaturedProducts4 — hero', () => {
	it('leads with the first product the renderer gives it', () => {
		render(FeaturedProducts4, {
			props: { products: [WITH_OPTIONS, SIMPLE], currency: 'USD', heroEyebrow: 'Pick of the month' }
		});
		const hero = document.querySelector('section > div > a') as HTMLElement;
		expect(hero.textContent).toContain('Linen apron');
		expect(screen.getByText('Pick of the month')).toBeTruthy();
	});
});
