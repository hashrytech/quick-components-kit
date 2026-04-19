/**
 * Toast system for displaying ephemeral notifications.
 *
 * ## Setup
 * 1. Configure icons and options once at app startup by mutating `toastOptions`.
 * 2. Place a `ToastContainer` in your root layout.
 * 3. Call `showToast` / `successToast` / `failToast` etc. from anywhere.
 *
 * @example
 * ```ts
 * // app startup (e.g. +layout.ts or a config file)
 * import { toastOptions, toastIcons } from '$lib/components/toast';
 * toastIcons.success = 'i-ph-check-circle';
 * toastIcons.error   = 'i-ph-x-circle';
 * toastOptions.closeButtonIcon = 'i-ph-x';
 * toastOptions.removalTimeout  = 5000;
 * ```
 *
 * @example
 * ```ts
 * import { successToast, failToast, infoToast } from '$lib/components/toast';
 * successToast('Saved!', 'Your changes were saved.');
 * failToast('Error', 'Something went wrong.');
 * infoToast('Note', 'This is informational.');
 * ```
 */
import { mount, unmount } from 'svelte';
import type { ToastType } from "./Toast.svelte";
import Toast from "./Toast.svelte";
import { elasticInOut } from 'svelte/easing';

export type ToastOptions = {
  icons: Record<ToastType, string>;
  classes: Record<string, string>;
  colours: Record<ToastType, string>;
  closeButtonIcon: string;
  transitionDelay: number, 
  transitionDuration: number, 
  transitionY: number, 
  transitionEasing: (t: number) => number,
  removalTimeout: number
  autoRemove: boolean
};

export const closeButtonIcon: string[] = [];

/* Tailwind classes for different toast types */
export const toastTypeClasses : Record<ToastType, string> = {
    info: "ring-sky-500 border-sky-500 bg-sky-50",
    success: "ring-green-500 border-green-500 bg-green-50",
    warning: "ring-yellow-500 border-yellow-500 bg-yellow-50",
    error: "ring-red-500 border-red-500 bg-red-50",
    debug: "ring-neutral-500 border-neutral-500 bg-neutral-50",
};

/* Tailwind icon colour classes for different toast types */
export const toastTypeIconColours : Record<ToastType, string> = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
    debug: "text-neutral-500",
};

/*
 * Icons for different toast types.
 * Set these values from the consuming app to the icon classes you want to use.
 */
export const toastIcons : Record<ToastType, string> = {
    info: "",
    success: "",
    warning: "",
    error: "",
    debug: "",
};

export const toastOptions: ToastOptions = {
    icons: toastIcons,    
    classes: toastTypeClasses,
    colours: toastTypeIconColours,
    closeButtonIcon: "",
    transitionDelay: 0, 
    transitionDuration: 200, 
    transitionY: -100, 
    transitionEasing: elasticInOut,
    removalTimeout: 8000,
    autoRemove: true
}

/**
 * Mount a `Toast` into the target container element.
 *
 * @param type - Visual variant: `'success' | 'info' | 'warning' | 'error' | 'debug'`.
 * @param message - Primary message text (plain text, not HTML).
 * @param subMessage - Optional secondary line.
 * @param target - DOM element to mount into. Defaults to `#toast_area`.
 */
export function showToast(type: ToastType, message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    if (target !== null) {
        const delToast = () => { unmount(toast, { outro: true }); };
        const toast: Toast = mount(Toast, {target: target, props: { toastType: type, message: message, subMessage: subMessage, delToast: delToast }});
    }
}

/** Show a success toast. @see showToast */
export function successToast(message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    showToast('success', message, subMessage, target);
}

/** Show an error toast. @see showToast */
export function failToast(message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    showToast('error', message, subMessage, target);
}

/** Show an info toast. @see showToast */
export function infoToast(message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    showToast('info', message, subMessage, target);
}

/** Show a warning toast. @see showToast */
export function warningToast(message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    showToast('warning', message, subMessage, target);
}

/** Show a debug toast. @see showToast */
export function debugToast(message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    showToast('debug', message, subMessage, target);
}
