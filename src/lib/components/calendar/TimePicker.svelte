<!--
@component TimePicker

A compact time selector used by {@link Calendar}, built on the kit's `Select`
component. Native `<select>` elements were chosen deliberately: on mobile they open
the OS-native time picker (the iOS wheel / Android scroll dialog) — the familiar,
thumb-friendly UI — while staying fully keyboard- and screen-reader-accessible on
desktop. The 12-hour format adds an AM/PM select; the 24-hour format drops it.

Bind `time` (a `{ hours, minutes }` object in 24-hour form) and/or listen to `onchange`.
-->

<script lang="ts" module>
	import type { ClassNameValue } from 'tailwind-merge';
	import type { CalendarTime, TimeFormat } from './calendar-utils.js';

	export type TimePickerProps = {
		time: CalendarTime;
		format?: TimeFormat;
		minuteStep?: number;
		disabled?: boolean;
		id?: string;
		onchange?: (time: CalendarTime) => void;
		class?: ClassNameValue;
		selectClass?: ClassNameValue;
		labelClass?: ClassNameValue;
	};

	let nextId = 0;

	function createTimePickerId(): string {
		nextId += 1;
		return `quick-time-picker-${nextId}`;
	}
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Select } from '$lib/components/select/index.js';
	import {
		buildHourOptions,
		buildMinuteOptions,
		from12Hour,
		pad2,
		to12Hour
	} from './calendar-utils.js';

	let {
		time = $bindable(),
		format = '12h',
		minuteStep = 1,
		disabled = false,
		id,
		onchange,
		class: className,
		selectClass,
		labelClass
	}: TimePickerProps = $props();

	const baseId = id ?? createTimePickerId();

	const twelveHour = $derived(to12Hour(time.hours));
	const hourValue = $derived(format === '24h' ? time.hours : twelveHour.hour);
	const periodValue = $derived(twelveHour.period);

	const hourOptions = $derived(
		buildHourOptions(format).map((hour) => ({
			value: hour,
			key: format === '24h' ? pad2(hour) : String(hour)
		}))
	);

	const minuteOptions = $derived.by(() => {
		const minutes = buildMinuteOptions(minuteStep);

		// Keep the current minute selectable even if it does not land on a step.
		if (!minutes.includes(time.minutes)) {
			minutes.push(time.minutes);
			minutes.sort((first, second) => first - second);
		}

		return minutes.map((minute) => ({ value: minute, key: pad2(minute) }));
	});

	function emit(next: CalendarTime): void {
		time = next;
		onchange?.(next);
	}

	function handleHourChange(event: Event): void {
		const raw = Number((event.currentTarget as HTMLSelectElement).value);
		const hours = format === '24h' ? raw : from12Hour(raw, periodValue);
		emit({ hours, minutes: time.minutes });
	}

	function handleMinuteChange(event: Event): void {
		emit({ hours: time.hours, minutes: Number((event.currentTarget as HTMLSelectElement).value) });
	}

	function handlePeriodChange(event: Event): void {
		const period = (event.currentTarget as HTMLSelectElement).value as 'AM' | 'PM';
		emit({ hours: from12Hour(twelveHour.hour, period), minutes: time.minutes });
	}

	const fieldLabelClass = twMerge('ml-0 text-center text-xs font-medium', labelClass);
</script>

<div class={twMerge('flex w-full items-end gap-2', className)} role="group" aria-label="Time">
	<Select
		id={`${baseId}-hour`}
		labelText="Hour"
		labelPosition="top"
		options={hourOptions}
		value={hourValue}
		{disabled}
		size="md"
		onchange={handleHourChange}
		class={twMerge('w-full bg-white text-sm', selectClass)}
		rootClass="flex-1"
		labelClass={fieldLabelClass}
	/>

	<span aria-hidden="true" class="pb-2 text-lg font-semibold text-neutral-400">:</span>

	<Select
		id={`${baseId}-minute`}
		labelText="Minute"
		labelPosition="top"
		options={minuteOptions}
		value={time.minutes}
		{disabled}
		size="md"
		onchange={handleMinuteChange}
		class={twMerge('w-full bg-white text-sm', selectClass)}
		rootClass="flex-1"
		labelClass={fieldLabelClass}
	/>

	{#if format === '12h'}
		<Select
			id={`${baseId}-period`}
			labelText="AM/PM"
			labelPosition="top"
			options={[
				{ value: 'AM', key: 'AM' },
				{ value: 'PM', key: 'PM' }
			]}
			value={periodValue}
			{disabled}
			size="md"
			onchange={handlePeriodChange}
			class={twMerge('w-full bg-white text-sm', selectClass)}
			rootClass="w-[4.75rem] shrink-0"
			labelClass={fieldLabelClass}
		/>
	{/if}
</div>
