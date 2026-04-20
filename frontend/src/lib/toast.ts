import { writable } from "svelte/store";

export const toastMessage = writable<string>('');

let timer: ReturnType<typeof setTimeout> | null = null;

export function showToast(msg: string) {
    toastMessage.set(msg);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        toastMessage.set('');
        timer = null;
    }, 3000);
}