<!--
@component CalendarGrid

The selectable grid used by {@link Calendar}. It switches between three views so a
date can be reached quickly on touch devices without repeatedly tapping the arrows:

- `days` — the month grid. Tapping the header opens the months view.
- `months` — a 3×4 grid of month names. Tapping the header opens the years view.
- `years` — a 4×3 grid of years (paged by {@link YEARS_PER_PAGE}).

It is presentational: the parent owns the selected date and `viewMonth` (the month
currently in view, as a start-of-month ISO date) and reacts to `onselect`.
-->

<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';
	import type { CalendarBounds, ISODateString, WeekStartsOn } from './calendar-utils.js';

	export type CalendarView = 'days' | 'months' | 'years';

	export type CalendarGridProps = {
		viewMonth: ISODateString;
		selectedDate?: ISODateString | null;
		today: ISODateString;
		bounds: CalendarBounds;
		weekStartsOn?: WeekStartsOn;
		locale?: string;
		monthLabelStyle?: 'short' | 'long';
		onselect?: (date: ISODateString) => void;
		class?: ClassNameValue;
		dayClass?: ClassNameValue | ((date: ISODateString) => ClassNameValue);
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Icon } from '$lib/components/icon/index.js';
	import {
		addMonths,
		formatFullDate,
		formatMonthYear,
		getCalendarMonthDays,
		getWeekdayLabels
	} from '$lib/components/date-picker/date-utils.js';
	import {
		getMonthLabels,
		getMonthIndex,
		getYear,
		getYearPage,
		getYearPageStart,
		isDayOutOfBounds,
		isMonthOutOfBounds,
		isYearOutOfBounds,
		makeMonthISO,
		YEARS_PER_PAGE
	} from './calendar-utils.js';

	let {
		viewMonth = $bindable(),
		selectedDate = null,
		today,
		bounds,
		weekStartsOn = 0,
		locale,
		monthLabelStyle = 'short',
		onselect,
		class: className,
		dayClass
	}: CalendarGridProps = $props();

	let view = $state<CalendarView>('days');

	const viewYear = $derived(getYear(viewMonth));
	const viewMonthIndex = $derived(getMonthIndex(viewMonth));
	const monthDays = $derived(getCalendarMonthDays(viewMonth, weekStartsOn));
	// The month grid is generated as a fixed 6 weeks; drop any trailing week that holds
	// no day of the current month so there is no empty row (and dead space) below the dates.
	const visibleDays = $derived.by(() => {
		let end = monthDays.length;
		while (end >= 7 && !monthDays.slice(end - 7, end).some((day) => day.inCurrentMonth)) {
			end -= 7;
		}
		return monthDays.slice(0, end);
	});
	const weekdayLabels = $derived(getWeekdayLabels(locale, weekStartsOn));
	const monthLabels = $derived(getMonthLabels(locale, monthLabelStyle));
	const yearPage = $derived(getYearPage(viewYear));
	const yearPageStart = $derived(getYearPageStart(viewYear));

	const selectedYear = $derived(selectedDate ? getYear(selectedDate) : null);
	const selectedMonthIndex = $derived(selectedDate ? getMonthIndex(selectedDate) : null);

	const headerLabel = $derived.by(() => {
		if (view === 'days') {
			return formatMonthYear(viewMonth, locale);
		}

		if (view === 'months') {
			return String(viewYear);
		}

		return `${yearPageStart}–${yearPageStart + YEARS_PER_PAGE - 1}`;
	});

	function resolveDayClass(date: ISODateString): ClassNameValue {
		return typeof dayClass === 'function' ? dayClass(date) : dayClass;
	}

	function openHeaderView(): void {
		view = view === 'days' ? 'months' : view === 'months' ? 'years' : 'years';
	}

	function handlePrevious(): void {
		if (view === 'days') {
			viewMonth = addMonths(viewMonth, -1);
		} else if (view === 'months') {
			viewMonth = addMonths(viewMonth, -12);
		} else {
			viewMonth = addMonths(viewMonth, -12 * YEARS_PER_PAGE);
		}
	}

	function handleNext(): void {
		if (view === 'days') {
			viewMonth = addMonths(viewMonth, 1);
		} else if (view === 'months') {
			viewMonth = addMonths(viewMonth, 12);
		} else {
			viewMonth = addMonths(viewMonth, 12 * YEARS_PER_PAGE);
		}
	}

	function selectMonth(monthIndex: number): void {
		viewMonth = makeMonthISO(viewYear, monthIndex);
		view = 'days';
	}

	function selectYear(year: number): void {
		viewMonth = makeMonthISO(year, viewMonthIndex);
		view = 'months';
	}

	function selectDay(date: ISODateString): void {
		if (isDayOutOfBounds(date, bounds)) {
			return;
		}

		onselect?.(date);
	}

	const previousDisabled = $derived.by(() => {
		if (!bounds.minDate) {
			return false;
		}

		if (view === 'days') {
			return isMonthOutOfBounds(
				getYear(addMonths(viewMonth, -1)),
				getMonthIndex(addMonths(viewMonth, -1)),
				bounds
			);
		}

		if (view === 'months') {
			return isYearOutOfBounds(viewYear - 1, bounds);
		}

		return isYearOutOfBounds(yearPageStart - 1, bounds);
	});

	const nextDisabled = $derived.by(() => {
		if (!bounds.maxDate) {
			return false;
		}

		if (view === 'days') {
			return isMonthOutOfBounds(
				getYear(addMonths(viewMonth, 1)),
				getMonthIndex(addMonths(viewMonth, 1)),
				bounds
			);
		}

		if (view === 'months') {
			return isYearOutOfBounds(viewYear + 1, bounds);
		}

		return isYearOutOfBounds(yearPageStart + YEARS_PER_PAGE, bounds);
	});

	const navButtonClass =
		'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-primary-50 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-focus disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent';

	function dayButtonClass(iso: ISODateString): string {
		const isSelected = selectedDate === iso;
		const isToday = iso === today;
		const disabled = isDayOutOfBounds(iso, bounds);

		return twMerge(
			'flex h-9 w-full min-w-0 items-center justify-center rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-focus',
			disabled
				? 'cursor-not-allowed text-neutral-300'
				: 'cursor-pointer text-neutral-700 hover:bg-primary-100',
			isToday &&
				!isSelected &&
				'font-semibold text-primary-button ring-1 ring-inset ring-primary-200',
			isSelected && 'bg-primary-button font-semibold text-white hover:bg-primary-button-hover',
			resolveDayClass(iso)
		);
	}

	function cellButtonClass(isSelected: boolean, isCurrent: boolean, disabled: boolean): string {
		return twMerge(
			'flex h-11 w-full items-center justify-center rounded-primary text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-focus',
			disabled
				? 'cursor-not-allowed text-neutral-300'
				: 'cursor-pointer text-neutral-700 hover:bg-primary-100',
			isCurrent &&
				!isSelected &&
				'font-semibold text-primary-button ring-1 ring-inset ring-primary-200',
			isSelected && 'bg-primary-button font-semibold text-white hover:bg-primary-button-hover'
		);
	}
</script>

<div
	class={twMerge(
		'rounded-primary border-primary-card-border flex w-full min-w-[16.5rem] flex-col border bg-white py-2',
		className
	)}
>
	<div class="flex h-10 flex-row items-center justify-between gap-1 px-2">
		<button
			type="button"
			aria-label="Previous"
			class={navButtonClass}
			disabled={previousDisabled || undefined}
			onclick={handlePrevious}
		>
			<Icon icon="icon-[ri--arrow-left-s-line]" class="size-5" />
		</button>

		<button
			type="button"
			aria-live="polite"
			class="rounded-primary hover:bg-primary-50 focus:ring-primary-focus flex flex-1 cursor-pointer items-center justify-center gap-1 px-2 py-1 text-sm font-semibold text-neutral-800 transition-colors focus:ring-2 focus:outline-none"
			onclick={openHeaderView}
		>
			{headerLabel}
			<Icon
				icon="icon-[ri--arrow-down-s-line]"
				class={twMerge(
					'size-4 text-neutral-400 transition-transform',
					view !== 'days' && 'rotate-180'
				)}
			/>
		</button>

		<button
			type="button"
			aria-label="Next"
			class={navButtonClass}
			disabled={nextDisabled || undefined}
			onclick={handleNext}
		>
			<Icon icon="icon-[ri--arrow-right-s-line]" class="size-5" />
		</button>
	</div>

	{#if view === 'days'}
		<div class="grid grid-cols-7 px-2 pt-2 text-center text-xs font-medium text-neutral-500">
			{#each weekdayLabels as dayLabel (dayLabel)}
				<div class="flex h-7 items-center justify-center">{dayLabel}</div>
			{/each}
		</div>

		<div class="grid grid-cols-7 gap-0.5 px-2 pb-1 text-center">
			{#each visibleDays as day (day.iso)}
				{#if day.inCurrentMonth}
					<button
						type="button"
						disabled={isDayOutOfBounds(day.iso, bounds) || undefined}
						aria-label={formatFullDate(day.iso, locale)}
						aria-current={day.iso === today ? 'date' : undefined}
						aria-pressed={selectedDate === day.iso}
						class={dayButtonClass(day.iso)}
						onclick={() => selectDay(day.iso)}
					>
						{day.day}
					</button>
				{:else}
					<span aria-hidden="true" class="h-9 w-full">&nbsp;</span>
				{/if}
			{/each}
		</div>
	{:else if view === 'months'}
		<div class="grid grid-cols-3 gap-1.5 px-3 py-3">
			{#each monthLabels as label, index (label)}
				{@const disabled = isMonthOutOfBounds(viewYear, index, bounds)}
				<button
					type="button"
					disabled={disabled || undefined}
					aria-pressed={selectedYear === viewYear && selectedMonthIndex === index}
					class={cellButtonClass(
						selectedYear === viewYear && selectedMonthIndex === index,
						getYear(today) === viewYear && getMonthIndex(today) === index,
						disabled
					)}
					onclick={() => selectMonth(index)}
				>
					{label}
				</button>
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-4 gap-1.5 px-3 py-3">
			{#each yearPage as year (year)}
				{@const disabled = isYearOutOfBounds(year, bounds)}
				<button
					type="button"
					disabled={disabled || undefined}
					aria-pressed={selectedYear === year}
					class={cellButtonClass(selectedYear === year, getYear(today) === year, disabled)}
					onclick={() => selectYear(year)}
				>
					{year}
				</button>
			{/each}
		</div>
	{/if}
</div>
