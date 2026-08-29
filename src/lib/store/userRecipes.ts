import type { Recipe } from '$lib/types';
import { persisted } from './persisted';

export const userRecipes = persisted<Recipe[]>('rfmp:user-recipes', []);

export interface RecipeFormInput {
	title: string;
	image: string;
	category: string;
	area: string;
	instructions: string;
	ingredients: { name: string; measure: string }[];
	tags: string[];
}

export function validateRecipe(input: RecipeFormInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!input.title || input.title.trim().length < 3) {
		errors.title = 'Title must be at least 3 characters.';
	}
	if (!input.category || input.category.trim().length === 0) {
		errors.category = 'Category is required.';
	}
	if (!input.instructions || input.instructions.trim().length < 10) {
		errors.instructions = 'Instructions must be at least 10 characters.';
	}
	const cleanIngredients = input.ingredients.filter((i) => i.name.trim().length > 0);
	if (cleanIngredients.length === 0) {
		errors.ingredients = 'Add at least one ingredient.';
	}
	if (input.image && !/^https?:\/\//.test(input.image.trim())) {
		errors.image = 'Image must be a valid URL starting with http(s)://.';
	}

	return errors;
}

export function createRecipe(input: RecipeFormInput): Recipe {
	const errors = validateRecipe(input);
	if(Object.keys(errors).length > 0) {
		throw new Error('Invalid recipe input');
	}

	const recipe: Recipe = {
		 id: makeId(),
    title: input.title.trim(),
    image: input.image.trim(),
    category: input.category.trim(),
    area: input.area.trim(),
    instructions: input.instructions.trim(),
    ingredients: input.ingredients.filter((i) => i.name.trim().length > 0),
    tags: input.tags.filter((t) => t.trim().length > 0),
    userCreated: true
	}

	userRecipes.update((list) => [...list, recipe]);
	return recipe;
}

function makeId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}


export function updateRecipe(id: string, input: RecipeFormInput): void {
  const errors = validateRecipe(input);
  if (Object.keys(errors).length > 0) {
    throw new Error('Invalid recipe input');
  }

  userRecipes.update((list) =>
    list.map((r) =>
      r.id === id
        ? {
            ...r,
            title: input.title.trim(),
            image: input.image.trim(),
            category: input.category.trim(),
            area: input.area.trim(),
            instructions: input.instructions.trim(),
            ingredients: input.ingredients.filter((i) => i.name.trim().length > 0),
            tags: input.tags.filter((t) => t.trim().length > 0)
          }
        : r
    )
  );
}

export function deleteRecipe(id: string): void {
  userRecipes.update((list) => list.filter((r) => r.id !== id));
}

export function getUserRecipeById(id: string, list: Recipe[]): Recipe | undefined {
  return list.find((r) => r.id === id);
}
