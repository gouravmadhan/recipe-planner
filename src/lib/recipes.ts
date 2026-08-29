import { get } from 'svelte/store';
import { userRecipes } from '$lib/store/userRecipes';
import { getRecipeById as getMealDbRecipeById } from '$lib/api/themealdb';
import type { Recipe } from './types';

export async function resolveRecipe(id: string): Promise<Recipe | null> {
	const local = get(userRecipes).find((r) => r.id === id);
	if (local) {
		return local;
	}
	if (id.startsWith('user-')) {
		return null;
	}
	return getMealDbRecipeById(id);
}

export function searchUserRecipes(query: string): Recipe[] {
	const q = query.trim().toLowerCase();
	const all = get(userRecipes);
	if (!q) {
		return all;
	}
	return all.filter(
		(r) =>
			r.title.toLowerCase().includes(q) ||
			r.category.toLowerCase().includes(q) ||
			r.area.toLowerCase().includes(q)
	);
}
