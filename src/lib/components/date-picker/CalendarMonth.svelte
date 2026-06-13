<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';
	import type { CalendarDay, ISODateString, WeekStartsOn } from './date-utils.js';

	export type CalendarMonthProps = {
		month: ISODateString;
		startDate?: ISODateString | null;
		endDate?: ISODateString | null;
		minDate?: ISODateString | null;
		maxDate?: ISODateString | null;
		today: ISODateString;
		disableFuture?: boolean;
		weekStartsOn?: WeekStartsOn;
		locale?: string;
		showPrevious?: boolean;
		showNext?: boolean;
		onprevious?: () => void;
		onnext?: () => void;
		onselect?: (date: ISODateString) => void;
		class?: ClassNameValue;
		dayClass?: ClassNameValue | ((date: ISODateString) => ClassNameValue);
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Icon } from '$lib/components/icon/index.js';
	import {
		formatFullDate,
		formatMonthYear,
		getCalendarMonthDays,
		getWeekdayLabels,
		isDateDisabled,
		isDateInRange
	} from './date-utils.js';

	let {
		month,
		startDate = null,
		endDate = null,
		minDate = null,
		maxDate = null,
		today,
		disableFuture = true,
		weekStartsOn = 0,
		locale,
		showPrevious = false,
		showNext = false,
		onprevious,
		onnext,
		onselect,
		class: className,
		dayClass
	}: CalendarMonthProps = $props();

	const monthDays = $derived(getCalendarMonthDays(month, weekStartsOn));
	const weekdayLabels = $derived(getWeekdayLabels(locale, weekStartsOn));

	function handleSelect(date: ISODateString): void {
		onselect?.(date);
	}

	function resolveDayClass(date: ISODateString): ClassNameValue {
		return typeof dayClass === 'function' ? dayClass(date) : dayClass;
	}

	function dayIsDisabled(date: ISODateString): boolean {
		return isDateDisabled(date, { minDate, maxDate, today, disableFuture });
	}

	function dayButtonClass(day: CalendarDay): string {
		const disabled = dayIsDisabled(day.iso);
		const startsRange = startDate === day.iso;
		const endsRange = endDate === day.iso;
		const inRange = isDateInRange(day.iso, startDate, endDate);
		const selectedSingleDay = startsRange && endsRange;

		return twMerge(
			'flex h-8 w-full min-w-0 items-center justify-center text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-focus',
			disabled
				? 'cursor-not-allowed text-neutral-300'
				: 'cursor-pointer text-neutral-700 hover:bg-primary-100',
			inRange && !startsRange && !endsRange && 'bg-primary-table-row-selected text-neutral-800',
			selectedSingleDay && 'rounded-full bg-primary-button text-white hover:bg-primary-button-hover',
			startsRange && !selectedSingleDay && 'rounded-l-full bg-primary-button text-white hover:bg-primary-button-hover',
			endsRange && !selectedSingleDay && 'rounded-r-full bg-primary-button text-white hover:bg-primary-button-hover',
			day.iso === today && !startsRange && !endsRange && 'font-semibold text-primary-button',
			resolveDayClass(day.iso)
		);
	}
</script>

<div class={twMerge('flex w-full min-w-[17.5rem] flex-col rounded-primary border border-primary-card-border bg-white py-2', className)}>
	<div class="relative flex h-8 flex-row items-center justify-center px-10">
		{#if showPrevious}
			<button
				type="button"
				aria-label="Previous month"
				class="absolute left-2 flex size-8 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-primary-50 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-focus"
				onclick={onprevious}
			>
				<Icon icon="icon-[ri--arrow-left-s-line]" class="size-5" />
			</button>
		{/if}

		<p class="text-sm font-semibold text-neutral-800">{formatMonthYear(month, locale)}</p>

		{#if showNext}
			<button
				type="button"
				aria-label="Next month"
				class="absolute right-2 flex size-8 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-primary-50 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-focus"
				onclick={onnext}
			>
				<Icon icon="icon-[ri--arrow-right-s-line]" class="size-5" />
			</button>
		{/if}
	</div>

	<div class="grid grid-cols-7 px-2 pt-3 text-center text-xs font-medium text-neutral-500">
		{#each weekdayLabels as dayLabel (dayLabel)}
			<div class="flex h-7 items-center justify-center">{dayLabel}</div>
		{/each}
	</div>

	<div class="grid grid-cols-7 px-2 pb-1 text-center">
		{#each monthDays as day (day.iso)}
			{#if day.inCurrentMonth}
				<button
					type="button"
					disabled={dayIsDisabled(day.iso) || undefined}
					aria-label={formatFullDate(day.iso, locale)}
					aria-current={day.iso === today ? 'date' : undefined}
					aria-pressed={isDateInRange(day.iso, startDate, endDate)}
					class={dayButtonClass(day)}
					onclick={() => handleSelect(day.iso)}
				>
					{day.day}
				</button>
			{:else}
				<span aria-hidden="true" class="h-8 w-full">&nbsp;</span>
			{/if}
		{/each}
	</div>
</div>
