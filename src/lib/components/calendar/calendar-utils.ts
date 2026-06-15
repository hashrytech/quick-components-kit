import {
	compareISODates,
	endOfMonth,
	formatFullDate,
	isValidISODate,
	normalizeDateInput,
	type ISODateString,
	type WeekStartsOn
} from '$lib/components/date-picker/date-utils.js';

export type { ISODateString, WeekStartsOn };

/** Clock display mode for the optional time picker. */
export type TimeFormat = '12h' | '24h';

/** Wall-clock time in 24-hour form (independent of any date). */
export type CalendarTime = {
	hours: number;
	minutes: number;
};

/** The date and (optional) time parsed out of a `value` string. */
export type CalendarValueParts = {
	date: ISODateString | null;
	time: CalendarTime | null;
};

/** Resolved, normalized selectable bounds. */
export type CalendarBounds = {
	minDate: ISODateString | null;
	maxDate: ISODateString | null;
};

const isoDateTimePattern = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/;

/** Number of years shown per page in the year-grid view. */
export const YEARS_PER_PAGE = 12;

/** Zero-pad a number to two digits (e.g. `5` → `"05"`). */
export function pad2(value: number): string {
	return String(value).padStart(2, '0');
}

/** Whether a {@link CalendarTime} holds an in-range, whole-number hour and minute. */
export function isValidTime(time: CalendarTime | null | undefined): time is CalendarTime {
	if (!time) {
		return false;
	}

	return (
		Number.isInteger(time.hours) &&
		Number.isInteger(time.minutes) &&
		time.hours >= 0 &&
		time.hours <= 23 &&
		time.minutes >= 0 &&
		time.minutes <= 59
	);
}

/**
 * Split a public `value` into its date and time parts. Accepts either a plain
 * `YYYY-MM-DD` date or a `YYYY-MM-DDTHH:mm` (optionally `:ss`) local datetime.
 * Invalid input yields `null` parts rather than throwing.
 */
export function parseCalendarValue(value: string | null | undefined): CalendarValueParts {
	if (!value) {
		return { date: null, time: null };
	}

	const trimmed = value.trim();
	const dateTimeMatch = trimmed.match(isoDateTimePattern);

	if (dateTimeMatch) {
		const [, datePart, hours, minutes] = dateTimeMatch;

		if (!isValidISODate(datePart)) {
			return { date: null, time: null };
		}

		const time: CalendarTime = { hours: Number(hours), minutes: Number(minutes) };
		return { date: datePart, time: isValidTime(time) ? time : null };
	}

	return { date: normalizeDateInput(trimmed), time: null };
}

/** Format a {@link CalendarTime} as a 24-hour `HH:mm` string. */
export function formatTimeValue(time: CalendarTime): string {
	return `${pad2(time.hours)}:${pad2(time.minutes)}`;
}

/**
 * Build the public `value` string from a date and optional time. Returns `null`
 * when there is no date. The time is only appended when `includeTime` is true.
 */
export function formatCalendarValue(
	date: ISODateString | null,
	time: CalendarTime | null,
	includeTime: boolean
): string | null {
	if (!date) {
		return null;
	}

	if (includeTime && time) {
		return `${date}T${formatTimeValue(time)}`;
	}

	return date;
}

/** Convert a 24-hour value into a 12-hour hour plus AM/PM period. */
export function to12Hour(hours: number): { hour: number; period: 'AM' | 'PM' } {
	const period = hours >= 12 ? 'PM' : 'AM';
	const hour = hours % 12 === 0 ? 12 : hours % 12;
	return { hour, period };
}

/** Convert a 12-hour hour plus AM/PM period back into a 24-hour value. */
export function from12Hour(hour12: number, period: 'AM' | 'PM'): number {
	const base = hour12 % 12;
	return period === 'PM' ? base + 12 : base;
}

/** Format a {@link CalendarTime} for display, honouring the 12h/24h format. */
export function formatTimeDisplay(time: CalendarTime, format: TimeFormat): string {
	if (format === '24h') {
		return formatTimeValue(time);
	}

	const { hour, period } = to12Hour(time.hours);
	return `${hour}:${pad2(time.minutes)} ${period}`;
}

/**
 * Format the full selection (date and optional time) for the trigger label,
 * e.g. `"June 14, 2026 · 1:05 PM"`.
 */
export function formatCalendarDisplay(
	parts: CalendarValueParts,
	options: { includeTime: boolean; format: TimeFormat; locale?: string }
): string | null {
	if (!parts.date) {
		return null;
	}

	const datePart = formatFullDate(parts.date, options.locale);

	if (options.includeTime && parts.time) {
		return `${datePart} · ${formatTimeDisplay(parts.time, options.format)}`;
	}

	return datePart;
}

/** The list of selectable hours for a given clock format (`1–12` or `0–23`). */
export function buildHourOptions(format: TimeFormat): number[] {
	if (format === '24h') {
		return Array.from({ length: 24 }, (_, index) => index);
	}

	return Array.from({ length: 12 }, (_, index) => index + 1);
}

/** The list of selectable minutes for a given step (e.g. `5` → `0, 5, 10, …`). */
export function buildMinuteOptions(step: number): number[] {
	const safeStep = Number.isInteger(step) && step > 0 ? step : 1;
	const options: number[] = [];

	for (let minute = 0; minute < 60; minute += safeStep) {
		options.push(minute);
	}

	return options;
}

/** Floor a time's minutes down to the nearest step (used to seed the picker). */
export function floorMinutesToStep(time: CalendarTime, step: number): CalendarTime {
	const safeStep = Number.isInteger(step) && step > 0 ? step : 1;
	return { hours: time.hours, minutes: Math.floor(time.minutes / safeStep) * safeStep };
}

/** Read the four-digit year out of an ISO date string. */
export function getYear(date: ISODateString): number {
	return Number(date.slice(0, 4));
}

/** Read the zero-based month index out of an ISO date string. */
export function getMonthIndex(date: ISODateString): number {
	return Number(date.slice(5, 7)) - 1;
}

/** Build the first-of-month ISO date for a year and zero-based month index. */
export function makeMonthISO(year: number, monthIndex: number): ISODateString {
	return `${String(year).padStart(4, '0')}-${pad2(monthIndex + 1)}-01`;
}

/** Localised month names, e.g. `["Jan", … ]` (short) or `["January", … ]` (long). */
export function getMonthLabels(
	locale: string | undefined,
	style: 'short' | 'long' = 'short'
): string[] {
	const formatter = new Intl.DateTimeFormat(locale, { month: style });
	return Array.from({ length: 12 }, (_, index) => formatter.format(new Date(2024, index, 1, 12)));
}

/** The starting year of the page containing `year` (pages align on multiples of `pageSize`). */
export function getYearPageStart(year: number, pageSize = YEARS_PER_PAGE): number {
	return Math.floor(year / pageSize) * pageSize;
}

/** The list of years on the page containing `year`. */
export function getYearPage(year: number, pageSize = YEARS_PER_PAGE): number[] {
	const start = getYearPageStart(year, pageSize);
	return Array.from({ length: pageSize }, (_, index) => start + index);
}

function maxISODate(
	first: ISODateString | null,
	second: ISODateString | null
): ISODateString | null {
	if (!first) {
		return second;
	}

	if (!second) {
		return first;
	}

	return compareISODates(first, second) >= 0 ? first : second;
}

function minISODate(
	first: ISODateString | null,
	second: ISODateString | null
): ISODateString | null {
	if (!first) {
		return second;
	}

	if (!second) {
		return first;
	}

	return compareISODates(first, second) <= 0 ? first : second;
}

/**
 * Resolve the effective selectable bounds. `disablePast`/`disableFuture` fold
 * `today` into the min/max so callers only ever check two dates.
 */
export function resolveBounds(input: {
	minDate?: ISODateString | null;
	maxDate?: ISODateString | null;
	today: ISODateString;
	disablePast?: boolean;
	disableFuture?: boolean;
}): CalendarBounds {
	let minDate = normalizeDateInput(input.minDate);
	let maxDate = normalizeDateInput(input.maxDate);

	if (input.disablePast) {
		minDate = maxISODate(minDate, input.today);
	}

	if (input.disableFuture) {
		maxDate = minISODate(maxDate, input.today);
	}

	return { minDate, maxDate };
}

/** Whether a day falls outside the resolved bounds. */
export function isDayOutOfBounds(date: ISODateString, bounds: CalendarBounds): boolean {
	if (bounds.minDate && compareISODates(date, bounds.minDate) < 0) {
		return true;
	}

	if (bounds.maxDate && compareISODates(date, bounds.maxDate) > 0) {
		return true;
	}

	return false;
}

/** Clamp a day into the resolved bounds. */
export function clampDay(date: ISODateString, bounds: CalendarBounds): ISODateString {
	if (bounds.minDate && compareISODates(date, bounds.minDate) < 0) {
		return bounds.minDate;
	}

	if (bounds.maxDate && compareISODates(date, bounds.maxDate) > 0) {
		return bounds.maxDate;
	}

	return date;
}

/** Whether an entire month lies outside the resolved bounds. */
export function isMonthOutOfBounds(
	year: number,
	monthIndex: number,
	bounds: CalendarBounds
): boolean {
	const first = makeMonthISO(year, monthIndex);
	const last = endOfMonth(first);

	if (bounds.maxDate && compareISODates(first, bounds.maxDate) > 0) {
		return true;
	}

	if (bounds.minDate && compareISODates(last, bounds.minDate) < 0) {
		return true;
	}

	return false;
}

/** Whether an entire year lies outside the resolved bounds. */
export function isYearOutOfBounds(year: number, bounds: CalendarBounds): boolean {
	const first = `${String(year).padStart(4, '0')}-01-01`;
	const last = `${String(year).padStart(4, '0')}-12-31`;

	if (bounds.maxDate && compareISODates(first, bounds.maxDate) > 0) {
		return true;
	}

	if (bounds.minDate && compareISODates(last, bounds.minDate) < 0) {
		return true;
	}

	return false;
}
