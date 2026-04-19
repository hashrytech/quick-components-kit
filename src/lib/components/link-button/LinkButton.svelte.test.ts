import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LinkButton from './LinkButton.svelte';

describe('LinkButton', () => {
	it('adds secure rel tokens for links opened in a new tab', () => {
		render(LinkButton, {
			props: {
				href: 'https://example.com',
				target: '_blank',
				'aria-label': 'External docs'
			}
		});

		const link = screen.getByRole('link', { name: 'External docs' });

		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	});

	it('preserves caller-provided rel tokens while appending missing security tokens', () => {
		render(LinkButton, {
			props: {
				href: 'https://example.com',
				target: '_blank',
				rel: 'external sponsored',
				'aria-label': 'Partner site'
			}
		});

		const link = screen.getByRole('link', { name: 'Partner site' });
		const rel = link.getAttribute('rel');

		expect(rel).toBeTruthy();
		expect(rel?.split(/\s+/)).toEqual(['external', 'sponsored', 'noopener', 'noreferrer']);
	});
});
