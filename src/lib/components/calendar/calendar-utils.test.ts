import { describe, expect, it } from 'vitest';
import {
	buildHourOptions,
	buildMinuteOptions,
	clampDay,
	floorMinutesToStep,
	formatCalendarDisplay,
	formatCalendarValue,
	formatTimeDisplay,
	from12Hour,
	getYearPage,
	getYearPageStart,
	isDayOutOfBounds,
	isMonthOutOfBounds,
	isYearOutOfBounds,
	parseCalendarValue,
	resolveBounds,
	to12Hour
} from './calendar-utils.js';

describe('calendar value parsing and formatting', () => {
	it('parses a plain date', () => {
		expect(parseCalendarValue('2026-06-14')).toEqual({ date: '2026-06-14', time: null });
	});

	it('parses a datetime with optional seconds', () => {
		expect(parseCalendarValue('2026-06-14T13:05')).toEqual({
			date: '2026-06-14',
			time: { hours: 13, minutes: 5 }
		});
		expect(parseCalendarValue('2026-06-14T13:05:30')).toEqual({
			date: '2026-06-14',
			time: { hours: 13, minutes: 5 }
		});
	});

	it('rejects malformed or out-of-range input', () => {
		expect(parseCalendarValue('not-a-date')).toEqual({ date: null, time: null });
		expect(parseCalendarValue('2026-13-01')).toEqual({ date: null, time: null });
		expect(parseCalendarValue('2026-06-14T25:00')).toEqual({ date: '2026-06-14', time: null });
		expect(parseCalendarValue(null)).toEqual({ date: null, time: null });
	});

	it('formats with and without time', () => {
		expect(formatCalendarValue('2026-06-14', { hours: 9, minutes: 30 }, true)).toBe(
			'2026-06-14T09:30'
		);
		expect(formatCalendarValue('2026-06-14', { hours: 9, minutes: 30 }, false)).toBe('2026-06-14');
		expect(formatCalendarValue(null, { hours: 9, minutes: 30 }, true)).toBeNull();
	});

	it('builds a human-readable trigger label', () => {
		const parts = parseCalendarValue('2026-06-14T13:05');
		expect(
			formatCalendarDisplay(parts, { includeTime: true, format: '12h', locale: 'en-US' })
		).toBe('June 14, 2026 · 1:05 PM');
		expect(
			formatCalendarDisplay(parts, { includeTime: false, format: '12h', locale: 'en-US' })
		).toBe('June 14, 2026');
	});
});

describe('time helpers', () => {
	it('round-trips 12-hour conversions', () => {
		expect(to12Hour(0)).toEqual({ hour: 12, period: 'AM' });
		expect(to12Hour(12)).toEqual({ hour: 12, period: 'PM' });
		expect(to12Hour(13)).toEqual({ hour: 1, period: 'PM' });
		expect(from12Hour(12, 'AM')).toBe(0);
		expect(from12Hour(12, 'PM')).toBe(12);
		expect(from12Hour(1, 'PM')).toBe(13);
	});

	it('formats time for both clocks', () => {
		expect(formatTimeDisplay({ hours: 13, minutes: 5 }, '24h')).toBe('13:05');
		expect(formatTimeDisplay({ hours: 13, minutes: 5 }, '12h')).toBe('1:05 PM');
		expect(formatTimeDisplay({ hours: 0, minutes: 0 }, '12h')).toBe('12:00 AM');
	});

	it('builds hour and minute option lists', () => {
		expect(buildHourOptions('12h')).toHaveLength(12);
		expect(buildHourOptions('12h')[0]).toBe(1);
		expect(buildHourOptions('24h')).toHaveLength(24);
		expect(buildHourOptions('24h')[0]).toBe(0);
		expect(buildMinuteOptions(15)).toEqual([0, 15, 30, 45]);
		expect(buildMinuteOptions(0)).toHaveLength(60);
	});

	it('floors minutes to the step when seeding', () => {
		expect(floorMinutesToStep({ hours: 9, minutes: 37 }, 15)).toEqual({ hours: 9, minutes: 30 });
	});
});

describe('bounds resolution', () => {
	const today = '2026-06-14';

	it('folds disablePast/disableFuture into min/max', () => {
		expect(resolveBounds({ today, disablePast: true })).toEqual({
			minDate: today,
			maxDate: null
		});
		expect(resolveBounds({ today, disableFuture: true })).toEqual({
			minDate: null,
			maxDate: today
		});
		expect(resolveBounds({ today, minDate: '2026-01-01', disablePast: true })).toEqual({
			minDate: today,
			maxDate: null
		});
		expect(resolveBounds({ today, minDate: '2026-12-01', disablePast: true })).toEqual({
			minDate: '2026-12-01',
			maxDate: null
		});
	});

	it('detects out-of-bounds days, months, and years', () => {
		const bounds = { minDate: '2026-06-10', maxDate: '2026-06-20' };

		expect(isDayOutOfBounds('2026-06-09', bounds)).toBe(true);
		expect(isDayOutOfBounds('2026-06-15', bounds)).toBe(false);
		expect(isDayOutOfBounds('2026-06-21', bounds)).toBe(true);

		expect(isMonthOutOfBounds(2026, 5, bounds)).toBe(false); // June overlaps
		expect(isMonthOutOfBounds(2026, 4, bounds)).toBe(true); // May entirely before
		expect(isMonthOutOfBounds(2026, 6, bounds)).toBe(true); // July entirely after

		expect(isYearOutOfBounds(2026, bounds)).toBe(false);
		expect(isYearOutOfBounds(2025, bounds)).toBe(true);
		expect(isYearOutOfBounds(2027, bounds)).toBe(true);
	});

	it('clamps days into range', () => {
		const bounds = { minDate: '2026-06-10', maxDate: '2026-06-20' };
		expect(clampDay('2026-06-01', bounds)).toBe('2026-06-10');
		expect(clampDay('2026-06-30', bounds)).toBe('2026-06-20');
		expect(clampDay('2026-06-15', bounds)).toBe('2026-06-15');
	});
});

describe('year paging', () => {
	it('pages years in aligned blocks of twelve', () => {
		expect(getYearPageStart(2026)).toBe(2016);
		expect(getYearPage(2026)).toEqual([
			2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027
		]);
	});
});
