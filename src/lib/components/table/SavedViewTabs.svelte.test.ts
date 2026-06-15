import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import SavedViewTabs from './SavedViewTabs.svelte';
import type { SavedViewSummary } from './SavedViewTabs.svelte';

const VIEWS: SavedViewSummary[] = [
	{ uid: 'v1', name: 'Unfulfilled', is_default: true },
	{ uid: 'v2', name: 'Kingston' }
];

describe('SavedViewTabs', () => {
	it('always renders a non-deletable Default tab and a tab per view', () => {
		render(SavedViewTabs, { props: { views: VIEWS } });
		expect(screen.getByText('Default')).toBeInTheDocument();
		expect(screen.getByText('Unfulfilled')).toBeInTheDocument();
		expect(screen.getByText('Kingston')).toBeInTheDocument();
	});

	it('selecting the Default tab emits onselect(null)', async () => {
		const onselect = vi.fn();
		render(SavedViewTabs, { props: { views: VIEWS, activeId: 'v1', onselect } });
		await fireEvent.click(screen.getByText('Default'));
		expect(onselect).toHaveBeenCalledWith(null);
	});

	it('selecting a view tab emits onselect(uid)', async () => {
		const onselect = vi.fn();
		render(SavedViewTabs, { props: { views: VIEWS, onselect } });
		await fireEvent.click(screen.getByText('Kingston'));
		expect(onselect).toHaveBeenCalledWith('v2');
	});

	it('the + button emits oncreate', async () => {
		const oncreate = vi.fn();
		render(SavedViewTabs, { props: { views: VIEWS, oncreate } });
		await fireEvent.click(screen.getByLabelText('New view'));
		expect(oncreate).toHaveBeenCalled();
	});

	it('the per-tab menu emits rename / duplicate / set-default / delete with the uid', async () => {
		const onrename = vi.fn();
		const onduplicate = vi.fn();
		const onsetdefault = vi.fn();
		const ondelete = vi.fn();
		render(SavedViewTabs, {
			props: { views: VIEWS, onrename, onduplicate, onsetdefault, ondelete }
		});

		// Open the menu for the second view (no default star, simpler).
		const optionButtons = screen.getAllByLabelText('View options');
		await fireEvent.click(optionButtons[1]);

		await fireEvent.click(screen.getByText('Rename'));
		expect(onrename).toHaveBeenCalledWith('v2');

		await fireEvent.click(optionButtons[1]);
		await fireEvent.click(screen.getByText('Duplicate'));
		expect(onduplicate).toHaveBeenCalledWith('v2');

		await fireEvent.click(optionButtons[1]);
		await fireEvent.click(screen.getByText('Set as default'));
		expect(onsetdefault).toHaveBeenCalledWith('v2');

		await fireEvent.click(optionButtons[1]);
		await fireEvent.click(screen.getByText('Delete'));
		expect(ondelete).toHaveBeenCalledWith('v2');
	});
});
