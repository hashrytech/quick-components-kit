/**
 * Storefront component guarantees the API depends on.
 *
 * These cover the two defects the storefront plan called out by name — raw
 * HTML rendering of merchant text, and a hardcoded currency symbol — plus the
 * sold-out semantics that keep unavailable products listed rather than hidden.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';

import Banner1 from './banners/banner-1/Banner1.svelte';
import Price1 from './price/price-1/Price1.svelte';
import AvailabilityBadge1 from './availability-badge/availability-badge-1/AvailabilityBadge1.svelte';
import ProductCard1 from './product-card/product-card-1/ProductCard1.svelte';
import ProductList1 from './product-list/product-list-1/ProductList1.svelte';

function card(overrides: Record<string, unknown> = {}) {
	return {
		uid: 'p-1',
		name: 'Widget',
		description: 'A widget',
		media: null,
		price_min: '1250.00',
		price_max: '1250.00',
		available: true,
		...overrides
	};
}

describe('Banner1 merchant text', () => {
	it('renders script payloads as text, never as markup', () => {
		const payload = '<img src=x onerror="alert(1)">Sale';
		const { container } = render(Banner1, { props: { mainText: payload } });

		// The exact string must be visible as text …
		expect(screen.getByText(payload)).toBeInTheDocument();
		// … and no element may have been created from it. The payload's own
		// characters still appear in innerHTML — that is the point: they are
		// ENTITY-ESCAPED, so `onerror=` is inert text rather than an attribute.
		expect(container.innerHTML).toContain('&lt;img');
		expect(container.querySelector('img')).toBeNull();
		expect(container.querySelectorAll('[onerror]')).toHaveLength(0);
	});

	it('escapes sub text too', () => {
		const { container } = render(Banner1, {
			props: { mainText: 'Sale', subText: '<b>bold</b>' }
		});
		expect(screen.getByText('<b>bold</b>')).toBeInTheDocument();
		expect(container.querySelector('b')).toBeNull();
	});
});

describe('Price1 currency awareness', () => {
	it('does not hardcode a dollar symbol for unknown currencies', () => {
		const { container } = render(Price1, { props: { amount: '1250.00', currency: 'GBP' } });
		// Unknown-to-the-registry currencies render code-prefixed, so a
		// non-dollar store is never shown a "$" it does not use.
		expect(screen.getByText('GBP 1250.00')).toBeInTheDocument();
		expect(container.textContent).not.toContain('$');
	});

	it('groups and symbolizes known currencies', () => {
		render(Price1, { props: { amount: '1250', currency: 'JMD' } });
		expect(screen.getByText(/1,250\.00/)).toBeInTheDocument();
	});

	it('hides a compare price that is not actually higher', () => {
		const { container } = render(Price1, {
			props: { amount: '100.00', currency: 'JMD', compareAmount: '100.00' }
		});
		expect(container.querySelector('.line-through')).toBeNull();
	});

	it('shows a genuinely higher compare price', () => {
		const { container } = render(Price1, {
			props: { amount: '80.00', currency: 'JMD', compareAmount: '100.00' }
		});
		expect(container.querySelector('.line-through')).not.toBeNull();
	});
});

describe('sold-out semantics', () => {
	it('badge stays silent for available items when onlyWhenSoldOut is set', () => {
		const { container } = render(AvailabilityBadge1, {
			props: { available: true, onlyWhenSoldOut: true }
		});
		expect(container.textContent?.trim()).toBe('');
	});

	it('badge announces sold out', () => {
		render(AvailabilityBadge1, { props: { available: false, onlyWhenSoldOut: true } });
		expect(screen.getByText('Sold out')).toBeInTheDocument();
	});

	it('card keeps a sold-out product visible but not buyable', () => {
		const { container } = render(ProductCard1, {
			props: { product: card({ available: false }), currency: 'JMD', onAddToCart: () => {} }
		});
		// Still listed — vanishing products are the behaviour we avoid.
		expect(screen.getByText('Widget')).toBeInTheDocument();
		const button = container.querySelector('button');
		expect(button?.disabled).toBe(true);
	});

	it('card enables add-to-cart for an available product', () => {
		const { container } = render(ProductCard1, {
			props: { product: card(), currency: 'JMD', onAddToCart: () => {} }
		});
		expect(container.querySelector('button')?.disabled).toBe(false);
	});
});

describe('ProductList1', () => {
	it('omits the show-more control when no handler is supplied', () => {
		const { container } = render(ProductList1, {
			props: { products: [card()], currency: 'JMD' }
		});
		expect(container.textContent).not.toContain('Show More');
	});

	it('renders an empty state rather than a bare grid', () => {
		render(ProductList1, {
			props: { products: [], currency: 'JMD', emptyText: 'Nothing here' }
		});
		expect(screen.getByText('Nothing here')).toBeInTheDocument();
	});

	it('prices every card in the supplied currency', () => {
		const { container } = render(ProductList1, {
			props: { products: [card()], currency: 'GBP' }
		});
		expect(container.textContent).toContain('GBP');
		expect(container.textContent).not.toContain('$');
	});
});
