<script lang="ts">
	import { TextInput } from '$lib/components/text-input/index.js';
	import { MoneyInput } from '$lib/components/money-input/index.js';
	import Button from '$lib/components/button/Button.svelte';
	import LinkButton from '$lib/components/link-button/LinkButton.svelte';
	import HamburgerMenu from '$lib/components/hamburger-menu/HamburgerMenu.svelte';
	import Drawer from '$lib/components/drawer/Drawer.svelte';
	import Modal from '$lib/components/modal/Modal.svelte';
	import Checkbox from '$lib/components/checkbox/Checkbox.svelte';
	import { DatePicker } from '$lib/components/date-picker/index.js';
	import { Calendar } from '$lib/components/calendar/index.js';
	import Radio from '$lib/components/radio/Radio.svelte';
	import TabNavigation from '$lib/components/tab-navigation/TabNavigation.svelte';
	import { Table, TableTh, TableTd } from '$lib/components/table/index.js';
	import Select from '$lib/components/select/Select.svelte';
	import SegmentedControl from '$lib/components/segmented-control/SegmentedControl.svelte';
	import ChoiceCards from '$lib/components/choice-cards/ChoiceCards.svelte';
	import InlineSentence from '$lib/components/inline-sentence/InlineSentence.svelte';
	import TextArea from '$lib/components/text-area/TextArea.svelte';
	import ToastContainer from '$lib/components/toast/ToastContainer.svelte';
	import { showToast, toastIcons, toastOptions } from '$lib/components/toast/index.js';
	import { dragDropZone, itemId, type DragDropEvent } from '$lib/modules/drag-drop/index.js';
	import { flip } from 'svelte/animate';
	import DragDropProviderSmart from '$lib/components/drag-drop/DragDropProviderSmart.svelte';
	import OverlayInsetPanel from '$lib/components/overlay-inset-panel/OverlayInsetPanel.svelte';
	import IconTile from '$lib/components/icon-tile/IconTile.svelte';
	import SegmentedToolbar from '$lib/components/segmented-toolbar/SegmentedToolbar.svelte';
	import ToggleList from '$lib/components/toggle-list/ToggleList.svelte';
	import MasterChecklist from '$lib/components/master-checklist/MasterChecklist.svelte';

	/* Globally available state variables for toast */
	toastIcons['info'] = 'icon-[ion--information-circle]';
	toastIcons['success'] = 'icon-[ion--checkmark-circle]';
	toastIcons['warning'] = 'icon-[ion--warning]';
	toastIcons['error'] = 'icon-[ion--close-circle]';
	toastIcons['debug'] = 'icon-[ion--bug]';
	toastOptions.closeButtonIcon = 'icon-[ion--close-circle-sharp]';

	let menuVerticalOpen = $state(false);
	let menuHorizontalOpen = $state(false);
	let modalOpen = $state(false);
	let overlayInsetOpen = $state(false);
	let radioValue = $state('Apple');
	let showMultiSelect = $state(true);
	let selectValue = $state('apple');
	let discountMode = $state('automatic');
	let orderScope = $state('any');
	let segmentSize = $state<'sm' | 'md' | 'lg'>('md');
	let cardDiscountMode = $state('automatic');
	let cardOrderScope = $state('any');
	let cardDelivery = $state('standard');
	let sentenceMode = $state('automatic');
	let sentenceScope = $state('first');
	let sentenceBilling = $state('monthly');
	/* Money Input */
	let moneyBasic = $state('');
	let moneyLoaded = $state('1250.0000');
	let moneyAdjustment = $state('-5.50');
	let moneyMinFee = $state('');
	let moneyDisabled = $state('99.99');
	let moneyRequired = $state('');

	let datePickerOpen = $state(false);
	let datePickerStart = $state('2026-06-01');
	let datePickerEnd = $state('2026-06-12');

	/* New multi-select demos: IconTile, SegmentedToolbar, ToggleList, MasterChecklist */
	let iconTileVertical = $state<(string | number)[]>(['pickup', 'dining']);
	let iconTileHorizontal = $state<(string | number)[]>(['delivery']);
	let iconTileCustom = $state<(string | number)[]>(['shipping', 'retail']);
	let iconTileError = $state<(string | number)[]>([]);
	let iconTileDisabled = $state<(string | number)[]>(['pickup']);
	let segToolbarWrap = $state<(string | number)[]>(['pickup', 'dining']);
	let segToolbarInline = $state<(string | number)[]>(['delivery', 'shipping']);
	let segToolbarSize = $state<(string | number)[]>(['retail', 'pickup']);
	let segToolbarDisabled = $state<(string | number)[]>(['dining', 'delivery']);
	let toggleListDefault = $state<(string | number)[]>(['pickup', 'delivery']);
	let toggleListCompact = $state<(string | number)[]>(['dining']);
	let toggleListError = $state<(string | number)[]>([]);
	let masterChecklistOrderTypes = $state<(string | number)[]>(['pickup', 'delivery']);
	let masterChecklistCustomIcon = $state<(string | number)[]>(['dining', 'retail']);
	let masterChecklistError = $state<(string | number)[]>(['shipping']);

	/* Calendar */
	let calendarDate = $state<string | null>('2026-06-14');
	let calendarDateTime = $state<string | null>('2026-06-14T09:30');
	let calendarSchedule = $state<string | null>(null);
	let calendarInline = $state<string | null>('2026-06-14');
	const drawerItems = Array.from({ length: 20 }, (_, index) => `Drawer item ${index + 1}`);

	/* Drag Drop */
	type Item = { id: string; label: string; color: string };

	let items = $state<Item[]>([
		{ id: '1', label: 'Item One', color: 'bg-blue-500' },
		{ id: '2', label: 'Item Two', color: 'bg-green-500' },
		{ id: '3', label: 'Item Three', color: 'bg-yellow-500' },
		{ id: '4', label: 'Item Four', color: 'bg-red-500' }
	]);

	function sync(e: CustomEvent<DragDropEvent<Item>>) {
		items = e.detail.items;
	}

	type Card = { id: string; title: string };

	let todo = $state<Card[]>([
		{ id: '1', title: 'Write docs' },
		{ id: '2', title: 'Review PR' }
	]);

	let done = $state<Card[]>([{ id: '3', title: 'Ship release' }]);
	/* End of Drag Drop */
</script>

<h1 class="bg-primary-600 mx-2 mt-4 rounded-lg p-2 text-center text-xl font-semibold text-white">
	Quick Components Kit
</h1>
<a href="/quick-store">Go to Quick Store</a>

<div class="flex w-full flex-row gap-10 rounded bg-gray-50">
	<div class="flex w-full flex-col gap-1 px-2">
		<p class="font-medium">Primary</p>
		<div class="flex w-full flex-row items-center justify-center gap-0.5">
			{#each ['bg-primary-50', 'bg-primary-100', 'bg-primary-200', 'bg-primary-300', 'bg-primary-400', 'bg-primary-500', 'bg-primary-600', 'bg-primary-700', 'bg-primary-800', 'bg-primary-900', 'bg-primary-950'] as bg_color (bg_color)}
				<div
					class="h-10 w-full {bg_color} flex items-center justify-center rounded text-center text-sm font-medium"
				>
					&nbsp;
				</div>
			{/each}
		</div>
	</div>

	<div class="flex w-full flex-col gap-1 px-2">
		<p class="font-medium">Secondary</p>
		<div class="flex w-full flex-row items-center justify-center gap-0.5">
			{#each ['bg-secondary-50', 'bg-secondary-100', 'bg-secondary-200', 'bg-secondary-300', 'bg-secondary-400', 'bg-secondary-500', 'bg-secondary-600', 'bg-secondary-700', 'bg-secondary-800', 'bg-secondary-900', 'bg-secondary-950'] as bg_color (bg_color)}
				<div
					class="h-10 w-full {bg_color} flex items-center justify-center rounded text-center text-sm font-medium"
				>
					&nbsp;
				</div>
			{/each}
		</div>
	</div>
</div>

<ToastContainer />

<form class="flex flex-col gap-4">
	<div class="flex w-full flex-row flex-wrap items-center gap-2">
		<TextInput
			id="Small"
			placeholder="Small..."
			labelText="Small"
			class=""
			size="sm"
			required={true}
			type="text"
		>
			{#snippet leftIcon()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-anvil-icon lucide-anvil"
				>
					<path d="M7 10H6a4 4 0 0 1-4-4 1 1 0 0 1 1-1h4" />
					<path d="M7 5a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1 7 7 0 0 1-7 7H8a1 1 0 0 1-1-1z" />
					<path d="M9 12v5" />
					<path d="M15 12v5" />
					<path d="M5 20a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3 1 1 0 0 1-1 1H6a1 1 0 0 1-1-1" />
				</svg>
			{/snippet}
		</TextInput>
		<TextInput
			id="Medium"
			placeholder="Medium..."
			labelText="Medium"
			class=""
			size="md"
			disabled={true}
			labelPosition="bottom"
		/>
		<TextInput
			id="Medium"
			placeholder="Medium..."
			labelText="Medium"
			class=""
			size="md"
			disabled={false}
			labelPosition="left"
		/>
		<TextInput
			id="Small"
			placeholder="Small..."
			labelText="Small"
			class=""
			size="sm"
			disabled={false}
			labelPosition="right"
		/>
		<TextInput
			id="Large"
			placeholder="Large (Force Positive Number) ..."
			labelText="Large"
			class=""
			size="lg"
			max={5}
			min={2}
			error="A name is required."
			forcePositiveNumber={true}
			type="number"
			onInput={(e) => console.log(e)}
		/>

		<TextInput id="searchBox" value="search box" placeholder="Product search...">
			{#snippet leftIcon()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="size-5 text-neutral-400"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path
						d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 
                6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 
                12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"
					>
					</path>
				</svg>
			{/snippet}

			{#snippet rightIcon()}
				<button type="button" aria-label="clear search">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="size-5 text-neutral-400"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 
                  22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 
                  16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"
						>
						</path>
					</svg>
				</button>
			{/snippet}
		</TextInput>
	</div>
	<button type="submit" class="rounded-primary w-full bg-green-500 p-2">Submit</button>
</form>

<div class="flex w-full flex-row gap-4">
	<TextInput
		id="string icon SM"
		placeholder="String Icon SM"
		labelText="String Icon SM"
		class=""
		size="sm"
		leftIcon="icon-[ion--add-circle]"
		rightIcon="icon-[ion--add-circle]"
	/>
	<TextInput
		onLeftIconClick={() => console.log('Left Icon String Clicked')}
		id="string icon MD"
		placeholder="String Icon MD"
		labelText="String Icon MD"
		class=""
		size="md"
		leftIcon="icon-[ri--search-line]"
		rightIcon="icon-[ion--add-circle]"
	/>
	<TextInput
		onRightIconClick={() => console.log('Right Icon String Clicked')}
		id="string icon LG"
		placeholder="String Icon LG"
		labelText="String Icon LG"
		class=""
		size="lg"
		leftIcon="icon-[ion--add-circle]"
		rightIcon="icon-[ion--add-circle]"
	/>
</div>
<hr />

<div class="flex flex-col gap-4 p-4">
	<p class="font-medium">
		Money Input (2dp entry policy — commits to two decimal places on blur, floors at 0 by default)
	</p>

	<div class="flex flex-row flex-wrap items-start gap-6">
		<div class="flex flex-col gap-1">
			<MoneyInput
				id="money-basic"
				labelText="Price"
				placeholder="0.00"
				leftIcon="icon-[ion--cash-outline]"
				bind:value={moneyBasic}
			/>
			<p class="text-sm text-neutral-600">Value: {moneyBasic === '' ? '—' : moneyBasic}</p>
		</div>

		<div class="flex flex-col gap-1">
			<MoneyInput
				id="money-loaded"
				labelText="Loaded 4dp value (blur to normalize)"
				bind:value={moneyLoaded}
			/>
			<p class="text-sm text-neutral-600">Value: {moneyLoaded}</p>
		</div>

		<div class="flex flex-col gap-1">
			<MoneyInput
				id="money-adjustment"
				labelText="Adjustment (allowNegative)"
				allowNegative
				bind:value={moneyAdjustment}
			/>
			<p class="text-sm text-neutral-600">Value: {moneyAdjustment}</p>
		</div>

		<div class="flex flex-col gap-1">
			<MoneyInput
				id="money-min-fee"
				labelText="Fee (min 5.00)"
				placeholder="5.00 or more"
				min={5}
				bind:value={moneyMinFee}
			/>
			<p class="text-sm text-neutral-600">Value: {moneyMinFee === '' ? '—' : moneyMinFee}</p>
		</div>
	</div>

	<p class="font-medium">Sizes, error and disabled states</p>

	<div class="flex flex-row flex-wrap items-start gap-6">
		<MoneyInput id="money-sm" labelText="Small" size="sm" placeholder="0.00" />
		<MoneyInput id="money-lg" labelText="Large" size="lg" placeholder="0.00" />
		<MoneyInput
			id="money-required"
			labelText="Amount (required)"
			placeholder="0.00"
			required
			error="An amount is required."
			bind:value={moneyRequired}
		/>
		<MoneyInput id="money-disabled" labelText="Disabled" disabled bind:value={moneyDisabled} />
	</div>
</div>

<hr />

<div class="flex flex-col gap-4 p-4">
	<div class="flex flex-row flex-wrap items-start gap-6">
		<DatePicker
			labelText="Date Picker"
			labelClass="text-sm font-medium text-neutral-700"
			iconClass="text-primary-500"
			bind:open={datePickerOpen}
			bind:startDate={datePickerStart}
			bind:endDate={datePickerEnd}
		/>

		<p class="text-sm text-neutral-600">
			Selected: {datePickerStart} - {datePickerEnd}
		</p>
	</div>
</div>

<hr />

<div class="flex flex-col gap-4 p-4">
	<p class="font-medium">Calendar (single date, mobile-friendly month/year navigation)</p>
	<div class="flex flex-row flex-wrap items-start gap-6">
		<div class="flex flex-col gap-1">
			<Calendar
				labelText="Date"
				bind:value={calendarDate}
				onchange={(v) => console.log('Calendar date:', v)}
			/>
			<p class="text-sm text-neutral-600">Value: {calendarDate ?? '—'}</p>
		</div>

		<div class="flex flex-col gap-1">
			<Calendar
				labelText="Date &amp; time (12h)"
				enableTime
				minuteStep={5}
				bind:value={calendarDateTime}
				onchange={(v) => console.log('Calendar datetime:', v)}
			/>
			<p class="text-sm text-neutral-600">Value: {calendarDateTime ?? '—'}</p>
		</div>

		<div class="flex flex-col gap-1">
			<Calendar
				labelText="Schedule (24h, no past)"
				enableTime
				timeFormat="24h"
				minuteStep={15}
				disablePast
				placeholder="Pick a future slot"
				bind:value={calendarSchedule}
			/>
			<p class="text-sm text-neutral-600">Value: {calendarSchedule ?? '—'}</p>
		</div>
	</div>

	<p class="font-medium">Calendar (inline)</p>
	<div class="flex flex-row flex-wrap items-start gap-6">
		<Calendar inline showTrigger={false} class="w-[19rem]" bind:value={calendarInline} />
		<p class="text-sm text-neutral-600">Value: {calendarInline ?? '—'}</p>
	</div>
</div>

<hr />

<div class="flex flex-row flex-wrap items-center gap-10">
	<div class="flex flex-row items-center gap-4">
		<p>Button</p>
		<Button
			icon="icon-[ion--add-circle]"
			iconClass="size-6 text-neutral-900"
			class="text-base font-semibold text-white">Get Started</Button
		>
		<Button
			iconClass="size-6 text-neutral-50"
			class="text-base font-semibold text-white"
			loading={true}
			loadingIcon="icon-[ion--sync]">Loading Icon</Button
		>
	</div>

	<div class="flex flex-row items-center gap-4">
		<p>Toast Button</p>
		<Button
			onclick={() =>
				showToast(
					'success',
					'This is a toast message that is very long and needs extra material',
					'This is a sub message that is nice'
				)}
			icon="icon-[ion--images]"
			iconClass="size-6 text-neutral-900"
			class="text-base font-semibold text-white">Show Toast</Button
		>
	</div>

	<div class="flex flex-row items-center gap-4">
		<p>Icon Button</p>
		<Button class="">
			{#snippet icon()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					fill="#000000"
					viewBox="0 0 256 256"
				>
					<path
						d="M185.33,114.21l29.14-27.42.17-.17a32,32,0,0,0-45.26-45.26c0,.06-.11.11-.17.17L141.79,70.67l-83-30.2a8,8,0,0,0-8.39,1.86l-24,24a8,8,0,0,0,1.22,
                    12.31l63.89,42.59L76.69,136H56a8,8,0,0,0-5.65,2.34l-24,24A8,8,0,0,0,29,175.42l36.82,14.73,14.7,36.75.06.16a8,8,0,0,0,13.18,2.47l23.87-23.88A8,8,0,0,0,120,
                    200V179.31l14.76-14.76,42.59,63.89a8,8,0,0,0,12.31,1.22l24-24a8,8,0,0,0,1.86-8.39Zm-.07,97.23-42.59-63.88A8,8,0,0,0,136.8,144c-.27,0-.53,0-.79,0a8,8,0,0,0-5.66,
                    2.35l-24,24A8,8,0,0,0,104,176v20.69L90.93,209.76,79.43,181A8,8,0,0,0,75,176.57l-28.74-11.5L59.32,152H80a8,8,0,0,0,5.66-2.34l24-24a8,8,0,0,0-1.22-12.32L44.56,70.74l13.5-13.49,
                    83.22,30.26a8,8,0,0,0,8.56-2L180.78,52.6A16,16,0,0,1,203.4,75.23l-32.87,30.93a8,8,0,0,0-2,8.56l30.26,83.22Z"
					>
					</path>
				</svg>
			{/snippet}
			Get Started
		</Button>
	</div>

	<div class="flex flex-row items-center gap-4">
		<p>Active Icon Button</p>
		<Button variant="secondary" class="">
			{#snippet icon()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					fill="#000000"
					viewBox="0 0 256 256"
				>
					<path
						d="M185.33,114.21l29.14-27.42.17-.17a32,32,0,0,0-45.26-45.26c0,.06-.11.11-.17.17L141.79,70.67l-83-30.2a8,8,0,0,0-8.39,1.86l-24,24a8,8,0,0,0,1.22,
                    12.31l63.89,42.59L76.69,136H56a8,8,0,0,0-5.65,2.34l-24,24A8,8,0,0,0,29,175.42l36.82,14.73,14.7,36.75.06.16a8,8,0,0,0,13.18,2.47l23.87-23.88A8,8,0,0,0,120,
                    200V179.31l14.76-14.76,42.59,63.89a8,8,0,0,0,12.31,1.22l24-24a8,8,0,0,0,1.86-8.39Zm-.07,97.23-42.59-63.88A8,8,0,0,0,136.8,144c-.27,0-.53,0-.79,0a8,8,0,0,0-5.66,
                    2.35l-24,24A8,8,0,0,0,104,176v20.69L90.93,209.76,79.43,181A8,8,0,0,0,75,176.57l-28.74-11.5L59.32,152H80a8,8,0,0,0,5.66-2.34l24-24a8,8,0,0,0-1.22-12.32L44.56,70.74l13.5-13.49,
                    83.22,30.26a8,8,0,0,0,8.56-2L180.78,52.6A16,16,0,0,1,203.4,75.23l-32.87,30.93a8,8,0,0,0-2,8.56l30.26,83.22Z"
					>
					</path>
				</svg>
			{/snippet}
			{#snippet loadingIcon()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					fill="#000000"
					viewBox="0 0 256 256"
					class="animate-spin"
				>
					<path
						d="M185.33,114.21l29.14-27.42.17-.17a32,32,0,0,0-45.26-45.26c0,.06-.11.11-.17.17L141.79,70.67l-83-30.2a8,8,0,0,0-8.39,1.86l-24,24a8,8,0,0,0,1.22,
                    12.31l63.89,42.59L76.69,136H56a8,8,0,0,0-5.65,2.34l-24,24A8,8,0,0,0,29,175.42l36.82,14.73,14.7,36.75.06.16a8,8,0,0,0,13.18,2.47l23.87-23.88A8,8,0,0,0,120,
                    200V179.31l14.76-14.76,42.59,63.89a8,8,0,0,0,12.31,1.22l24-24a8,8,0,0,0,1.86-8.39Zm-.07,97.23-42.59-63.88A8,8,0,0,0,136.8,144c-.27,0-.53,0-.79,0a8,8,0,0,0-5.66,
                    2.35l-24,24A8,8,0,0,0,104,176v20.69L90.93,209.76,79.43,181A8,8,0,0,0,75,176.57l-28.74-11.5L59.32,152H80a8,8,0,0,0,5.66-2.34l24-24a8,8,0,0,0-1.22-12.32L44.56,70.74l13.5-13.49,
                    83.22,30.26a8,8,0,0,0,8.56-2L180.78,52.6A16,16,0,0,1,203.4,75.23l-32.87,30.93a8,8,0,0,0-2,8.56l30.26,83.22Z"
					>
					</path>
				</svg>
			{/snippet}
			Get Started
		</Button>
	</div>

	<div class="flex flex-row items-center gap-4">
		<p>Button Disabled</p>
		<Button variant="secondary" disabled={true} class="text-base font-semibold text-white"
			>Secondary Disabled</Button
		>
	</div>

	<div class="flex flex-row items-center gap-4">
		<p>Link Button</p>
		<LinkButton href="/" class="text-base font-semibold text-white">Active Link Button</LinkButton>
	</div>
</div>

<hr />

<div class="flex flex-row flex-wrap items-center gap-10">
	<div class="flex flex-row items-center gap-4">
		<p>Hamburger Menu &amp; Left Drawer</p>
		<HamburgerMenu
			ariaLabel="Toggle Horizontal Menu"
			bind:open={menuHorizontalOpen}
			onclick={() => {
				menuHorizontalOpen = !menuHorizontalOpen;
			}}
		/>
		<Drawer bind:open={menuHorizontalOpen} position="left" disableContentScroll={true}>
			<div class="flex w-full flex-col gap-4 p-4">
				<p>Hello</p>
				<p>This drawer keeps its width stable while the local scrollbar is locked.</p>
				<Button
					class="bg-red-500 text-base font-semibold text-white"
					onclick={() => {
						menuHorizontalOpen = false;
						console.log('MENU: ', menuHorizontalOpen);
					}}>Close Drawer</Button
				>
				<Button class="bg-red-500 text-base font-semibold text-white">Test Trap</Button>
				{#each drawerItems as item (item)}
					<p>{item}</p>
				{/each}
			</div>
		</Drawer>
	</div>

	<div class="flex flex-row items-center gap-4">
		<p>Hamburger Menu &amp; Top Drawer</p>
		<HamburgerMenu
			ariaLabel="Toggle Vertical Menu"
			bind:open={menuVerticalOpen}
			onclick={() => {
				menuVerticalOpen = !menuVerticalOpen;
			}}
			useCloseBtn={false}
		/>
		<Drawer bind:open={menuVerticalOpen} position="top" size="sm" class="h-[40vh] max-w-2xl">
			{#snippet header()}
				<h3 class="text-base font-semibold">Top Drawer</h3>
			{/snippet}
			<div class="flex w-full flex-col gap-4 p-4">
				<p>The title bar and footer stay pinned; only this list scrolls.</p>
				{#each drawerItems as item (item)}
					<p>{item}</p>
				{/each}
			</div>
			{#snippet footer()}
				<div class="flex flex-row justify-end border-t border-neutral-300 bg-neutral-100 p-3">
					<Button
						class="bg-red-500 text-base font-semibold text-white"
						onclick={() => (menuVerticalOpen = false)}>Done</Button
					>
				</div>
			{/snippet}
		</Drawer>
	</div>
</div>

<hr />

<div class="flex flex-row items-center gap-10">
	<div class="flex flex-row items-center gap-4">
		<p>Modal</p>
		<Button class="bg-sky-500 text-base font-semibold text-white" onclick={() => (modalOpen = true)}
			>Show Modal</Button
		>
		<Button
			id="overlay-inset-trigger"
			class="bg-sky-500 text-base font-semibold text-white"
			onclick={() => (overlayInsetOpen = true)}>OverlayInsetShow</Button
		>
	</div>

	<Modal bind:open={modalOpen} mobileDrawer={true} drawerSize="90dvh" drawerFill={false}>
		{#snippet header()}
			<h3 class="text-base font-semibold">Modal Title</h3>
		{/snippet}
		<div class="p-4">
			<p class="mb-4">
				This is a simple modal dialog. The header and footer stay pinned; only this content scrolls.
			</p>
			<Button
				class="bg-red-500 text-base font-semibold text-white"
				onclick={() => (modalOpen = false)}>Close Modal</Button
			>
			<Button
				class="bg-red-500 text-base font-semibold text-white"
				onclick={() => (modalOpen = false)}>Test Modal</Button
			>
			{#each drawerItems as item (item)}
				<p>{item}</p>
			{/each}
		</div>
		{#snippet footer()}
			<div class="flex flex-row justify-end border-t border-neutral-300 bg-neutral-100 p-3">
				<Button
					class="bg-red-500 text-base font-semibold text-white"
					onclick={() => (modalOpen = false)}>Done</Button
				>
			</div>
		{/snippet}
	</Modal>
</div>

<hr />

<div class="flex flex-col gap-4">
	<p class="font-medium">
		OverlayInsetPanel (renders inside the nearest <code>relative</code> ancestor)
	</p>
	<!-- The panel is absolutely positioned, so it needs a positioned, sized parent.
	     The trigger sits outside that box and is registered via clickOutsideIgnoreIds. -->
	<div
		class="rounded-primary relative h-56 w-full max-w-md overflow-hidden border border-neutral-300 bg-neutral-50 p-4"
	>
		<p class="text-sm text-neutral-600">
			This box is the positioned ancestor. Press “OverlayInsetShow” and the inset panel slides in,
			dimming and blurring this content. Click the dimmed area to close.
		</p>
		<OverlayInsetPanel
			bind:open={overlayInsetOpen}
			clickOutsideIgnoreIds={['overlay-inset-trigger']}
			panelClasses="rounded-primary bg-white p-4 shadow-primary"
		>
			<div class="flex h-32 w-full items-center justify-center bg-sky-200 text-sm text-sky-900">
				Inset panel content
			</div>
		</OverlayInsetPanel>
	</div>
</div>

<hr />

<div class="flex flex-row flex-wrap items-center gap-x-10 gap-y-4">
	<div class="flex flex-row flex-wrap items-center gap-4">
		<Checkbox
			class="text-center"
			containerClass="items-center"
			labelPosition="top"
			id="checkbox1"
			labelText="Check Box 1 Active"
			checked={true}
			onclick={() => {
				console.log('Checkbox 1 clicked');
			}}
			onchange={() => {
				console.log('Checkbox 1 changed');
			}}
		/>
		<Checkbox
			labelPosition="bottom"
			id="checkbox2"
			labelText="Check Box 2 Active"
			checked={true}
			onclick={() => {
				console.log('Checkbox 2 clicked');
			}}
			onchange={() => {
				console.log('Checkbox 2 changed');
			}}
		/>
		<Checkbox
			labelPosition="left"
			id="checkbox3"
			labelText="Check Box 3 Active"
			checked={true}
			onclick={() => {
				console.log('Checkbox 3 clicked');
			}}
			onchange={() => {
				console.log('Checkbox 3 changed');
			}}
		/>
		<Checkbox
			labelPosition="right"
			id="checkbox4"
			labelText="Check Box 4 Active"
			checked={true}
			onclick={() => {
				console.log('Checkbox 4 clicked');
			}}
			onchange={() => {
				console.log('Checkbox 4 changed');
			}}
		/>
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<Radio
			id="radio1"
			labelText="Radio Button 1"
			labelPosition="top"
			containerClass="items-center"
			name="fruit"
			value="Apple"
			bind:group={radioValue}
			onclick={() => {
				console.log('Radio 1 clicked');
			}}
		/>
		<Radio
			id="radio2"
			labelText="Radio Button 2"
			name="fruit"
			value="Banana"
			bind:group={radioValue}
			onchange={() => {
				console.log('Radio 2 changed');
			}}
		/>
	</div>
</div>

<hr />

<div class="flex flex-row items-center gap-10">
	<TabNavigation
		class="hover:border-lime-500/40"
		links={[
			{ text: 'Tab 1', href: '/', active: true },
			{ text: 'Tab 2', href: '#tab2', active: false },
			{ text: 'Tab 3', href: '#tab3', active: false }
		]}
	/>
</div>

<hr />

<div class="z-10 flex flex-col items-center gap-10">
	<Button
		class="bg-blue-500 text-base font-semibold text-white"
		onclick={() => (showMultiSelect = !showMultiSelect)}
	>
		Toggle Multi Select
	</Button>
	<Table
		rows={[
			{ id: 1, name: 'John Doe', age: 30 },
			{ id: 2, name: 'Jane Smith', age: 25 },
			{ id: 3, name: 'Alice Johnson', age: 28 }
		]}
		getKey={(u) => u.id.toString()}
		bind:showMultiSelect
		checkboxClass="border-neutral-300"
	>
		{#snippet headings()}
			<TableTh class="w-[30rem]">DLDJHDLJLKDLDJDLKJDL</TableTh>
			<TableTh class="w-[30rem]">Name</TableTh>
			<TableTh class="w-[30rem]">Age</TableTh>
		{/snippet}

		{#snippet tableRow(row)}
			<TableTd>{row.id}</TableTd>
			<TableTd>{row.name}</TableTd>
			<TableTd>{row.age}</TableTd>
		{/snippet}

		{#snippet tableRowMobile(row)}
			<div class="flex flex-col gap-2">
				<p class="font-semibold">ID: {row.id}</p>
				<p class="font-semibold">Name: {row.name}</p>
				<p class="font-semibold">Age: {row.age}</p>
			</div>
		{/snippet}
	</Table>
</div>

<div class="flex flex-row flex-wrap items-center justify-start gap-10">
	<Select
		labelPosition="right"
		id="select1"
		labelText="Select Example 1"
		options={[
			{ value: 'apple', key: 'Apple', disabled: false },
			{ value: 'banana', key: 'Banana', disabled: true },
			{ value: 'cherry', key: 'Cherry' }
		]}
		bind:value={selectValue}
		size="lg"
		class="w-64"
	/>

	<Select
		labelPosition="left"
		id="select2"
		labelText="Select Example 2"
		bind:value={selectValue}
		size="lg"
		class="w-64"
	>
		{#each [{ value: 'apple', key: 'Apple', disabled: false }, { value: 'banana', key: 'Banana', disabled: true }, { value: 'cherry', key: 'Cherry' }] as option (option)}
			<option value={option.value} disabled={option.disabled}>{option.key}</option>
		{/each}
	</Select>

	<Select
		labelPosition="top"
		id="select3"
		labelText="Select Example 3"
		options={[
			{ value: 'apple', key: 'Apple', disabled: false },
			{ value: 'banana', key: 'Banana', disabled: true },
			{ value: 'cherry', key: 'Cherry' }
		]}
		bind:value={selectValue}
		size="lg"
		class="w-64"
	/>

	<Select
		labelPosition="bottom"
		id="select4"
		labelText="Select Example 4"
		options={[
			{ value: 'apple', key: 'Apple', disabled: false },
			{ value: 'banana', key: 'Banana', disabled: true },
			{ value: 'cherry', key: 'Cherry' }
		]}
		bind:value={selectValue}
		size="lg"
		class="w-64"
	/>
</div>

<hr />

<div class="flex flex-col gap-6 p-4">
	<p class="font-medium">Segmented Control — pill variant (icon segmented, single select)</p>

	<div class="flex flex-row flex-wrap items-start gap-10">
		<SegmentedControl
			id="discount-mode"
			labelText="How the discount applies"
			bind:value={discountMode}
			onchange={(v) => console.log('Discount mode:', v)}
			options={[
				{ value: 'automatic', key: 'Automatic', icon: 'icon-[ion--flash]' },
				{ value: 'coupon', key: 'Coupon code', icon: 'icon-[ion--pricetag]' }
			]}
		/>

		<SegmentedControl
			id="order-scope"
			labelText="Which orders qualify"
			bind:value={orderScope}
			options={[
				{ value: 'any', key: 'Any order', icon: 'icon-[ion--bag-handle]' },
				{ value: 'first', key: 'First order', icon: 'icon-[ion--ribbon]' }
			]}
		/>
	</div>

	<p class="text-sm text-neutral-600">Selected: {discountMode} / {orderScope}</p>

	<p class="font-medium">Solid variant (filled selection, no layout shift on toggle)</p>

	<div class="flex flex-row flex-wrap items-start gap-10">
		<SegmentedControl
			id="discount-mode-solid"
			variant="solid"
			labelText="How the discount applies"
			bind:value={discountMode}
			options={[
				{ value: 'automatic', key: 'Automatic' },
				{ value: 'coupon', key: 'Coupon code' }
			]}
		/>

		<SegmentedControl
			id="order-scope-solid"
			variant="solid"
			labelText="Which orders qualify"
			bind:value={orderScope}
			options={[
				{ value: 'any', key: 'Any order' },
				{ value: 'first', key: 'First order only' }
			]}
		/>
	</div>

	<p class="font-medium">Fully custom colours / size / weight via class props</p>

	<div class="flex flex-row flex-wrap items-start gap-10">
		<SegmentedControl
			id="custom-pill"
			labelText="Custom pill"
			labelClass="text-base font-bold text-emerald-700"
			containerClass="bg-emerald-50 border-emerald-300"
			segmentClass="text-base [--qck-seg-fw:700]"
			selectedClass="bg-emerald-600 text-white font-bold shadow-none"
			unselectedClass="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900"
			value="weekly"
			options={[
				{ value: 'weekly', key: 'Weekly' },
				{ value: 'monthly', key: 'Monthly' }
			]}
		/>

		<SegmentedControl
			id="custom-solid"
			variant="solid"
			labelText="Custom solid"
			labelClass="text-base font-bold text-indigo-700"
			containerClass="border-indigo-300"
			segmentClass="text-base [--qck-seg-fw:700]"
			selectedClass="bg-indigo-600 text-white font-bold"
			unselectedClass="text-indigo-700 hover:bg-indigo-50"
			value="grid"
			options={[
				{ value: 'grid', key: 'Grid', icon: 'icon-[ion--grid]' },
				{ value: 'list', key: 'List', icon: 'icon-[ion--list]' }
			]}
			iconClass="text-current"
		/>
	</div>

	<p class="font-medium">Full width, sizes, disabled state &amp; no icons</p>

	<div class="flex max-w-md flex-col gap-4">
		<SegmentedControl
			id="segment-size"
			labelText="Size (full width)"
			fullWidth
			bind:value={segmentSize}
			options={[
				{ value: 'sm', key: 'Small' },
				{ value: 'md', key: 'Medium' },
				{ value: 'lg', key: 'Large' }
			]}
		/>

		<SegmentedControl
			id="plan"
			labelText="Plan ({segmentSize})"
			size={segmentSize}
			value="monthly"
			options={[
				{ value: 'monthly', key: 'Monthly', icon: 'icon-[ion--calendar]' },
				{ value: 'yearly', key: 'Yearly', icon: 'icon-[ion--calendar-number]' },
				{ value: 'lifetime', key: 'Lifetime', icon: 'icon-[ion--infinite]', disabled: true }
			]}
		/>

		<SegmentedControl
			id="status"
			labelText="Status (disabled)"
			disabled
			value="active"
			error="This field is locked while the order is processing."
			options={[
				{ value: 'active', key: 'Active' },
				{ value: 'paused', key: 'Paused' }
			]}
		/>
	</div>
</div>

<hr />

<div class="flex flex-col gap-6 p-4">
	<p class="font-medium">Choice Cards (icon + title + one-line explanation, single select)</p>

	<div class="flex flex-row flex-wrap items-start gap-10">
		<ChoiceCards
			id="card-discount-mode"
			labelText="How the discount applies"
			columns={2}
			rootClass="w-full sm:w-[28rem]"
			bind:value={cardDiscountMode}
			onchange={(v) => console.log('Card discount mode:', v)}
			options={[
				{
					value: 'automatic',
					title: 'Automatic',
					description: 'Applies on its own when the order qualifies.',
					icon: 'icon-[ion--flash]'
				},
				{
					value: 'coupon',
					title: 'Coupon code',
					description: 'Only applies when a matching code is entered.',
					icon: 'icon-[ion--pricetag]'
				}
			]}
		/>

		<ChoiceCards
			id="card-order-scope"
			labelText="Which orders qualify"
			columns={2}
			rootClass="w-full sm:w-[28rem]"
			bind:value={cardOrderScope}
			options={[
				{
					value: 'any',
					title: 'Any order',
					description: 'Every order can use this discount.',
					icon: 'icon-[ion--bag-handle]'
				},
				{
					value: 'first',
					title: 'First order only',
					description: "Only a customer's very first order.",
					icon: 'icon-[ion--ribbon]'
				}
			]}
		/>
	</div>

	<p class="text-sm text-neutral-600">Selected: {cardDiscountMode} / {cardOrderScope}</p>

	<p class="font-medium">More than two choices (responsive auto-fit grid)</p>

	<ChoiceCards
		id="card-delivery"
		labelText="Delivery speed"
		bind:value={cardDelivery}
		options={[
			{
				value: 'standard',
				title: 'Standard',
				description: '3–5 business days, no extra cost.',
				icon: 'icon-[ion--cube]'
			},
			{
				value: 'express',
				title: 'Express',
				description: 'Next business day, flat fee.',
				icon: 'icon-[ion--rocket]'
			},
			{
				value: 'pickup',
				title: 'Store pickup',
				description: 'Ready in 2 hours at your store.',
				icon: 'icon-[ion--storefront]'
			},
			{
				value: 'courier',
				title: 'Same-day courier',
				description: 'Within 4 hours in select cities.',
				icon: 'icon-[ion--bicycle]'
			},
			{
				value: 'freight',
				title: 'Freight',
				description: 'For bulky orders. Quoted per item.',
				icon: 'icon-[ion--boat]',
				disabled: true
			}
		]}
	/>
</div>

<hr />

<div class="flex flex-col gap-6 p-4">
	<p class="font-medium">Inline Sentence (settings as editable prose — tap the gold word)</p>

	<div class="flex flex-row flex-wrap items-start gap-10">
		<InlineSentence
			id="sentence-discount-mode"
			labelText="How the discount applies"
			rootClass="w-full sm:w-[26rem]"
			bind:value={sentenceMode}
			onchange={(v) => console.log('Sentence mode:', v)}
			options={[
				{
					value: 'automatic',
					label: 'automatic',
					icon: 'icon-[ion--flash]',
					prefix: 'This discount is',
					suffix: '— it applies on its own the moment an order qualifies.'
				},
				{
					value: 'coupon',
					label: 'a coupon code',
					icon: 'icon-[ion--pricetag]',
					prefix: 'This discount needs',
					suffix: '— it only applies when a matching code is entered.'
				}
			]}
		/>

		<InlineSentence
			id="sentence-order-scope"
			labelText="Which orders qualify"
			rootClass="w-full sm:w-[26rem]"
			bind:value={sentenceScope}
			options={[
				{
					value: 'any',
					label: 'any order',
					icon: 'icon-[ion--bag-handle]',
					prefix: 'Eligible for',
					suffix: '— every order can use this discount.'
				},
				{
					value: 'first',
					label: 'the first order only',
					icon: 'icon-[ion--ribbon]',
					prefix: 'Eligible for',
					suffix: "— a customer's very first order, nothing after."
				}
			]}
		/>
	</div>

	<p class="text-sm text-neutral-600">Selected: {sentenceMode} / {sentenceScope}</p>

	<p class="font-medium">
		Shared start/end text &amp; icon via component-level props (only the word flips)
	</p>

	<InlineSentence
		id="sentence-billing"
		labelText="Billing cycle"
		rootClass="w-full sm:w-[26rem]"
		prefix="Bill customers"
		suffix="and renew the plan automatically."
		icon="icon-[ion--card]"
		iconClass="text-current"
		bind:value={sentenceBilling}
		options={[
			{ value: 'monthly', label: 'every month' },
			{ value: 'yearly', label: 'once a year' },
			{ value: 'weekly', label: 'every week', icon: 'icon-[ion--time]' }
		]}
	/>

	<p class="text-sm text-neutral-600">Selected: {sentenceBilling}</p>
</div>

<hr />

<div class="flex flex-col gap-6 p-4">
	<p class="font-medium">
		Icon Tile (multi-select group covering both the vertical-tile and horizontal-row looks, mobile
		responsive and wraps)
	</p>

	<div class="flex flex-row flex-wrap items-start gap-10">
		<IconTile
			id="icon-tile-vertical"
			labelText="Vertical tiles (iconPosition top, bare icon)"
			iconPosition="top"
			iconBadge={false}
			bind:value={iconTileVertical}
			options={[
				{ value: 'pickup', label: 'Pickup', icon: 'icon-[ion--bag-handle]' },
				{ value: 'delivery', label: 'Delivery', icon: 'icon-[ion--bicycle]' },
				{ value: 'dining', label: 'Dining', icon: 'icon-[ion--restaurant]' },
				{ value: 'shipping', label: 'Shipping', icon: 'icon-[ion--cube]' },
				{ value: 'retail', label: 'Retail', icon: 'icon-[ion--storefront]' }
			]}
		/>

		<IconTile
			id="icon-tile-horizontal"
			labelText="Horizontal rows (iconPosition left, icon badge)"
			iconPosition="left"
			bind:value={iconTileHorizontal}
			options={[
				{ value: 'pickup', label: 'Pickup', icon: 'icon-[ion--bag-handle]' },
				{ value: 'delivery', label: 'Delivery', icon: 'icon-[ion--bicycle]' },
				{ value: 'dining', label: 'Dining', icon: 'icon-[ion--restaurant]' },
				{ value: 'shipping', label: 'Shipping', icon: 'icon-[ion--cube]' },
				{ value: 'retail', label: 'Retail', icon: 'icon-[ion--storefront]' }
			]}
		/>
	</div>

	<p class="text-sm text-neutral-600">Selected: {JSON.stringify(iconTileVertical)}</p>
	<p class="text-sm text-neutral-600">Selected: {JSON.stringify(iconTileHorizontal)}</p>

	<p class="font-medium">Custom selected icon and large size</p>

	<IconTile
		id="icon-tile-custom"
		labelText="Star badge, large tiles"
		size="lg"
		selectedIcon="icon-[ion--star]"
		bind:value={iconTileCustom}
		options={[
			{ value: 'pickup', label: 'Pickup', icon: 'icon-[ion--bag-handle]' },
			{ value: 'delivery', label: 'Delivery', icon: 'icon-[ion--bicycle]' },
			{ value: 'dining', label: 'Dining', icon: 'icon-[ion--restaurant]' },
			{ value: 'shipping', label: 'Shipping', icon: 'icon-[ion--cube]' },
			{ value: 'retail', label: 'Retail', icon: 'icon-[ion--storefront]' }
		]}
	/>

	<p class="text-sm text-neutral-600">Selected: {JSON.stringify(iconTileCustom)}</p>

	<p class="font-medium">Error and disabled states</p>

	<IconTile
		id="icon-tile-error"
		labelText="Pick at least one order type"
		error="Please select at least one order type."
		bind:value={iconTileError}
		options={[
			{ value: 'pickup', label: 'Pickup', icon: 'icon-[ion--bag-handle]' },
			{ value: 'delivery', label: 'Delivery', icon: 'icon-[ion--bicycle]' },
			{ value: 'dining', label: 'Dining', icon: 'icon-[ion--restaurant]' },
			{ value: 'shipping', label: 'Shipping', icon: 'icon-[ion--cube]' },
			{ value: 'retail', label: 'Retail', icon: 'icon-[ion--storefront]' }
		]}
	/>

	<p class="text-sm text-neutral-600">Selected: {JSON.stringify(iconTileError)}</p>

	<IconTile
		id="icon-tile-disabled"
		labelText="Disabled group"
		disabled={true}
		bind:value={iconTileDisabled}
		options={[
			{ value: 'pickup', label: 'Pickup', icon: 'icon-[ion--bag-handle]' },
			{ value: 'delivery', label: 'Delivery', icon: 'icon-[ion--bicycle]' },
			{ value: 'dining', label: 'Dining', icon: 'icon-[ion--restaurant]' },
			{ value: 'shipping', label: 'Shipping', icon: 'icon-[ion--cube]' },
			{ value: 'retail', label: 'Retail', icon: 'icon-[ion--storefront]' }
		]}
	/>

	<p class="text-sm text-neutral-600">Selected: {JSON.stringify(iconTileDisabled)}</p>
</div>

<hr />

<div class="flex flex-col gap-6 p-4">
	<div class="flex flex-col gap-2">
		<p class="font-medium">Default wrap behaviour</p>
		<p class="text-sm text-neutral-600">
			Narrow the window to watch the bar wrap into a connected grid on mobile.
		</p>
		<SegmentedToolbar
			id="seg-toolbar-wrap"
			labelText="Order types"
			bind:value={segToolbarWrap}
			options={[
				{ value: 'pickup', label: 'Pickup', icon: 'icon-[ion--bag-handle]' },
				{ value: 'delivery', label: 'Delivery', icon: 'icon-[ion--bicycle]' },
				{ value: 'dining', label: 'Dining', icon: 'icon-[ion--restaurant]' },
				{ value: 'shipping', label: 'Shipping', icon: 'icon-[ion--cube]' },
				{ value: 'retail', label: 'Retail', icon: 'icon-[ion--storefront]' }
			]}
		/>
		<p class="text-sm text-neutral-600">Selected: {JSON.stringify(segToolbarWrap)}</p>
	</div>

	<div class="flex flex-col gap-2">
		<p class="font-medium">Inline row (wrap=false)</p>
		<SegmentedToolbar
			id="seg-toolbar-inline"
			labelText="Order types"
			wrap={false}
			bind:value={segToolbarInline}
			options={[
				{ value: 'pickup', label: 'Pickup', icon: 'icon-[ion--bag-handle]' },
				{ value: 'delivery', label: 'Delivery', icon: 'icon-[ion--bicycle]' },
				{ value: 'dining', label: 'Dining', icon: 'icon-[ion--restaurant]' },
				{ value: 'shipping', label: 'Shipping', icon: 'icon-[ion--cube]' },
				{ value: 'retail', label: 'Retail', icon: 'icon-[ion--storefront]' }
			]}
		/>
		<p class="text-sm text-neutral-600">Selected: {JSON.stringify(segToolbarInline)}</p>
	</div>

	<div class="flex flex-col gap-2">
		<p class="font-medium">Large size (size=lg)</p>
		<SegmentedToolbar
			id="seg-toolbar-size"
			labelText="Order types"
			size="lg"
			bind:value={segToolbarSize}
			options={[
				{ value: 'pickup', label: 'Pickup', icon: 'icon-[ion--bag-handle]' },
				{ value: 'delivery', label: 'Delivery', icon: 'icon-[ion--bicycle]' },
				{ value: 'dining', label: 'Dining', icon: 'icon-[ion--restaurant]' },
				{ value: 'shipping', label: 'Shipping', icon: 'icon-[ion--cube]' },
				{ value: 'retail', label: 'Retail', icon: 'icon-[ion--storefront]' }
			]}
		/>
		<p class="text-sm text-neutral-600">Selected: {JSON.stringify(segToolbarSize)}</p>
	</div>

	<div class="flex flex-col gap-2">
		<p class="font-medium">Disabled with error</p>
		<SegmentedToolbar
			id="seg-toolbar-disabled"
			labelText="Order types"
			disabled
			error="Select at least one order type."
			bind:value={segToolbarDisabled}
			options={[
				{ value: 'pickup', label: 'Pickup', icon: 'icon-[ion--bag-handle]' },
				{ value: 'delivery', label: 'Delivery', icon: 'icon-[ion--bicycle]' },
				{ value: 'dining', label: 'Dining', icon: 'icon-[ion--restaurant]' },
				{ value: 'shipping', label: 'Shipping', icon: 'icon-[ion--cube]' },
				{ value: 'retail', label: 'Retail', icon: 'icon-[ion--storefront]' }
			]}
		/>
		<p class="text-sm text-neutral-600">Selected: {JSON.stringify(segToolbarDisabled)}</p>
	</div>
</div>

<hr />

<div class="flex flex-col gap-6 p-4">
	<p class="font-medium">ToggleList</p>

	<div class="flex flex-row flex-wrap gap-10">
		<div class="flex max-w-sm flex-col gap-2">
			<p class="font-medium">Default size, with descriptions</p>
			<ToggleList
				id="toggle-list-default"
				labelText="Order types"
				bind:value={toggleListDefault}
				options={[
					{
						value: 'pickup',
						title: 'Pickup',
						description: 'Customer collects in store.',
						icon: 'icon-[ion--bag-handle]'
					},
					{
						value: 'delivery',
						title: 'Delivery',
						description: 'Couriered to the customer.',
						icon: 'icon-[ion--bicycle]'
					},
					{
						value: 'dining',
						title: 'Dining',
						description: 'Eaten in at a table.',
						icon: 'icon-[ion--restaurant]'
					},
					{
						value: 'shipping',
						title: 'Shipping',
						description: 'Posted via a carrier.',
						icon: 'icon-[ion--cube]'
					},
					{
						value: 'retail',
						title: 'Retail',
						description: 'Over-the-counter sale.',
						icon: 'icon-[ion--storefront]'
					}
				]}
			/>
			<p class="text-sm text-neutral-600">Selected: {JSON.stringify(toggleListDefault)}</p>
		</div>

		<div class="flex max-w-xs flex-col gap-2">
			<p class="font-medium">Compact (size="sm"), no descriptions</p>
			<ToggleList
				id="toggle-list-compact"
				labelText="Order types"
				size="sm"
				bind:value={toggleListCompact}
				options={[
					{ value: 'pickup', title: 'Pickup', icon: 'icon-[ion--bag-handle]' },
					{ value: 'delivery', title: 'Delivery', icon: 'icon-[ion--bicycle]' },
					{ value: 'dining', title: 'Dining', icon: 'icon-[ion--restaurant]' },
					{ value: 'shipping', title: 'Shipping', icon: 'icon-[ion--cube]' },
					{ value: 'retail', title: 'Retail', icon: 'icon-[ion--storefront]' }
				]}
			/>
			<p class="text-sm text-neutral-600">Selected: {JSON.stringify(toggleListCompact)}</p>
		</div>
	</div>

	<div class="flex max-w-sm flex-col gap-2">
		<p class="font-medium">With error message and a disabled row</p>
		<ToggleList
			id="toggle-list-error"
			labelText="Order types"
			bind:value={toggleListError}
			options={[
				{
					value: 'pickup',
					title: 'Pickup',
					description: 'Customer collects in store.',
					icon: 'icon-[ion--bag-handle]'
				},
				{
					value: 'delivery',
					title: 'Delivery',
					description: 'Couriered to the customer.',
					icon: 'icon-[ion--bicycle]'
				},
				{
					value: 'dining',
					title: 'Dining',
					description: 'Eaten in at a table.',
					icon: 'icon-[ion--restaurant]'
				},
				{
					value: 'shipping',
					title: 'Shipping',
					description: 'Posted via a carrier.',
					icon: 'icon-[ion--cube]',
					disabled: true
				},
				{
					value: 'retail',
					title: 'Retail',
					description: 'Over-the-counter sale.',
					icon: 'icon-[ion--storefront]'
				}
			]}
			error="Select at least one order type."
		/>
		<p class="text-sm text-neutral-600">Selected: {JSON.stringify(toggleListError)}</p>
	</div>
</div>

<hr />

<div class="flex flex-col gap-6 p-4">
	<p class="font-medium">Master Checklist (select-all header, indeterminate state, live count)</p>

	<div class="flex flex-row flex-wrap items-start gap-10">
		<MasterChecklist
			id="master-checklist-order-types"
			labelText="Order types"
			masterLabel="All order types"
			showCount={true}
			rootClass="max-w-md flex-1"
			bind:value={masterChecklistOrderTypes}
			options={[
				{
					value: 'pickup',
					title: 'Pickup',
					description: 'Customer collects in store.',
					icon: 'icon-[ion--bag-handle]'
				},
				{
					value: 'delivery',
					title: 'Delivery',
					description: 'Couriered to the customer.',
					icon: 'icon-[ion--bicycle]'
				},
				{
					value: 'dining',
					title: 'Dining',
					description: 'Eaten in at a table.',
					icon: 'icon-[ion--restaurant]'
				},
				{
					value: 'shipping',
					title: 'Shipping',
					description: 'Posted via a carrier.',
					icon: 'icon-[ion--cube]'
				},
				{
					value: 'retail',
					title: 'Retail',
					description: 'Over-the-counter sale.',
					icon: 'icon-[ion--storefront]'
				}
			]}
		/>

		<MasterChecklist
			id="master-checklist-custom-icon"
			labelText="Custom tick icon, no count badge"
			masterLabel="Select every type"
			selectedIcon="icon-[ion--checkmark-circle]"
			showCount={false}
			rootClass="max-w-md flex-1"
			bind:value={masterChecklistCustomIcon}
			options={[
				{
					value: 'pickup',
					title: 'Pickup',
					description: 'Customer collects in store.',
					icon: 'icon-[ion--bag-handle]'
				},
				{
					value: 'delivery',
					title: 'Delivery',
					description: 'Couriered to the customer.',
					icon: 'icon-[ion--bicycle]'
				},
				{
					value: 'dining',
					title: 'Dining',
					description: 'Eaten in at a table.',
					icon: 'icon-[ion--restaurant]'
				},
				{
					value: 'shipping',
					title: 'Shipping',
					description: 'Posted via a carrier.',
					icon: 'icon-[ion--cube]'
				},
				{
					value: 'retail',
					title: 'Retail',
					description: 'Over-the-counter sale.',
					icon: 'icon-[ion--storefront]'
				}
			]}
		/>
	</div>

	<p class="text-sm text-neutral-600">
		Selected: {JSON.stringify(masterChecklistOrderTypes)} / {JSON.stringify(
			masterChecklistCustomIcon
		)}
	</p>

	<p class="font-medium">With an error message</p>

	<MasterChecklist
		id="master-checklist-error"
		labelText="Order types (at least two required)"
		masterLabel="All order types"
		error="Please select at least two order types."
		rootClass="max-w-md"
		bind:value={masterChecklistError}
		options={[
			{
				value: 'pickup',
				title: 'Pickup',
				description: 'Customer collects in store.',
				icon: 'icon-[ion--bag-handle]'
			},
			{
				value: 'delivery',
				title: 'Delivery',
				description: 'Couriered to the customer.',
				icon: 'icon-[ion--bicycle]'
			},
			{
				value: 'dining',
				title: 'Dining',
				description: 'Eaten in at a table.',
				icon: 'icon-[ion--restaurant]'
			},
			{
				value: 'shipping',
				title: 'Shipping',
				description: 'Posted via a carrier.',
				icon: 'icon-[ion--cube]'
			},
			{
				value: 'retail',
				title: 'Retail',
				description: 'Over-the-counter sale.',
				icon: 'icon-[ion--storefront]'
			}
		]}
	/>

	<p class="text-sm text-neutral-600">Selected: {JSON.stringify(masterChecklistError)}</p>
</div>

<hr />

<TextArea
	id="textArea1"
	labelText="Text Area Example"
	placeholder="Enter your text here..."
	minlength={10}
	maxlength={15}
	class="w-64 resize-none"
	size="lg"
/>
<TextArea
	id="textArea2"
	labelText="Text Area 2"
	placeholder="Enter your text here..."
	minlength={10}
	maxlength={15}
	class="w-64 resize-none"
	size="md"
	disabled={true}
/>

<div class="ring-primary-500 flex flex-col items-start justify-start gap-10 ring">
	<ul
		use:dragDropZone={{ items, getItemId: itemId('id'), axis: 'y' }}
		onconsider={sync}
		onfinalize={sync}
	>
		{#each items as item (item.id)}
			<li><button data-dnd-handle aria-label="Drag item">::</button>{item.label}</li>
		{/each}
	</ul>

	<div
		class="flex max-w-full flex-row gap-2 overflow-x-auto p-2 ring"
		use:dragDropZone={{ items, getItemId: itemId('id'), axis: 'x', constrainToContainer: true }}
		onconsider={sync}
		onfinalize={sync}
	>
		{#each items as item (item.id)}
			<div
				animate:flip={{ duration: 180 }}
				data-item-id={item.id}
				class="size-20 shrink-0 {item.color} cursor-pointer"
				data-dnd-handle
				aria-label="Drag item"
			>
				{item.label}
			</div>
		{/each}
	</div>

	<DragDropProviderSmart
		items={todo}
		zoneId="todo"
		group="board"
		getItemId={(item) => item.id}
		ontransfer={({ items }) => {
			todo = items;
		}}
	>
		{#snippet children({ items })}
			{#each items as item (item.id)}
				<div>
					<button data-dnd-handle>::</button>
					{item.title}
				</div>
			{/each}
		{/snippet}
	</DragDropProviderSmart>

	<DragDropProviderSmart
		items={done}
		zoneId="done"
		group="board"
		getItemId={(item) => item.id}
		onreceive={({ items }) => {
			done = items;
		}}
	>
		{#snippet children({ items })}
			{#each items as item (item.id)}
				<div><button data-dnd-handle>::</button>{item.title}</div>
			{/each}
		{/snippet}
	</DragDropProviderSmart>
</div>
