<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { mealPlan, clearDay, resetPlan, assignRecipeToDay } from '$lib/store/mealPlan';
	import { favoriteIds, toggleFavorite } from '$lib/store/favorites';
	import { resolveRecipe } from '$lib/recipes';
	import { WEEKDAYS, type Recipe, type Weekday } from '$lib/types';
	import RecipeSearchModal from '$lib/components/RecipeSearchModal.svelte';

	let recipesByDay = $state<Record<Weekday, Recipe | null>>(
		Object.fromEntries(WEEKDAYS.map((d) => [d, null])) as Record<Weekday, Recipe | null>
	);

	let pickerDay = $state<Weekday | null>(null);

	async function loadAll(plan: Record<Weekday, string | null>) {
		const entries = await Promise.all(
			WEEKDAYS.map(async (day) => {
				const id = plan[day];
				const recipe = id ? await resolveRecipe(id) : null;
				return [day, recipe] as const;
			})
		);
		recipesByDay = Object.fromEntries(entries) as Record<Weekday, Recipe | null>;
	}

	onMount(() => loadAll($mealPlan));

	$effect(() => {
		loadAll($mealPlan);
	});

	function handleClear(day: Weekday) {
		clearDay(day);
	}

	function handleFavoriteToggle(e: CustomEvent<{ recipeId: string; favorite: boolean }>) {
		toggleFavorite(e.detail.recipeId, e.detail.favorite);
	}

	function handleSelect(e: CustomEvent<{ recipeId: string }>) {
		goto(`/recipe/${e.detail.recipeId}`);
	}

	function handlePickerSelect(recipe: Recipe) {
		if (!pickerDay) return;
		assignRecipeToDay(pickerDay, recipe.id);
		pickerDay = null;
	}
</script>

<svelte:head>
	<title>Meal Planner | Recipe Finder</title>
</svelte:head>

<div class="header-row">
	<h1>Weekly meal planner</h1>
	<button class="btn secondary" onclick={resetPlan}>Clear week</button>
</div>
<p class="hint">Open any recipe and use "Add to meal plan" to fill in a day.</p>

<div class="planner-grid">
	{#each WEEKDAYS as day (day)}
		<div class="day-col">
			<day-planner-card
				day-name={day}
				has-meal={!!recipesByDay[day]}
				onslotClear={() => handleClear(day)}
			>
				{#if recipesByDay[day]}
					<recipe-card
						recipe-id={recipesByDay[day]!.id}
						recipe-title={recipesByDay[day]!.title}
						image={recipesByDay[day]!.image}
						category={recipesByDay[day]!.category}
						area={recipesByDay[day]!.area}
						favorite={$favoriteIds.includes(recipesByDay[day]!.id)}
						user-created={recipesByDay[day]!.userCreated}
						onfavoriteToggle={handleFavoriteToggle}
						onrecipeSelect={handleSelect}
					></recipe-card>
				{/if}
			</day-planner-card>
			<button class="btn secondary small add-meal-btn" onclick={() => (pickerDay = day)}>
				{recipesByDay[day] ? 'Change meal' : '+ Add meal'}
			</button>
		</div>
	{/each}
</div>

{#if pickerDay}
	<RecipeSearchModal
		day={pickerDay}
		onClose={() => (pickerDay = null)}
		onSelect={handlePickerSelect}
	/>
{/if}

<style>
	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.hint {
		color: #868e96;
		font-size: 0.85rem;
		margin-bottom: 20px;
	}
	.planner-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 14px;
	}
	.day-col {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.add-meal-btn {
		align-self: stretch;
	}
</style>
