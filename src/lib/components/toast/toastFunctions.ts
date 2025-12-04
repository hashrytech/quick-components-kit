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

/* Icons for different toast types 
Globally available state variables for toast: 
toastIcons['info'] = "icon-[ion--information-circle]";
toastIcons['success'] = "icon-[ion--checkmark-circle]";
toastIcons['warning'] = "icon-[ion--warning]";
toastIcons['error'] = "icon-[ion--close-circle]";
toastIcons['debug'] = "icon-[ion--bug]";
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

export function showToast(type: ToastType, message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    if (target !== null) {
        const delToast = () => { unmount(toast, { outro: true }); };
        const toast: Toast = mount(Toast, {target: target, props: { toastType: type, message: message, subMessage: subMessage, delToast: delToast }});
    }
}

export function successToast(message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    showToast('success', message, subMessage, target);
}

export function failToast(message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    showToast('error', message, subMessage, target);
}

export function infoToast(message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    showToast('info', message, subMessage, target);
}

export function warningToast(message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    showToast('warning', message, subMessage, target);
}

export function debugToast(message: string, subMessage: string = "", target: Element | null = document.querySelector("#toast_area")) {
    showToast('debug', message, subMessage, target);
}
