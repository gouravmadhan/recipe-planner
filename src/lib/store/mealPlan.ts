import { WEEKDAYS, type MealPlanEntry, type Weekday } from "$lib/types";
import { persisted } from "./persisted";


export type MealPlan = Record<Weekday, string | null>;

function emptyPlan(): MealPlan {
  const plan = {} as MealPlan;
  for (const day of WEEKDAYS) plan[day] = null;
  return plan;
}

export const mealPlan = persisted<MealPlan>('rfmp:meal-plan', emptyPlan());

/** Assign a recipe to a day, replacing whatever was there. */
export function assignRecipeToDay(day: Weekday, recipeId: string) {
  mealPlan.update((plan) => ({ ...plan, [day]: recipeId }));
}

/** Clear the meal planned for a given day. */
export function clearDay(day: Weekday) {
  mealPlan.update((plan) => ({ ...plan, [day]: null }));
}

/** Reset the whole week. */
export function resetPlan() {
  mealPlan.set(emptyPlan());
}

export function planToEntries(plan: MealPlan): MealPlanEntry[] {
  return WEEKDAYS.filter((d) => plan[d]).map((d) => ({ day: d, recipeId: plan[d] as string }));
}
