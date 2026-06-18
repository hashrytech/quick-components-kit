<!--
@component Calendar

A single-date picker with optional time selection. It takes its visual cues from
{@link DatePicker} but is built for touch: the calendar header switches between
day, month, and year grids so any date is a few taps away, and the optional time
picker uses scrollable wheel-style columns. On small screens the popover becomes a
bottom sheet; on desktop it is an anchored popover.

The public `value` is a plain string so consuming projects need no date library:
- date only — `YYYY-MM-DD`
- with `enableTime` — `YYYY-MM-DDTHH:mm` (local, like a native `datetime-local`)

## Props

- `open?: boolean` — Popover visibility. Bindable.
- `value?: string | null` — Selected `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`. Bindable.
- `labelText?: string` — Optional label for the trigger.
- `labelPosition?: 'top' | 'bottom' | 'left' | 'right'` — Label placement. Default: `'top'`.
- `placeholder?: string` — Trigger text when nothing is selected.
- `showTrigger?: boolean` — Render the built-in trigger button. Default: `true`.
- `icon? / iconClass?` — Trigger icon (Iconify class) and its classes.
- `inline?: boolean` — Render the panel inline instead of as a popover.
- `enableTime?: boolean` — Show the time picker and emit a datetime value. Default: `false`.
- `timeFormat?: '12h' | '24h'` — Clock format for the time picker. Default: `'12h'`.
- `minuteStep?: number` — Minute granularity in the time picker. Default: `1`.
- `defaultTime?: { hours; minutes }` — Time used to seed the picker when the value has
  no time yet. Defaults to the current local time floored to `minuteStep`.
- `minDate? / maxDate?` — Selectable bounds in `YYYY-MM-DD`.
- `disablePast? / disableFuture?` — Disable dates before / after today. Default: `false`.
- `weekStartsOn?: 0–6` — First calendar day. Default: `0`.
- `locale?: string` — Intl locale for month, day, and date labels.
- `monthLabelStyle?: 'short' | 'long'` — Month names in the month grid. Default: `'short'`.
- `closeOnSelect?: boolean` — Close the popover when a day is picked. Defaults to `true`
  for date-only, `false` when `enableTime` (use Apply to commit).
- `showClear? / showToday?` — Footer quick actions. Default: `true`.
- `displayFormat?: (value) => string` — Custom trigger label formatter.
- `onchange?: (value) => void` — Called whenever the committed value changes.
- `onapply? / oncancel?` — Called when Apply commits / Cancel reverts.

Class props for theming: `class`, `labelClass`, `triggerClass`, `panelClass`,
`calendarClass`, `dayClass`, `timeClass`, `footerClass`.
-->

<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ClassNameValue } from 'tailwind-merge';
	import type { CalendarTime, ISODateString, TimeFormat, WeekStartsOn } from './calendar-utils.js';

	type ForwardedDivProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'onchange'>;

	export type CalendarSize = 'sm' | 'md' | 'lg';

	export type CalendarProps = ForwardedDivProps & {
		open?: boolean;
		value?: string | null;
		id?: string;
		name?: string;
		labelText?: string;
		labelClass?: ClassNameValue;
		labelPosition?: 'top' | 'bottom' | 'left' | 'right';
		placeholder?: string;
		disabled?: boolean;
		size?: CalendarSize;
		showTrigger?: boolean;
		icon?: string;
		iconClass?: ClassNameValue;
		inline?: boolean;
		enableTime?: boolean;
		timeFormat?: TimeFormat;
		minuteStep?: number;
		defaultTime?: CalendarTime;
		minDate?: ISODateString | null;
		maxDate?: ISODateString | null;
		disablePast?: boolean;
		disableFuture?: boolean;
		weekStartsOn?: WeekStartsOn;
		locale?: string;
		monthLabelStyle?: 'short' | 'long';
		ariaLabel?: string;
		closeOnSelect?: boolean;
		clickOutsideClose?: boolean;
		showClear?: boolean;
		showToday?: boolean;
		transitionDuration?: number;
		triggerClass?: ClassNameValue;
		panelClass?: ClassNameValue;
		calendarClass?: ClassNameValue;
		dayClass?: ClassNameValue | ((date: ISODateString) => ClassNameValue);
		timeClass?: ClassNameValue;
		footerClass?: ClassNameValue;
		displayFormat?: (value: string) => string;
		onchange?: (value: string | null) => void;
		onapply?: (value: string | null) => void;
		oncancel?: () => void;
		class?: ClassNameValue;
	};

	let nextId = 0;

	function createCalendarId(): string {
		nextId += 1;
		return `quick-calendar-${nextId}`;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { Button } from '$lib/components/button/index.js';
	import { Icon } from '$lib/components/icon/index.js';
	import { onKeydown } from '$lib/actions/on-keydown.js';
	import { clickOutside } from '$lib/functions/click-outside.js';
	import { config } from '$lib/configs/config.js';
	import { getTodayISO, startOfMonth } from '$lib/components/date-picker/date-utils.js';
	import CalendarGrid from './CalendarGrid.svelte';
	import TimePicker from './TimePicker.svelte';
	import {
		clampDay,
		floorMinutesToStep,
		formatCalendarDisplay,
		formatCalendarValue,
		isDayOutOfBounds,
		parseCalendarValue,
		resolveBounds
	} from './calendar-utils.js';

	let {
		open = $bindable(false),
		value = $bindable(null),
		id,
		name,
		labelText,
		labelClass,
		labelPosition = 'top',
		placeholder = 'Select date',
		disabled = false,
		size = 'md',
		showTrigger = true,
		icon,
		iconClass,
		inline = false,
		enableTime = false,
		timeFormat = '12h',
		minuteStep = 1,
		defaultTime,
		minDate = null,
		maxDate = null,
		disablePast = false,
		disableFuture = false,
		weekStartsOn = 0,
		locale,
		monthLabelStyle = 'short',
		ariaLabel = 'Date picker',
		closeOnSelect,
		clickOutsideClose = true,
		showClear = true,
		showToday = true,
		transitionDuration = config.transitionDuration,
		triggerClass,
		panelClass,
		calendarClass,
		dayClass,
		timeClass,
		footerClass,
		displayFormat,
		onchange,
		onapply,
		oncancel,
		class: className,
		...rest
	}: CalendarProps = $props();

	const generatedId = createCalendarId();
	const baseId = $derived(id ?? name ?? generatedId);
	const today = getTodayISO();
	const panelVisible = $derived(inline || open);

	const bounds = $derived(resolveBounds({ minDate, maxDate, today, disablePast, disableFuture }));
	const committed = $derived(parseCalendarValue(value));
	const submittedValue = $derived(
		formatCalendarValue(committed.date, committed.time, enableTime) ?? ''
	);

	// Date-only selections close on tap by default; time selections wait for Apply.
	const closeAfterSelect = $derived(closeOnSelect ?? !enableTime);
	// Apply/Cancel make sense only when a tap does not immediately commit.
	const confirmMode = $derived(enableTime && !inline);
	const footerVisible = $derived(confirmMode || showClear || showToday);

	const triggerDisplay = $derived(
		value
			? (displayFormat?.(value) ??
					formatCalendarDisplay(committed, { includeTime: enableTime, format: timeFormat, locale }))
			: null
	);

	const labelLayout: Record<
		NonNullable<CalendarProps['labelPosition']>,
		{ container: string; label: string; field: string }
	> = {
		top: { container: 'flex-col', label: '', field: 'w-full' },
		bottom: { container: 'flex-col', label: 'order-last', field: 'w-full' },
		left: { container: 'flex-row items-center', label: '', field: 'flex-1 min-w-0' },
		right: { container: 'flex-row items-center', label: 'order-last', field: 'flex-1 min-w-0' }
	};

	const triggerSizeClass: Record<CalendarSize, string> = {
		sm: 'h-[2.05rem] px-2 text-sm',
		md: 'h-[2.375rem] px-2.5 text-sm',
		lg: 'h-[2.8rem] px-3 text-base'
	};

	function resolveDefaultTime(): CalendarTime {
		if (defaultTime) {
			return floorMinutesToStep(defaultTime, minuteStep);
		}

		const now = new Date();
		return floorMinutesToStep({ hours: now.getHours(), minutes: now.getMinutes() }, minuteStep);
	}

	let draftDate = $state<ISODateString | null>(untrack(() => committed.date));
	let draftTime = $state<CalendarTime>(untrack(() => committed.time ?? resolveDefaultTime()));
	let viewMonth = $state<ISODateString>(untrack(() => startOfMonth(committed.date ?? today)));
	let previousOpen = false;

	let fieldEl = $state<HTMLDivElement>();
	let panelEl = $state<HTMLDivElement>();
	// Desktop popover placement — auto-flips above the trigger when there isn't room below.
	let placement = $state<'bottom' | 'top'>('bottom');

	$effect(() => {
		if (open && !previousOpen) {
			syncDraftFromValue();
		}

		if (!panelVisible) {
			syncDraftFromValue();
		}

		previousOpen = open;
	});

	// Decide whether the desktop popover opens below (default) or flips above the trigger,
	// based on the room available in the viewport. Re-run on open, scroll, and resize.
	function updatePlacement(): void {
		if (inline || !open || !fieldEl || typeof window === 'undefined') {
			return;
		}
		// Below `md` the panel renders as a fixed bottom sheet, so flipping does not apply.
		if (!window.matchMedia('(min-width: 768px)').matches) {
			placement = 'bottom';
			return;
		}
		const rect = fieldEl.getBoundingClientRect();
		const gap = 8; // mirrors the 0.5rem trigger gap
		const panelHeight = panelEl?.offsetHeight ?? 360;
		const spaceBelow = window.innerHeight - rect.bottom - gap;
		const spaceAbove = rect.top - gap;
		// Flip up only when the panel would overflow below and there is more room above.
		placement = spaceBelow < panelHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';
	}

	$effect(() => {
		if (panelVisible && !inline) {
			updatePlacement();
		} else {
			placement = 'bottom';
		}
	});

	function syncDraftFromValue(): void {
		const parts = parseCalendarValue(value);
		draftDate = parts.date;
		draftTime = parts.time ?? resolveDefaultTime();
		viewMonth = startOfMonth(parts.date ?? today);
	}

	function commitDraft(): void {
		const next = formatCalendarValue(draftDate, enableTime ? draftTime : null, enableTime);
		value = next;
		onchange?.(next);
	}

	function handleTriggerClick(): void {
		if (disabled) {
			return;
		}

		if (!open) {
			syncDraftFromValue();
		}

		open = !open;
	}

	function handleOutsideClick(): void {
		if (!inline && open && clickOutsideClose) {
			handleClose();
		}
	}

	function handleClose(): void {
		// Closing without Apply reverts an uncommitted time draft.
		if (confirmMode) {
			syncDraftFromValue();
		}

		open = false;
	}

	function handleEscape(event: KeyboardEvent): void {
		if (!panelVisible) {
			return;
		}

		event.preventDefault();

		if (inline) {
			return;
		}

		handleCancel();
	}

	function handleDaySelect(date: ISODateString): void {
		if (isDayOutOfBounds(date, bounds)) {
			return;
		}

		draftDate = date;
		viewMonth = startOfMonth(date);

		if (confirmMode) {
			return;
		}

		commitDraft();

		if (!inline && closeAfterSelect) {
			open = false;
		}
	}

	function handleTimeChange(time: CalendarTime): void {
		draftTime = time;

		if (!confirmMode) {
			commitDraft();
		}
	}

	function handleToday(): void {
		const target = clampDay(today, bounds);

		if (isDayOutOfBounds(target, bounds)) {
			return;
		}

		draftDate = target;
		viewMonth = startOfMonth(target);

		if (!confirmMode) {
			commitDraft();

			if (!inline && closeAfterSelect && !enableTime) {
				open = false;
			}
		}
	}

	function handleClear(): void {
		draftDate = null;

		if (!confirmMode) {
			value = null;
			onchange?.(null);
		}
	}

	function handleCancel(): void {
		syncDraftFromValue();
		oncancel?.();

		if (!inline) {
			open = false;
		}
	}

	function handleApply(): void {
		commitDraft();
		onapply?.(formatCalendarValue(draftDate, enableTime ? draftTime : null, enableTime));

		if (!inline) {
			open = false;
		}
	}
</script>

<svelte:window onresize={updatePlacement} onscroll={updatePlacement} />

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

	<div bind:this={fieldEl} class={twMerge('relative flex flex-col gap-1', labelLayout[labelPosition].field)}>
		{#if showTrigger}
			<button
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
				<span class={twMerge('min-w-0 flex-1 truncate', !triggerDisplay && 'text-neutral-500')}>
					{triggerDisplay ?? placeholder}
				</span>
			</button>
		{/if}

		{#if panelVisible && !inline && clickOutsideClose}
			<!-- Mobile backdrop turns the popover into a bottom sheet. -->
			<button
				type="button"
				aria-label="Close"
				tabindex="-1"
				class="fixed inset-0 z-20 bg-black/40 md:hidden"
				transition:fade={{ duration: transitionDuration }}
				onclick={handleClose}
			></button>
		{/if}

		{#if panelVisible}
			<div
				bind:this={panelEl}
				id={`${baseId}-panel`}
				role="dialog"
				aria-modal={!inline ? 'true' : undefined}
				aria-label={ariaLabel}
				class={twMerge(
					'border-primary-card-border shadow-secondary border bg-white p-4 text-neutral-800',
					inline
						? 'rounded-primary w-full'
						: twMerge(
								'z-30',
								'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:w-full max-md:rounded-t-2xl max-md:rounded-b-none',
								'md:rounded-primary md:absolute md:left-0 md:w-[20rem] md:max-w-[calc(100vw-2rem)]',
								placement === 'top'
									? 'md:bottom-[calc(100%+0.5rem)]'
									: 'md:top-[calc(100%+0.5rem)]'
							),
					panelClass
				)}
				transition:fly={{ y: inline ? -8 : placement === 'top' ? -12 : 12, duration: transitionDuration }}
			>
				<div class="flex flex-col gap-4">
					<CalendarGrid
						bind:viewMonth
						selectedDate={draftDate}
						{today}
						{bounds}
						{weekStartsOn}
						{locale}
						{monthLabelStyle}
						onselect={handleDaySelect}
						class={calendarClass}
						{dayClass}
					/>

					{#if enableTime}
						<TimePicker
							bind:time={draftTime}
							format={timeFormat}
							{minuteStep}
							id={`${baseId}-time`}
							onchange={handleTimeChange}
							class={timeClass}
						/>
					{/if}
				</div>

				{#if footerVisible}
					<div
						class={twMerge('mt-4 flex flex-row items-center justify-between gap-3', footerClass)}
					>
						<div class="flex flex-row gap-2">
							{#if showToday}
								<Button variant="ghost" size="sm" onclick={handleToday}>Today</Button>
							{/if}
							{#if showClear}
								<Button variant="ghost" size="sm" onclick={handleClear}>Clear</Button>
							{/if}
						</div>

						{#if confirmMode}
							<div class="flex flex-row gap-2">
								<Button variant="ghost" size="sm" onclick={handleCancel}>Cancel</Button>
								<Button variant="primary" size="sm" onclick={handleApply}>Apply</Button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
