import type { Recipe } from '$lib/types';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

interface RawMeal {
	idMeal: string;
	strMeal: string;
	strMealThumb: string;
	strCategory?: string;
	strArea?: string;
	strInstructions?: string;
	strTags?: string | null;
	strYoutube?: string;
	strSource?: string;
	[key: string]: string | null | undefined;
}

function mapMeal(raw: RawMeal): Recipe {
	const ingredients: { name: string; measure: string }[] = [];
	const seen = new Set<string>();
	for (let i = 1; i <= 20; i++) {
		const name = raw[`strIngredient${i}`];
		const measure = raw[`strMeasure${i}`];
		if (name && name.trim()) {
			const ingredientName = name.trim();

			if (!seen.has(ingredientName)) {
				seen.add(ingredientName);
				ingredients.push({
					name: ingredientName,
					measure: (measure ?? '').trim()
				});
			}
		}
	}

	return {
		id: raw.idMeal,
		title: raw.strMeal,
		image: raw.strMealThumb,
		category: raw.strCategory ?? '',
		area: raw.strArea ?? '',
		instructions: raw.strInstructions ?? '',
		ingredients,
		tags: raw.strTags
			? raw.strTags
					.split(',')
					.map((t) => t.trim())
					.filter(Boolean)
			: [],
		youtube: raw.strYoutube || undefined,
		source: raw.strSource || undefined,
		userCreated: false
	};
}

async function fetchJson<T>(url: string): Promise<T> {
	const res = await fetch(url);

	if (!res.ok) {
		throw new Error(`Request to ${url} failed with status ${res.status}`);
	}

	return res.json() as Promise<T>;
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
	const q = query.trim();
	const url = `${BASE_URL}/search.php?s=${encodeURIComponent(q || '')}`;
	const data = await fetchJson<{ meals: RawMeal[] | null }>(url);
	return (data.meals ?? []).map(mapMeal);
}

export async function filterByCategory(category: string): Promise<Recipe[]> {
	const data = await fetchJson<{
		meals: { idMeal: string; strMeal: string; strMealThumb: string }[] | null;
	}>(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);

	return (data.meals ?? []).map((m) => ({
		id: m.idMeal,
		title: m.strMeal,
		image: m.strMealThumb,
		category,
		area: '',
		instructions: '',
		ingredients: [],
		tags: [],
		userCreated: false
	}));
}


export async function filterByArea(area: string): Promise<Recipe[]> {
	const data = await fetchJson<{
		meals: { idMeal: string; strMeal: string; strMealThumb: string }[] | null;
	}>(`${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);

	return (data.meals ?? []).map((m) => ({
		id: m.idMeal,
		title: m.strMeal,
		image: m.strMealThumb,
		category: '',
		area,
		instructions: '',
		ingredients: [],
		tags: [],
		userCreated: false
	}));
}

export async function getRecipeById(id:string): Promise<Recipe | null> {
	const data = await fetchJson<{meals: RawMeal[] | null}>(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`);
	const meal = data.meals?.[0];
	return meal ? mapMeal(meal) : null;
}

export async function getCategories(): Promise<string[]> {
	const data = await fetchJson<{meals: {strCategory: string}[]}>(`${BASE_URL}/list.php?c=list`);
	return data.meals.map((m) => m.strCategory);	
}

export async function getAreas(): Promise<string[]> {
	const data = await fetchJson<{meals: {strArea: string}[]}>(`${BASE_URL}/list.php?a=list`);
	return [...new Set(data.meals.map((m) => m.strArea))];	
}