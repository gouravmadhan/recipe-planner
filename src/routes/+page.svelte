<script lang="ts">
	import {
		filterByArea,
		filterByCategory,
		getAreas,
		getCategories,
		searchRecipes
	} from '$lib/api/themealdb';
	import type { Recipe } from '$lib/types';
	import { favoriteIds, toggleFavorite } from '$lib/store/favorites';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { searchUserRecipes } from '$lib/recipes';

	let query = $state('');
	let category = $state('');
	let area = $state('');
	let recipes = $state<Recipe[]>([]);
	let categories = $state<string[]>([]);
	let areas = $state<string[]>([]);
	let loading = $state(false);
	let errorMessage = $state('');

	async function load() {
		loading = true;
		errorMessage = '';
		try {
			let result: Recipe[];
			if (category) {
				result = await filterByCategory(category);
			} else if (area) {
				result = await filterByArea(area);
			} else {
				result = await searchRecipes(query);
			}

			const mine = searchUserRecipes(category || area ? '' : query).filter((r) =>
				category ? r.category === category : area ? r.area === area : true
			);

			const existingIds = new Set(result.map((r) => r.id));

			recipes = [...mine.filter((r) => !existingIds.has(r.id)), ...result];
		} catch (err) {
			console.log(err);
			errorMessage = 'Could not reach the recipe API. Check your connection and try again.';
			recipes = [];
		} finally {
			loading = false;
		}

		console.log(recipes);
	}

	onMount(async () => {
		load();
		try {
			[categories, areas] = await Promise.all([getCategories(), getAreas()]);
		} catch (err) {
			console.log(err);
		}
	});

	function onSearchSubmit(e: Event) {
		e.preventDefault();
		category = '';
		area = '';
		load();
	}

	function onCategoryChange() {
		area = '';
		load();
	}

	function onAreaChange() {
		category = '';
		load();
	}

	function handleFavoriteToggle(e: CustomEvent<{ recipeId: string; favorite: boolean }>) {
		toggleFavorite(e.detail.recipeId, e.detail.favorite);
	}

	function handleSelect(e: CustomEvent<{ recipeId: string }>) {
		goto(`/recipe/${e.detail.recipeId}`);
	}
</script>

<svelte:head>
	<title>Recipe Finder & Meal Planner</title>
</svelte:head>

<section class="hero">
	<h1>Find Something Good to cook</h1>
	<form onsubmit={onSearchSubmit} class="search-row">
		<input type="search" placeholder="Search recipes, e.g. chicken, pasta..." bind:value={query} />
		<button class="btn" type="submit">Search</button>
	</form>

	<div class="filters">
		<div class="field" style="min-width:180px">
			<label for="category">Category</label>
			<select id="category" bind:value={category} onchange={onCategoryChange}>
				<option value="">All Categories</option>
				{#each categories as c (c)}
					<option value={c}>{c}</option>
				{/each}
			</select>
		</div>
		<div class="field" style="min-width: 180px;">
			<label for="area"> Cuisine / Area</label>
			<select id="area" bind:value={area} onchange={onAreaChange}>
				<option value="">All cuisines</option>
				{#each areas as a (a)}
					<option value={a}>{a}</option>
				{/each}
			</select>
		</div>
	</div>
</section>

{#if loading}
	<p>Loading recipies....</p>
{:else if errorMessage}
	<p class="empty-state">{errorMessage}</p>
{:else if recipes.length === 0}
	<p class="empty-state">No recipes found. Try a different search or filter.</p>
{:else}
	<div class="grid">
		{#each recipes as r (r.id)}
			<recipe-card
				recipe-id={r.id}
				recipe-title={r.title}
				image={r.image}
				category={r.category}
				area={r.area}
				favorite={$favoriteIds.includes(r.id)}
				user-created={r.userCreated}
				onfavoriteToggle={handleFavoriteToggle}
				onrecipeSelect={handleSelect}
			></recipe-card>
		{/each}
	</div>
{/if}

<style>
	.hero {
		margin-bottom: 26px;
	}
	.hero h1 {
		margin: 0 0 14px;
	}
	.search-row {
		display: flex;
		gap: 10px;
		margin-bottom: 14px;
	}
	.search-row input {
		flex: 1;
		padding: 10px 14px;
		border: 1px solid #dcdcdc;
		border-radius: 8px;
		font-size: 0.95rem;
	}
	.filters {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
	}
</style>
