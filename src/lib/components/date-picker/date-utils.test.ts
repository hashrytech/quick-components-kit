import { describe, expect, it } from 'vitest';
import {
	allDatePickerPresets,
	clampDateRange,
	defaultDatePickerPresetIds,
	defaultDatePickerPresets,
	endOfQuarter,
	futureDatePickerPresets,
	getCalendarMonthDays,
	isDateDisabled,
	normalizeRangeDates,
	pickPresets
} from './date-utils.js';

describe('date picker utilities', () => {
	it('normalizes invalid and reversed ranges', () => {
		expect(normalizeRangeDates('2026-06-13', '2026-06-01')).toEqual({
			startDate: '2026-06-01',
			endDate: '2026-06-13'
		});

		expect(normalizeRangeDates('invalid', '2026-06-13')).toEqual({
			startDate: null,
			endDate: '2026-06-13'
		});
	});

	it('builds a stable six-week calendar grid', () => {
		const days = getCalendarMonthDays('2026-06-13', 0);

		expect(days).toHaveLength(42);
		expect(days[0]).toEqual({ iso: '2026-05-31', day: 31, inCurrentMonth: false });
		expect(days[1]).toEqual({ iso: '2026-06-01', day: 1, inCurrentMonth: true });
	});

	it('exposes a curated default that is a subset of the full catalog', () => {
		const defaultIds = defaultDatePickerPresets.map((preset) => preset.id);
		const catalogIds = new Set(allDatePickerPresets.map((preset) => preset.id));

		// Custom is auto-included, then the curated ids in order.
		expect(defaultIds).toEqual(['custom', ...defaultDatePickerPresetIds]);
		// The default is strictly smaller than, and contained within, the full catalog.
		expect(defaultIds.length).toBeLessThan(allDatePickerPresets.length);
		expect(defaultIds.every((id) => catalogIds.has(id))).toBe(true);
	});

	it('computes catalog preset ranges from a fixed date', () => {
		const context = { today: '2026-06-13', weekStartsOn: 0 as const, disableFuture: true };
		const last7Days = allDatePickerPresets.find((preset) => preset.id === 'last-7-days');
		const lastTwoYears = allDatePickerPresets.find((preset) => preset.id === 'last-two-years');

		expect(last7Days?.getRange?.(context)).toEqual({
			startDate: '2026-06-06',
			endDate: '2026-06-12'
		});
		expect(lastTwoYears?.getRange?.(context)).toEqual({
			startDate: '2024-01-01',
			endDate: '2025-12-31'
		});
	});

	it('computes the rolling, quarter, and all-time presets', () => {
		const context = { today: '2026-06-13', weekStartsOn: 0 as const, disableFuture: true };
		const get = (id: string) =>
			allDatePickerPresets.find((preset) => preset.id === id)?.getRange?.(context);

		// Rolling windows end yesterday, consistent with the "Last N Days" convention.
		expect(get('last-6-months')).toEqual({ startDate: '2025-12-13', endDate: '2026-06-12' });
		expect(get('last-12-months')).toEqual({ startDate: '2025-06-13', endDate: '2026-06-12' });

		// Last Quarter is the previous full calendar quarter (Q1 relative to a June date).
		expect(get('last-quarter')).toEqual({ startDate: '2026-01-01', endDate: '2026-03-31' });

		// Multi-year presets span previous full calendar years, excluding the current one.
		expect(get('last-3-years')).toEqual({ startDate: '2023-01-01', endDate: '2025-12-31' });
		expect(get('last-5-years')).toEqual({ startDate: '2021-01-01', endDate: '2025-12-31' });
		expect(get('last-10-years')).toEqual({ startDate: '2016-01-01', endDate: '2025-12-31' });

		// All Time runs from minDate (if any), else the Unix epoch, through today.
		expect(get('all-time')).toEqual({ startDate: '1970-01-01', endDate: '2026-06-13' });
		expect(
			allDatePickerPresets
				.find((preset) => preset.id === 'all-time')
				?.getRange?.({ ...context, minDate: '2025-01-01' })
		).toEqual({ startDate: '2025-01-01', endDate: '2026-06-13' });
	});

	it('computes forward-looking presets starting tomorrow', () => {
		const context = { today: '2026-06-13', weekStartsOn: 0 as const, disableFuture: false };
		const get = (id: string) =>
			futureDatePickerPresets.find((preset) => preset.id === id)?.getRange?.(context);

		expect(get('tomorrow')).toEqual({ startDate: '2026-06-14', endDate: '2026-06-14' });
		expect(get('next-7-days')).toEqual({ startDate: '2026-06-14', endDate: '2026-06-20' });
		// Next Quarter is the upcoming full calendar quarter (Q3 relative to a June date).
		expect(get('next-quarter')).toEqual({ startDate: '2026-07-01', endDate: '2026-09-30' });
	});

	it('curates presets by id with pickPresets', () => {
		const ids = (presets: { id: string }[]) => presets.map((preset) => preset.id);

		// Preserves requested order and auto-prepends Custom.
		expect(ids(pickPresets(['year-to-date', 'today', 'last-7-days']))).toEqual([
			'custom',
			'year-to-date',
			'today',
			'last-7-days'
		]);

		// Honors an explicit Custom position instead of prepending a second one.
		expect(ids(pickPresets(['today', 'custom', 'last-30-days']))).toEqual([
			'today',
			'custom',
			'last-30-days'
		]);

		// De-duplicates and skips unknown ids.
		expect(ids(pickPresets(['today', 'today', 'does-not-exist']))).toEqual(['custom', 'today']);

		// Can opt out of the automatic Custom preset.
		expect(ids(pickPresets(['today'], { includeCustom: false }))).toEqual(['today']);

		// Pulls from the future presets too (shared lookup) and from a custom source.
		expect(ids(pickPresets(['next-7-days']))).toEqual(['custom', 'next-7-days']);
		expect(
			ids(pickPresets(['a'], { source: [{ id: 'a', label: 'A' }], includeCustom: false }))
		).toEqual(['a']);
	});

	it('resolves the last day of a quarter', () => {
		expect(endOfQuarter('2026-01-15')).toBe('2026-03-31');
		expect(endOfQuarter('2026-06-13')).toBe('2026-06-30');
		expect(endOfQuarter('2026-08-01')).toBe('2026-09-30');
		expect(endOfQuarter('2026-12-31')).toBe('2026-12-31');
	});

	it('applies selectable bounds consistently', () => {
		const bounds = {
			today: '2026-06-13',
			minDate: '2026-06-01',
			maxDate: null,
			disableFuture: true
		};

		expect(isDateDisabled('2026-05-31', bounds)).toBe(true);
		expect(isDateDisabled('2026-06-13', bounds)).toBe(false);
		expect(isDateDisabled('2026-06-14', bounds)).toBe(true);

		expect(
			clampDateRange({ startDate: '2026-05-01', endDate: '2026-07-01' }, bounds)
		).toEqual({
			startDate: '2026-06-01',
			endDate: '2026-06-13'
		});
	});
});
