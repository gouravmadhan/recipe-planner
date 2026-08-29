import { browser } from '$app/env';
import { writable, type Writable } from 'svelte/store';

export function persisted<T>(key: string, initial: T): Writable<T> {
	let startValue = initial;

	if (browser) {
		const stored = localStorage.getItem(key);
		if (stored) {
			try {
				startValue = JSON.parse(stored) as T;
			} catch {
				startValue = initial;
			}
		}
	}
	const store = writable<T>(startValue);

	if (browser) {
		store.subscribe((value) => {
			localStorage.setItem(key, JSON.stringify(value));
		});
	}

	return store;
}
