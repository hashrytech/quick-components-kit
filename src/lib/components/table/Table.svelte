<!--
@component Table

A fully responsive, themeable table component for Svelte 5 built with Tailwind CSS.  
Supports both desktop and mobile rendering, multi-select checkboxes, and custom component rendering via `Snippet`.

## Generic
- `<Table<T>>` — You must pass a `rows` array of type `T[]` and a `getKey(row: T) => string` function.

## Props

- `rows: T[]`  
  Required. Array of data rows to render.

- `getKey: (row: T) => string`  
  Required. Function to return a unique key for each row.

- `showMultiSelect?: boolean = false`  
  If true, displays a checkbox for selecting rows.

- `selected?: string[]`  
  A list of selected row keys (bindable).

- `headings?: Snippet`  
  Custom markup or Svelte block for rendering the `<thead>` row.

- `tableRow?: Snippet<[T]>`  
  Custom markup or Svelte block for rendering each row in desktop view.

- `tableRowMobile?: Snippet<[T]>`  
  Optional. Enables mobile view by rendering one `<td>` with stacked content.

- `multiSelectTh?: Snippet`  
  Custom markup for the multi-select checkbox `<th>`.

- `multiSelectTd?: Snippet<[T]>`
  Custom markup for the multi-select checkbox `<td>` in desktop view.

- `class?: ClassNameValue`  
  Tailwind classes to apply to the `<table>` element.

- `outerDivClass?: ClassNameValue`  
  Tailwind classes for the outer scroll wrapper `<div>`.

- `headingsRowClass?: ClassNameValue`  
  Tailwind classes for the table heading `<tr>`.

- `multiSelectThClass?: Snippet`  
  Tailwind classes for the multi-select checkbox `<th>`.

- `multiSelectTdClass?: Snippet<[T]>`  
  Tailwind classes for the multi-select checkbox `<td>` in desktop view.

- `tableRowClass?: ClassNameValue`  
  Tailwind classes for each row in desktop view.

- `tableRowMobileClass?: ClassNameValue`  
  Tailwind classes for each mobile row.

- `tableMobileTdClass?: ClassNameValue`  
  Tailwind classes for the mobile row's single `<td>` cell.

- `checkboxClass?: ClassNameValue`
  Tailwind classes for the multi-select checkbox.

## Features

- Multi-select checkboxes with "select all" support
- Dual rendering paths for desktop and mobile (controlled by `tableRowMobile`)
- Sticky selection column (`left-0`)
- Class merging via `tailwind-merge` to avoid duplicate styles
- Fully customizable using Svelte `Snippet` syntax

## Example Usage

```svelte
<Table rows={[ { id: 1, name: "John Doe", age: 30 }, { id: 2, name: "Jane Smith", age: 25 }, { id: 3, name: "Alice Johnson", age: 28 }]} getKey={(u) => u.id.toString()} showMultiSelect={true}>
    {#snippet headings()}
    <TableTd>ID</TableTd>
    <TableTd>Name</TableTd>
    <TableTd>Age</TableTd>        
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
```
-->
  
<script lang="ts" module>
    import type { Snippet } from 'svelte';
    import type { ClassNameValue } from 'tailwind-merge';    

    /**
     * Props for the generic Table component
     * @template T - Type of each row object
     */
    export type TableProps<T> = {
        /** Enable multi-select checkboxes */
        showMultiSelect?: boolean;

        /** Currently selected row keys */
        selected?: string[];

        /** Data to render as rows */
        rows: T[];

        /** Function to extract a unique key for each row */
        getKey: (obj: T) => string;

        /** Snippet for rendering table headings */
        headings?: Snippet;

        /** Snippet for rendering a desktop table row */
        tableRow?: Snippet<[T]>;

        /** Snippet for rendering a mobile table row */
        tableRowMobile?: Snippet<[T]>;

        /** Snippet for the multi-select checkbox area which should be a TH */
        multiSelectTh?: Snippet;

        /** Snippet for the multi-select checkbox area which should be a TD */
        multiSelectTd?: Snippet<[T]>;

        /** Class for the <table> element */
        class?: ClassNameValue;

        /** Class for the outer <div> wrapper */
        outerDivClass?: ClassNameValue;

        /** Class for the table headings row */
        headingsRowClass?: ClassNameValue;

        /** Class for the multi-select checkbox <th> */
        multiSelectThClass?: ClassNameValue;

        /** Class for each row (desktop) */
        tableRowClass?: ClassNameValue;

        /** Class for the multi-select checkbox <td> */
        multiSelectTdClass?: ClassNameValue;

        /** Class for each row (mobile) */
        tableRowMobileClass?: ClassNameValue;

        /** Class for the <td> cell in mobile view */
        tableMobileTdClass?: ClassNameValue;
        
        /** Class for the multi-select checkbox */
        checkboxClass?: ClassNameValue;
        
    };
</script>

<script lang="ts" generics="T">
	import { twMerge } from "tailwind-merge";
  import {Checkbox} from '$lib/components/checkbox/index.js';

  let { showMultiSelect=$bindable(false), selected=$bindable([]), rows=$bindable([]), getKey, headings, tableRow, tableRowMobile, multiSelectTh, multiSelectTd,
    tableMobileTdClass, outerDivClass, headingsRowClass, multiSelectThClass, tableRowClass, multiSelectTdClass, tableRowMobileClass, checkboxClass, ...props }: TableProps<T> = $props();

  function addSelected(rowkey: string){
      if(selected.includes(rowkey)){
          selected = selected.filter((item) => item !== rowkey);
      }else{
          selected.push(rowkey);
      }
  }

  function handleSelectAll(event: any){
      if (event.target.checked) {
          for(let i = 0; i < rows.length; i++){
              selected.push(getKey(rows[i]));
          }
      }
      else{
          selected = [];
      }
  }

</script>


<div class={twMerge("rounded-lg border-primary-table-border w-full overflow-x-auto", tableRowMobile ? "border-0 md:border bg-transparent" : "border bg-white",  outerDivClass)}>
    <table class={twMerge("table-fixed w-full text-sm", tableRowMobile ? "border-separate border-spacing-y-2 md:border-collapse md:border-spacing-y-0": "", props.class)} cellpadding="10px">
        <thead class={twMerge("bg-primary-table-heading", tableRowMobile ? "hidden md:table-header-group" : "")}>
            <tr class={twMerge("text-xs text-primary-table-heading-text whitespace-nowrap bg-inherit", headingsRowClass)}>
                {#if showMultiSelect}
                {#if multiSelectTh}
                  {@render multiSelectTh()}
                {:else}
                <th class={twMerge("w-12 px-4 py-2 text-center bg-inherit", multiSelectThClass)}>
                    <Checkbox id="header-multiselect-checkbox" onchange={handleSelectAll} checked={ rows ? selected.length === rows.length: false} class={checkboxClass} />
                </th>
                {/if}
				        {/if}
                {@render headings?.()}
		    </tr>
        </thead>

        <tbody>
            {#each rows as row, index (getKey ? getKey(row) : index)}
            {@const rowKey = getKey(row)}
            {@const isSelected = selected.includes(rowKey)}
            
            {#if tableRow}
            <tr class={twMerge("group border-t border-primary-table-border text-primary-table-row-text", tableRowMobile ? "hidden md:table-row" : "", 
                tableRowClass, isSelected ? "bg-primary-table-row-selected" : "hover:bg-primary-table-row-hover bg-white")}>
                {#if showMultiSelect}
                  {#if multiSelectTd}
                  {@render multiSelectTd(row)}
                  {:else}
                  <td class={twMerge("text-center px-4 py-2 bg-inherit", multiSelectTdClass )}>
                      <Checkbox id={"checkbox-" + rowKey} value={rowKey} checked={isSelected} onchange={()=>{addSelected(rowKey)}} class={checkboxClass} />
                  </td>
                  {/if}
                {/if}
                {@render tableRow?.(row)}
            </tr>
            {/if}

            {#if tableRowMobile}
            <tr class={twMerge("md:hidden text-primary-table-row-text", isSelected ? "bg-primary-table-row-selected" : "bg-white", tableRowMobileClass)}>
                <td class={twMerge("border border-primary-table-border border-t-4 rounded-primary px-2 pb-2 relative bg-inherit", tableMobileTdClass)}>
                    {#if showMultiSelect}<button onclick={()=>{ addSelected(rowKey)}} aria-label="select row" class="absolute inset-0 cursor-pointer"></button>{/if}
                    {@render tableRowMobile?.(row)}
                </td>
            </tr>
            {/if}
            {/each}
		</tbody>
    </table>
</div>