export interface Recipe {
	id: string;
	title: string;
	image: string;
	category: string;
	area: string;
	instructions: string;
	ingredients: { name: string; measure: string }[];
	tags: string[];
	youtube?: string;
	source?: string;
  userCreated: boolean;
}

export interface MealPlanEntry {
	day: Weekday;
	recipeId: string
}

export type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const WEEKDAYS: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
