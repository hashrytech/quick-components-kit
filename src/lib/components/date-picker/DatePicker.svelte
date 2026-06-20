<!--
@component DatePicker

A reusable date range picker with preset ranges, manual ISO date inputs, two-month
calendar selection, and apply/cancel controls. Public values are plain
`YYYY-MM-DD` strings so consuming projects do not need a date library.

## Props

- `open?: boolean` - Whether the popover is visible. Bindable.
- `startDate?: string | null` - Selected start date in `YYYY-MM-DD`. Bindable.
- `endDate?: string | null` - Selected end date in `YYYY-MM-DD`. Bindable.
- `labelText?: string` - Optional label for the trigger.
- `labelClass?: ClassNameValue` - Classes for the `<label>` element (merged over defaults).
- `labelPosition?: 'top' | 'bottom' | 'left' | 'right'` - Label placement relative to the
  field. Default: `'top'`.
- `placeholder?: string` - Trigger text when no dates are selected.
- `showTrigger?: boolean` - Render the built-in trigger button. Default: `true`.
- `icon?: string` - Iconify class for the trigger icon (e.g. `icon-[ri--calendar-line]`).
  When unset, a built-in calendar SVG is used.
- `iconClass?: ClassNameValue` - Classes for the trigger icon — applies to the default SVG
  or to `icon` when set. Defaults to `size-5 shrink-0 text-neutral-400`; override to
  change size/colour.
- `inline?: boolean` - Render the calendar panel inline instead of as a popover.
- `showPresets?: boolean` - Show the preset select. Default: `true`.
- `presets?: DatePickerPreset[]` - Custom preset list. Include a preset without
  `getRange` for "Custom" behavior. Defaults to `defaultDatePickerPresets`; pass
  `futureDatePickerPresets` (with `disableFuture={false}`) for scheduling use cases.
  Use `pickPresets(['today', 'last-7-days', ...])` to curate a subset by id (preserves
  order and auto-includes "Custom"). Array order is the display order.
- `numberOfMonths?: 1 | 2` - Number of month grids to show. Default: `2`.
- `minDate? / maxDate?` - Optional selectable bounds in `YYYY-MM-DD`.
- `disableFuture?: boolean` - Disable dates after today. Default: `true`.
- `weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6` - First calendar day. Default: `0`.
- `locale?: string` - Intl locale for month and day labels.
- `onapply?: (range) => void` - Called when Apply commits the range.
- `oncancel?: () => void` - Called when Cancel restores the committed range.
- `onRangeChange?: (range) => void` - Called when Apply updates bound values.

Class props are available for theming specific parts:
`class`, `labelClass`, `triggerClass`, `panelClass`, `controlsClass`, `calendarClass`,
`dayClass`, and `footerClass`.
-->

<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ClassNameValue } from 'tailwind-merge';
	import type {
		DatePickerPreset,
		DatePickerRange,
		ISODateString,
		WeekStartsOn
	} from './date-utils.js';

	type ForwardedDivProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'onchange'>;

	export type DatePickerSize = 'sm' | 'md' | 'lg';

	export type DatePickerProps = ForwardedDivProps & {
		open?: boolean;
		startDate?: ISODateString | null;
		endDate?: ISODateString | null;
		id?: string;
		name?: string;
		startName?: string;
		endName?: string;
		labelText?: string;
		labelClass?: ClassNameValue;
		labelPosition?: 'top' | 'bottom' | 'left' | 'right';
		placeholder?: string;
		disabled?: boolean;
		size?: DatePickerSize;
		showTrigger?: boolean;
		icon?: string;
		iconClass?: ClassNameValue;
		inline?: boolean;
		showPresets?: boolean;
		presets?: DatePickerPreset[];
		numberOfMonths?: 1 | 2;
		minDate?: ISODateString | null;
		maxDate?: ISODateString | null;
		disableFuture?: boolean;
		weekStartsOn?: WeekStartsOn;
		locale?: string;
		ariaLabel?: string;
		closeOnApply?: boolean;
		clickOutsideClose?: boolean;
		transitionDuration?: number;
		triggerClass?: ClassNameValue;
		panelClass?: ClassNameValue;
		controlsClass?: ClassNameValue;
		calendarClass?: ClassNameValue;
		dayClass?: ClassNameValue | ((date: ISODateString) => ClassNameValue);
		footerClass?: ClassNameValue;
		onapply?: (range: DatePickerRange) => void;
		oncancel?: () => void;
		onRangeChange?: (range: DatePickerRange) => void;
		class?: ClassNameValue;
	};

	let nextId = 0;

	function createDatePickerId(): string {
		nextId += 1;
		return `quick-date-picker-${nextId}`;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { Button } from '$lib/components/button/index.js';
	import { Icon } from '$lib/components/icon/index.js';
	import { Select } from '$lib/components/select/index.js';
	import { TextInput } from '$lib/components/text-input/index.js';
	import { onKeydown } from '$lib/actions/on-keydown.js';
	import { anchoredPosition } from '$lib/actions/anchored-position.js';
	import { clickOutside } from '$lib/functions/click-outside.js';
	import { config } from '$lib/configs/config.js';
	import CalendarMonth from './CalendarMonth.svelte';
	import {
		addMonths,
		clampDateRange,
		defaultDatePickerPresets,
		getTodayISO,
		isDateDisabled,
		normalizeDateInput,
		normalizeRangeDates,
		startOfMonth
	} from './date-utils.js';

	let {
		open = $bindable(false),
		startDate = $bindable(null),
		endDate = $bindable(null),
		id,
		name,
		startName,
		endName,
		labelText,
		labelClass,
		labelPosition = 'top',
		placeholder = 'Select dates',
		disabled = false,
		size = 'md',
		showTrigger = true,
		icon,
		iconClass,
		inline = false,
		showPresets = true,
		presets,
		numberOfMonths = 2,
		minDate = null,
		maxDate = null,
		disableFuture = true,
		weekStartsOn = 0,
		locale,
		ariaLabel = 'Date range picker',
		closeOnApply = true,
		clickOutsideClose = true,
		transitionDuration = config.transitionDuration,
		triggerClass,
		panelClass,
		controlsClass,
		calendarClass,
		dayClass,
		footerClass,
		onapply,
		oncancel,
		onRangeChange,
		class: className,
		...rest
	}: DatePickerProps = $props();

	// Element refs for anchored popover positioning. The panel is positioned
	// against the trigger button (or the field wrapper when no trigger is shown).
	let triggerButtonEl = $state<HTMLElement>();
	let fieldEl = $state<HTMLElement>();
	const anchorEl = $derived(triggerButtonEl ?? fieldEl);

	const generatedId = createDatePickerId();
	const today = getTodayISO();
	const baseId = $derived(id ?? name ?? generatedId);
	const panelVisible = $derived(inline || open);
	const effectivePresets = $derived(
		presets && presets.length > 0 ? presets : defaultDatePickerPresets
	);
	const presetOptions = $derived(
		effectivePresets.map((preset) => ({
			value: preset.id,
			key: preset.label,
			disabled: preset.disabled
		}))
	);

	const committedRange = $derived(normalizeRangeDates(startDate, endDate));
	const submittedValue = $derived(
		committedRange.startDate && committedRange.endDate
			? `${committedRange.startDate}/${committedRange.endDate}`
			: ''
	);

	const labelLayout: Record<
		NonNullable<DatePickerProps['labelPosition']>,
		{ container: string; label: string; field: string }
	> = {
		top: { container: 'flex-col', label: '', field: 'w-full' },
		bottom: { container: 'flex-col', label: 'order-last', field: 'w-full' },
		left: { container: 'flex-row items-center', label: '', field: 'flex-1 min-w-0' },
		right: { container: 'flex-row items-center', label: 'order-last', field: 'flex-1 min-w-0' }
	};

	const triggerSizeClass: Record<DatePickerSize, string> = {
		sm: 'h-[2.05rem] px-2 text-sm',
		md: 'h-[2.375rem] px-2.5 text-sm',
		lg: 'h-[2.8rem] px-3 text-base'
	};

	let selectedPresetId = $state('custom');
	let draftStartDate = $state<ISODateString | null>(untrack(() => committedRange.startDate));
	let draftEndDate = $state<ISODateString | null>(untrack(() => committedRange.endDate));
	let startDateText = $state(untrack(() => draftStartDate ?? ''));
	let endDateText = $state(untrack(() => draftEndDate ?? ''));
	let selectionAnchor = $state<ISODateString | null>(null);
	let rightMonth = $state(untrack(() => startOfMonth(draftEndDate ?? draftStartDate ?? today)));
	let leftMonth = $state(untrack(() => addMonths(rightMonth, -1)));
	let previousOpen = false;

	$effect(() => {
		if (open && !previousOpen) {
			syncDraftFromCommitted();
		}

		if (!panelVisible) {
			syncDraftFromCommitted();
		}

		previousOpen = open;
	});

	function syncDraftFromCommitted(): void {
		const range = normalizeRangeDates(startDate, endDate);
		setDraftRange(range.startDate, range.endDate, true);
		selectedPresetId = 'custom';
		selectionAnchor = null;
	}

	function setDraftRange(
		nextStartDate: ISODateString | null,
		nextEndDate: ISODateString | null,
		moveMonth = true
	): void {
		const range = normalizeRangeDates(nextStartDate, nextEndDate);
		draftStartDate = range.startDate;
		draftEndDate = range.endDate;
		startDateText = draftStartDate ?? '';
		endDateText = draftEndDate ?? '';

		if (moveMonth) {
			setVisibleMonth(draftEndDate ?? draftStartDate ?? today);
		}
	}

	function setVisibleMonth(anchorDate: ISODateString): void {
		rightMonth = startOfMonth(anchorDate);
		leftMonth = numberOfMonths === 1 ? rightMonth : addMonths(rightMonth, -1);
	}

	function selectableBounds() {
		return { minDate, maxDate, today, disableFuture };
	}

	function handleTriggerClick(): void {
		if (disabled) {
			return;
		}

		if (!open) {
			syncDraftFromCommitted();
		}

		open = !open;
	}

	function handleOutsideClick(): void {
		if (!inline && open && clickOutsideClose) {
			open = false;
		}
	}

	function handleEscape(event: KeyboardEvent): void {
		if (!panelVisible) {
			return;
		}

		event.preventDefault();
		handleCancel();
	}

	function handlePresetChange(): void {
		const preset = effectivePresets.find((item) => item.id === selectedPresetId);
		selectionAnchor = null;

		if (!preset?.getRange) {
			return;
		}

		const presetRange = preset.getRange({ today, weekStartsOn, minDate, maxDate, disableFuture });
		const range = clampDateRange(
			normalizeRangeDates(presetRange.startDate, presetRange.endDate),
			selectableBounds()
		);

		setDraftRange(range.startDate, range.endDate);
	}

	function commitStartDateText(): void {
		commitTextInput('start');
	}

	function commitEndDateText(): void {
		commitTextInput('end');
	}

	function commitTextInput(field: 'start' | 'end'): void {
		const textValue = field === 'start' ? startDateText : endDateText;
		const normalizedDate = normalizeDateInput(textValue);

		if (textValue.trim() === '') {
			const nextStartDate = field === 'start' ? null : draftStartDate;
			const nextEndDate = field === 'end' ? null : draftEndDate;
			setDraftRange(nextStartDate, nextEndDate);
			selectedPresetId = 'custom';
			selectionAnchor = null;
			return;
		}

		if (!normalizedDate || isDateDisabled(normalizedDate, selectableBounds())) {
			startDateText = draftStartDate ?? '';
			endDateText = draftEndDate ?? '';
			return;
		}

		const nextStartDate = field === 'start' ? normalizedDate : draftStartDate;
		const nextEndDate = field === 'end' ? normalizedDate : draftEndDate;
		setDraftRange(nextStartDate, nextEndDate);
		selectedPresetId = 'custom';
		selectionAnchor = null;
	}

	function handleDaySelect(date: ISODateString): void {
		if (isDateDisabled(date, selectableBounds())) {
			return;
		}

		selectedPresetId = 'custom';

		if (!selectionAnchor) {
			selectionAnchor = date;
			setDraftRange(date, date, false);
			return;
		}

		const range = normalizeRangeDates(selectionAnchor, date);
		setDraftRange(range.startDate, range.endDate, false);
		selectionAnchor = null;
	}

	function handlePreviousMonth(): void {
		leftMonth = addMonths(leftMonth, -1);
		rightMonth = addMonths(rightMonth, -1);
	}

	function handleNextMonth(): void {
		leftMonth = addMonths(leftMonth, 1);
		rightMonth = addMonths(rightMonth, 1);
	}

	function handleCancel(): void {
		syncDraftFromCommitted();
		oncancel?.();

		if (!inline) {
			open = false;
		}
	}

	function handleApply(): void {
		const range = normalizeRangeDates(draftStartDate, draftEndDate);
		startDate = range.startDate;
		endDate = range.endDate;
		onRangeChange?.(range);
		onapply?.(range);

		if (closeOnApply && !inline) {
			open = false;
		}
	}
</script>

<div
	{...rest}
	{id}
	class={twMerge('inline-flex gap-1', labelLayout[labelPosition].container, className)}
	use:clickOutside={{
		callback: handleOutsideClick,
		enabled: panelVisible && !inline && clickOutsideClose
	}}
	use:onKeydown={{ key: 'Escape', callback: handleEscape }}
>
	{#if labelText}
		<label
			for={`${baseId}-trigger`}
			class={twMerge(
				'text-primary-label-text ml-1 w-fit text-sm font-medium',
				labelLayout[labelPosition].label,
				labelClass
			)}
		>
			{labelText}
		</label>
	{/if}

	{#if name}
		<input type="hidden" {name} value={submittedValue} />
	{/if}

	{#if startName}
		<input type="hidden" name={startName} value={committedRange.startDate ?? ''} />
	{/if}

	{#if endName}
		<input type="hidden" name={endName} value={committedRange.endDate ?? ''} />
	{/if}

	<div bind:this={fieldEl} class={twMerge('relative flex flex-col gap-1', labelLayout[labelPosition].field)}>
		{#if showTrigger}
			<button
				bind:this={triggerButtonEl}
				id={`${baseId}-trigger`}
				type="button"
				disabled={disabled || undefined}
				aria-haspopup="dialog"
				aria-expanded={panelVisible}
				aria-controls={`${baseId}-panel`}
				class={twMerge(
					'rounded-primary border-primary-input-border focus:ring-primary-focus focus:border-primary-focus flex w-full min-w-fit cursor-pointer flex-row items-center gap-2 border bg-white text-left text-neutral-800 transition-colors focus:ring focus:outline-none disabled:cursor-default disabled:border-neutral-300/30 disabled:bg-neutral-300/30',
					triggerSizeClass[size],
					triggerClass
				)}
				onclick={handleTriggerClick}
			>
				{#if icon}
					<Icon {icon} class={twMerge('size-5 shrink-0 text-neutral-400', iconClass)} />
				{:else}
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
						class={twMerge('size-5 shrink-0 text-neutral-400', iconClass)}
					>
						<rect x="3" y="4" width="18" height="17" rx="2" />
						<path d="M3 9h18" />
						<path d="M8 2v4" />
						<path d="M16 2v4" />
					</svg>
				{/if}
				<span
					class={twMerge(
						'flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden',
						!committedRange.startDate && !committedRange.endDate && 'text-neutral-500'
					)}
				>
					{#if committedRange.startDate && committedRange.endDate && committedRange.startDate !== committedRange.endDate}
						<span class="truncate">{committedRange.startDate}</span>
						<svg
							viewBox="0 0 30 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
							class="h-4 w-5 shrink-0 text-neutral-400"
						>
							<path d="M4 12h22" />
							<path d="m19 5 7 7-7 7" />
						</svg>
						<span class="truncate">{committedRange.endDate}</span>
					{:else if committedRange.startDate || committedRange.endDate}
						<span class="truncate">{committedRange.startDate ?? committedRange.endDate}</span>
					{:else}
						<span class="truncate">{placeholder}</span>
					{/if}
				</span>
			</button>
		{/if}

		{#if panelVisible}
			<div
				id={`${baseId}-panel`}
				role="dialog"
				aria-label={ariaLabel}
				class={twMerge(
					'rounded-primary border-primary-card-border shadow-secondary border bg-white p-4 text-neutral-800',
					inline
						? 'w-full'
						: 'fixed top-0 left-0 z-20 w-[19rem] max-w-[calc(100vw-2rem)] md:w-[40rem]',
					panelClass
				)}
				use:anchoredPosition={{ anchor: anchorEl, placement: 'bottom-start', enabled: !inline }}
				transition:fly={{ y: -8, duration: transitionDuration }}
			>
				<div class={twMerge('flex w-full flex-col gap-4', controlsClass)}>
					{#if showPresets}
						<Select
							id={`${baseId}-preset`}
							labelText="Date Range"
							options={presetOptions}
							bind:value={selectedPresetId}
							size="md"
							onchange={handlePresetChange}
							class="w-full bg-white text-sm"
						/>
					{/if}

					<div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
						<TextInput
							id={`${baseId}-start-date`}
							labelText="Start Date"
							placeholder="YYYY-MM-DD"
							bind:value={startDateText}
							size="md"
							inputmode="numeric"
							pattern="\d{4}-\d{2}-\d{2}"
							onchange={commitStartDateText}
							onblur={commitStartDateText}
						/>

						<TextInput
							id={`${baseId}-end-date`}
							labelText="End Date"
							placeholder="YYYY-MM-DD"
							bind:value={endDateText}
							size="md"
							inputmode="numeric"
							pattern="\d{4}-\d{2}-\d{2}"
							onchange={commitEndDateText}
							onblur={commitEndDateText}
						/>
					</div>
				</div>

				<div class="mt-5 flex flex-col gap-4 md:flex-row">
					<CalendarMonth
						month={numberOfMonths === 1 ? rightMonth : leftMonth}
						startDate={draftStartDate}
						endDate={draftEndDate}
						{minDate}
						{maxDate}
						{today}
						{disableFuture}
						{weekStartsOn}
						{locale}
						showPrevious
						showNext={numberOfMonths === 1}
						onprevious={handlePreviousMonth}
						onnext={handleNextMonth}
						onselect={handleDaySelect}
						class={calendarClass}
						{dayClass}
					/>

					{#if numberOfMonths === 2}
						<CalendarMonth
							month={rightMonth}
							startDate={draftStartDate}
							endDate={draftEndDate}
							{minDate}
							{maxDate}
							{today}
							{disableFuture}
							{weekStartsOn}
							{locale}
							showNext
							onnext={handleNextMonth}
							onselect={handleDaySelect}
							class={calendarClass}
							{dayClass}
						/>
					{/if}
				</div>

				<div class={twMerge('mt-5 flex flex-row justify-end gap-3', footerClass)}>
					<Button variant="ghost" size="sm" onclick={handleCancel}>Cancel</Button>
					<Button variant="primary" size="sm" onclick={handleApply}>Apply</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
