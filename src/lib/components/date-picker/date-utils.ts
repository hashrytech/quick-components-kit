export type ISODateString = string;
export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DatePickerRange = {
	startDate: ISODateString | null;
	endDate: ISODateString | null;
};

export type DatePickerPresetContext = {
	today: ISODateString;
	weekStartsOn: WeekStartsOn;
	minDate?: ISODateString | null;
	maxDate?: ISODateString | null;
	disableFuture?: boolean;
};

export type DatePickerPreset = {
	id: string;
	label: string;
	getRange?: (context: DatePickerPresetContext) => DatePickerRange;
	disabled?: boolean;
};

export type CalendarDay = {
	iso: ISODateString;
	day: number;
	inCurrentMonth: boolean;
};

type DateBounds = Pick<DatePickerPresetContext, 'today' | 'minDate' | 'maxDate' | 'disableFuture'>;

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const defaultWeekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Unix epoch start — the lower bound used by the "All Time" preset when no `minDate` is set. */
export const EPOCH_START_DATE: ISODateString = '1970-01-01';

/**
 * The complete catalog of built-in presets. This is the source `pickPresets` selects from;
 * use it directly when you want every range. The picker's *default* shown list is the
 * smaller, curated {@link defaultDatePickerPresets}.
 */
export const allDatePickerPresets: DatePickerPreset[] = [
	{ id: 'custom', label: 'Custom' },
	{
		id: 'today',
		label: 'Today',
		getRange: ({ today }) => ({ startDate: today, endDate: today })
	},
	{
		id: 'yesterday',
		label: 'Yesterday',
		getRange: ({ today }) => {
			const yesterday = addDays(today, -1);
			return { startDate: yesterday, endDate: yesterday };
		}
	},
	{
		id: 'last-7-days',
		label: 'Last 7 Days',
		getRange: ({ today }) => ({ startDate: addDays(today, -7), endDate: addDays(today, -1) })
	},
	{
		id: 'last-30-days',
		label: 'Last 30 Days',
		getRange: ({ today }) => ({ startDate: addDays(today, -30), endDate: addDays(today, -1) })
	},
	{
		id: 'last-90-days',
		label: 'Last 90 Days',
		getRange: ({ today }) => ({ startDate: addDays(today, -90), endDate: addDays(today, -1) })
	},
	{
		id: 'last-6-months',
		label: 'Last 6 Months',
		getRange: ({ today }) => ({ startDate: addMonths(today, -6), endDate: addDays(today, -1) })
	},
	{
		id: 'last-12-months',
		label: 'Last 12 Months',
		getRange: ({ today }) => ({ startDate: addMonths(today, -12), endDate: addDays(today, -1) })
	},
	{
		id: 'last-week',
		label: 'Last Week',
		getRange: ({ today, weekStartsOn }) => {
			const endDate = addDays(startOfWeek(today, weekStartsOn), -1);
			return { startDate: startOfWeek(endDate, weekStartsOn), endDate };
		}
	},
	{
		id: 'last-month',
		label: 'Last Month',
		getRange: ({ today }) => {
			const previousMonth = addMonths(today, -1);
			return { startDate: startOfMonth(previousMonth), endDate: endOfMonth(previousMonth) };
		}
	},
	{
		id: 'last-quarter',
		label: 'Last Quarter',
		getRange: ({ today }) => {
			const previousQuarter = addMonths(startOfQuarter(today), -1);
			return { startDate: startOfQuarter(previousQuarter), endDate: endOfQuarter(previousQuarter) };
		}
	},
	{
		id: 'last-year',
		label: 'Last Year',
		getRange: ({ today }) => {
			const previousYear = addMonths(today, -12);
			return { startDate: startOfYear(previousYear), endDate: endOfYear(previousYear) };
		}
	},
	{
		id: 'last-two-years',
		label: 'Last Two Years',
		getRange: ({ today }) => {
			const currentYearStart = startOfYear(today);
			return {
				startDate: addMonths(currentYearStart, -24),
				endDate: addDays(currentYearStart, -1)
			};
		}
	},
	{
		id: 'last-3-years',
		label: 'Last 3 Years',
		getRange: ({ today }) => {
			const currentYearStart = startOfYear(today);
			return {
				startDate: addMonths(currentYearStart, -36),
				endDate: addDays(currentYearStart, -1)
			};
		}
	},
	{
		id: 'last-5-years',
		label: 'Last 5 Years',
		getRange: ({ today }) => {
			const currentYearStart = startOfYear(today);
			return {
				startDate: addMonths(currentYearStart, -60),
				endDate: addDays(currentYearStart, -1)
			};
		}
	},
	{
		id: 'last-10-years',
		label: 'Last 10 Years',
		getRange: ({ today }) => {
			const currentYearStart = startOfYear(today);
			return {
				startDate: addMonths(currentYearStart, -120),
				endDate: addDays(currentYearStart, -1)
			};
		}
	},
	{
		id: 'week-to-date',
		label: 'Week To Date',
		getRange: ({ today, weekStartsOn }) => ({ startDate: startOfWeek(today, weekStartsOn), endDate: today })
	},
	{
		id: 'month-to-date',
		label: 'Month To Date',
		getRange: ({ today }) => ({ startDate: startOfMonth(today), endDate: today })
	},
	{
		id: 'quarter-to-date',
		label: 'Quarter To Date',
		getRange: ({ today }) => ({ startDate: startOfQuarter(today), endDate: today })
	},
	{
		id: 'year-to-date',
		label: 'Year To Date',
		getRange: ({ today }) => ({ startDate: startOfYear(today), endDate: today })
	},
	{
		id: 'all-time',
		label: 'All Time',
		getRange: ({ today, minDate }) => ({
			startDate: normalizeDateInput(minDate) ?? EPOCH_START_DATE,
			endDate: today
		})
	}
];

/**
 * Forward-looking presets for scheduling-style use cases (reservations, fulfilment,
 * expiring loyalty). Opt-in: these only resolve sensibly when `disableFuture` is `false`,
 * otherwise the calendar clamps the resulting range back to today.
 */
export const futureDatePickerPresets: DatePickerPreset[] = [
	{ id: 'custom', label: 'Custom' },
	{
		id: 'tomorrow',
		label: 'Tomorrow',
		getRange: ({ today }) => {
			const tomorrow = addDays(today, 1);
			return { startDate: tomorrow, endDate: tomorrow };
		}
	},
	{
		id: 'next-7-days',
		label: 'Next 7 Days',
		getRange: ({ today }) => ({ startDate: addDays(today, 1), endDate: addDays(today, 7) })
	},
	{
		id: 'next-30-days',
		label: 'Next 30 Days',
		getRange: ({ today }) => ({ startDate: addDays(today, 1), endDate: addDays(today, 30) })
	},
	{
		id: 'next-90-days',
		label: 'Next 90 Days',
		getRange: ({ today }) => ({ startDate: addDays(today, 1), endDate: addDays(today, 90) })
	},
	{
		id: 'next-quarter',
		label: 'Next Quarter',
		getRange: ({ today }) => {
			const nextQuarter = addMonths(startOfQuarter(today), 3);
			return { startDate: startOfQuarter(nextQuarter), endDate: endOfQuarter(nextQuarter) };
		}
	}
];

const fallbackCustomPreset: DatePickerPreset = { id: 'custom', label: 'Custom' };

export type PickPresetsOptions = {
	/** Presets to choose from. Defaults to the built-in default + future presets. */
	source?: DatePickerPreset[];
	/** Prepend the "Custom" preset unless it is already in `ids`. Default: `true`. */
	includeCustom?: boolean;
};

/**
 * Build a curated preset list by id, preserving the requested order. Unlike a plain
 * `filter`, the result follows the order of `ids` (so this also reorders), de-duplicates,
 * and silently skips ids not present in the source.
 *
 * The "Custom" preset is prepended automatically unless `includeCustom` is `false` or
 * `'custom'` already appears in `ids` (in which case its requested position is kept).
 *
 * @example
 * pickPresets(['today', 'last-7-days', 'year-to-date'])
 * // → [Custom, Today, Last 7 Days, Year To Date]
 */
export function pickPresets(ids: string[], options: PickPresetsOptions = {}): DatePickerPreset[] {
	const { source, includeCustom = true } = options;
	const lookup = new Map(
		(source ?? [...allDatePickerPresets, ...futureDatePickerPresets]).map((preset) => [
			preset.id,
			preset
		])
	);

	const seen = new Set<string>();
	const result: DatePickerPreset[] = [];

	for (const id of ids) {
		if (seen.has(id)) {
			continue;
		}

		const preset = lookup.get(id);
		if (!preset) {
			continue;
		}

		seen.add(id);
		result.push(preset);
	}

	if (includeCustom && !seen.has('custom')) {
		result.unshift(lookup.get('custom') ?? fallbackCustomPreset);
	}

	return result;
}

/** Ids of the curated, reporting-oriented presets shown by the picker out of the box. */
export const defaultDatePickerPresetIds = [
	'today',
	'yesterday',
	'last-7-days',
	'last-30-days',
	'last-90-days',
	'last-6-months',
	'last-week',
	'last-month',
	'last-quarter',
	'last-year',
	'last-two-years',
	'week-to-date',
	'month-to-date',
	'quarter-to-date',
	'year-to-date'
] as const;

/**
 * The default preset list shown by the picker — a curated subset of
 * {@link allDatePickerPresets}. "Custom" is included automatically. Pass a different
 * `presets` array (e.g. `pickPresets([...])` or `allDatePickerPresets`) to override it.
 */
export const defaultDatePickerPresets: DatePickerPreset[] = pickPresets([
	...defaultDatePickerPresetIds
]);

export function parseISODate(value: string | null | undefined): Date | null {
	if (!value || !isoDatePattern.test(value)) {
		return null;
	}

	const [year, month, day] = value.split('-').map(Number);
	const date = new Date(year, month - 1, day, 12);

	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return null;
	}

	return date;
}

export function isValidISODate(value: string | null | undefined): value is ISODateString {
	return parseISODate(value) !== null;
}

export function normalizeDateInput(value: string | null | undefined): ISODateString | null {
	if (!value) {
		return null;
	}

	const trimmed = value.trim();
	return isValidISODate(trimmed) ? trimmed : null;
}

export function formatISODate(date: Date): ISODateString {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function getTodayISO(now = new Date()): ISODateString {
	return formatISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export function compareISODates(first: ISODateString, second: ISODateString): number {
	return first.localeCompare(second);
}

export function normalizeRangeDates(
	startDate: string | null | undefined,
	endDate: string | null | undefined
): DatePickerRange {
	const normalizedStart = normalizeDateInput(startDate);
	const normalizedEnd = normalizeDateInput(endDate);

	if (normalizedStart && normalizedEnd && compareISODates(normalizedStart, normalizedEnd) > 0) {
		return { startDate: normalizedEnd, endDate: normalizedStart };
	}

	return { startDate: normalizedStart, endDate: normalizedEnd };
}

export function addDays(value: ISODateString, days: number): ISODateString {
	const date = requireISODate(value);
	date.setDate(date.getDate() + days);
	return formatISODate(date);
}

export function addMonths(value: ISODateString, months: number): ISODateString {
	const date = requireISODate(value);
	const targetDay = date.getDate();

	date.setDate(1);
	date.setMonth(date.getMonth() + months);

	const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 12).getDate();
	date.setDate(Math.min(targetDay, lastDay));

	return formatISODate(date);
}

export function startOfMonth(value: ISODateString): ISODateString {
	const date = requireISODate(value);
	return formatISODate(new Date(date.getFullYear(), date.getMonth(), 1, 12));
}

export function endOfMonth(value: ISODateString): ISODateString {
	const date = requireISODate(value);
	return formatISODate(new Date(date.getFullYear(), date.getMonth() + 1, 0, 12));
}

export function startOfYear(value: ISODateString): ISODateString {
	const date = requireISODate(value);
	return formatISODate(new Date(date.getFullYear(), 0, 1, 12));
}

export function endOfYear(value: ISODateString): ISODateString {
	const date = requireISODate(value);
	return formatISODate(new Date(date.getFullYear(), 11, 31, 12));
}

export function startOfQuarter(value: ISODateString): ISODateString {
	const date = requireISODate(value);
	const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
	return formatISODate(new Date(date.getFullYear(), quarterStartMonth, 1, 12));
}

export function endOfQuarter(value: ISODateString): ISODateString {
	const date = requireISODate(value);
	const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
	return formatISODate(new Date(date.getFullYear(), quarterStartMonth + 3, 0, 12));
}

export function startOfWeek(value: ISODateString, weekStartsOn: WeekStartsOn): ISODateString {
	const date = requireISODate(value);
	const offset = (date.getDay() - weekStartsOn + 7) % 7;
	return addDays(value, -offset);
}

export function endOfWeek(value: ISODateString, weekStartsOn: WeekStartsOn): ISODateString {
	return addDays(startOfWeek(value, weekStartsOn), 6);
}

export function getCalendarMonthDays(month: ISODateString, weekStartsOn: WeekStartsOn): CalendarDay[] {
	const monthStart = startOfMonth(month);
	const monthStartDate = requireISODate(monthStart);
	const startOffset = (monthStartDate.getDay() - weekStartsOn + 7) % 7;
	const calendarStart = addDays(monthStart, -startOffset);

	return Array.from({ length: 42 }, (_, index) => {
		const iso = addDays(calendarStart, index);
		const date = requireISODate(iso);
		return {
			iso,
			day: date.getDate(),
			inCurrentMonth: startOfMonth(iso) === monthStart
		};
	});
}

export function getWeekdayLabels(locale: string | undefined, weekStartsOn: WeekStartsOn): string[] {
	if (!locale) {
		return rotateWeekdays(defaultWeekdayLabels, weekStartsOn);
	}

	const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
	return Array.from({ length: 7 }, (_, index) => {
		const iso = addDays('2024-01-07', index + weekStartsOn);
		return formatter.format(requireISODate(iso)).replace(/\.$/, '');
	});
}

export function formatMonthYear(value: ISODateString, locale: string | undefined): string {
	const formatter = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
	return formatter.format(requireISODate(value));
}

export function formatFullDate(value: ISODateString, locale: string | undefined): string {
	const formatter = new Intl.DateTimeFormat(locale, {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
	return formatter.format(requireISODate(value));
}

export function isDateInRange(
	value: ISODateString,
	startDate: ISODateString | null | undefined,
	endDate: ISODateString | null | undefined
): boolean {
	if (!startDate || !endDate) {
		return false;
	}

	return compareISODates(value, startDate) >= 0 && compareISODates(value, endDate) <= 0;
}

export function resolveMaxSelectableDate({
	today,
	maxDate,
	disableFuture = true
}: Pick<DateBounds, 'today' | 'maxDate' | 'disableFuture'>): ISODateString | null {
	const normalizedMax = normalizeDateInput(maxDate);

	if (!disableFuture) {
		return normalizedMax;
	}

	if (!normalizedMax) {
		return today;
	}

	return compareISODates(normalizedMax, today) < 0 ? normalizedMax : today;
}

export function isDateDisabled(value: ISODateString, bounds: DateBounds): boolean {
	const normalizedMin = normalizeDateInput(bounds.minDate);
	const normalizedMax = resolveMaxSelectableDate(bounds);

	if (normalizedMin && compareISODates(value, normalizedMin) < 0) {
		return true;
	}

	if (normalizedMax && compareISODates(value, normalizedMax) > 0) {
		return true;
	}

	return false;
}

export function clampDateRange(range: DatePickerRange, bounds: DateBounds): DatePickerRange {
	const minDate = normalizeDateInput(bounds.minDate);
	const maxDate = resolveMaxSelectableDate(bounds);

	function clamp(value: ISODateString | null): ISODateString | null {
		if (!value) {
			return null;
		}

		if (minDate && compareISODates(value, minDate) < 0) {
			return minDate;
		}

		if (maxDate && compareISODates(value, maxDate) > 0) {
			return maxDate;
		}

		return value;
	}

	return normalizeRangeDates(clamp(range.startDate), clamp(range.endDate));
}

function rotateWeekdays(labels: string[], weekStartsOn: WeekStartsOn): string[] {
	return [...labels.slice(weekStartsOn), ...labels.slice(0, weekStartsOn)];
}

function requireISODate(value: ISODateString): Date {
	const date = parseISODate(value);
	if (!date) {
		throw new Error(`Invalid ISO date: ${value}`);
	}

	return date;
}
