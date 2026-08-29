import { derived } from 'svelte/store';
import { persisted } from './persisted';

export const favoriteIds = persisted<string[]>('rfmp:favorites', []);

export const isFavorite = (id: string) => derived(favoriteIds, ($ids) => $ids.includes(id));

export function toggleFavorite(id: string, shouldBeFavorite?: boolean) {
	favoriteIds.update((ids) => {
		const isFavorite = ids.includes(id);
		const markFavorite = shouldBeFavorite ?? !isFavorite;
		if (markFavorite && !isFavorite) {
			return [...ids, id];
		}
		if (!markFavorite && isFavorite) {
			return ids.filter((value) => value !== id);
		}

		return ids;
	});
}
