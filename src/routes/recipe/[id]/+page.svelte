<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { resolveRecipe } from '$lib/recipes';
  import { favoriteIds, toggleFavorite } from '$lib/store/favorites';
  import { assignRecipeToDay } from '$lib/store/mealPlan';
  import { deleteRecipe } from '$lib/store/userRecipes';
  import { WEEKDAYS, type Recipe, type Weekday } from '$lib/types';

  let recipe = $state<Recipe | null>(null);
  let loading = $state(true);
  let notFound = $state(false);
  let selectedDay = $state<Weekday>('Monday');
  let planMessage = $state('');

  async function load(id: string) {
    loading = true;
    notFound = false;
    recipe = await resolveRecipe(id);
    if (!recipe) notFound = true;
    loading = false;
  }

  $effect(() => {
    const id = $page.params.id;
    if (id) load(id);
  });

  function onFavoriteClick() {
    if (!recipe) return;
    toggleFavorite(recipe.id);
  }

  function onAddToPlan() {
    if (!recipe) return;
    assignRecipeToDay(selectedDay, recipe.id);
    planMessage = `Added to ${selectedDay}!`;
    setTimeout(() => (planMessage = ''), 2000);
  }

  function onDelete() {
    if (!recipe) return;
    if (confirm('Delete this recipe? This cannot be undone.')) {
      deleteRecipe(recipe.id);
      goto('/my-recipes');
    }
  }
</script>

<svelte:head>
  <title>{recipe ? recipe.title : 'Recipe'} | Recipe Finder</title>
</svelte:head>

{#if loading}
  <p>Loading…</p>
{:else if notFound}
  <div class="empty-state">
    <p>We couldn't find that recipe.</p>
    <a class="btn secondary" href="/">Back to Discover</a>
  </div>
{:else if recipe}
  <a href="/" class="back-link">&larr; Back</a>

  <div class="detail-layout">
    <div class="image-col">
      {#if recipe.image}
        <img src={recipe.image} alt={recipe.title} />
      {/if}
      <div class="actions">
        <button class="btn" onclick={onFavoriteClick}>
          {$favoriteIds.includes(recipe.id) ? '★ Remove favorite' : '☆ Add to favorites'}
        </button>
        {#if recipe.userCreated}
          <a class="btn secondary" href={`/my-recipes/${recipe.id}/edit`}>Edit recipe</a>
          <button class="btn danger" onclick={onDelete}>Delete recipe</button>
        {/if}
      </div>

      <div class="plan-box">
        <label for="day-select">Add to meal plan</label>
        <div class="plan-row">
          <select id="day-select" bind:value={selectedDay}>
            {#each WEEKDAYS as d (d)}
              <option value={d}>{d}</option>
            {/each}
          </select>
          <button class="btn secondary" onclick={onAddToPlan}>Add</button>
        </div>
        {#if planMessage}<p class="plan-msg">{planMessage}</p>{/if}
      </div>
    </div>

    <div class="content-col">
      <h1>{recipe.title}</h1>
      <div class="tags">
        {#if recipe.category}<recipe-tag label={recipe.category} variant="primary"></recipe-tag>{/if}
        {#if recipe.area}<recipe-tag label={recipe.area} variant="neutral"></recipe-tag>{/if}
        {#each recipe.tags as t (t)}<recipe-tag label={t} variant="success"></recipe-tag>{/each}
      </div>

      <h2>Ingredients</h2>
      {#if recipe.ingredients.length > 0}
        <ul class="ingredients">
          {#each recipe.ingredients as ing (ing.name)}
            <li><strong>{ing.measure}</strong> {ing.name}</li>
          {/each}
        </ul>
      {:else}
        <p>No ingredients listed.</p>
      {/if}

      <h2>Instructions</h2>
      <p class="instructions">{recipe.instructions}</p>

      {#if recipe.youtube}
        <p><a href={recipe.youtube} target="_blank" rel="noopener">Watch video tutorial ↗</a></p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .back-link {
    display: inline-block;
    margin-bottom: 14px;
    color: #495057;
    text-decoration: none;
  }
  .detail-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 32px;
  }
  @media (max-width: 760px) {
    .detail-layout {
      grid-template-columns: 1fr;
    }
  }
  .image-col img {
    width: 100%;
    border-radius: 12px;
    display: block;
    margin-bottom: 12px;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }
  .plan-box {
    background: white;
    border: 1px solid #eee;
    border-radius: 10px;
    padding: 12px;
  }
  .plan-box label {
    font-size: 0.85rem;
    font-weight: 600;
    display: block;
    margin-bottom: 6px;
  }
  .plan-row {
    display: flex;
    gap: 8px;
  }
  .plan-row select {
    flex: 1;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid #dcdcdc;
  }
  .plan-msg {
    color: #1a7f37;
    font-size: 0.82rem;
    margin: 8px 0 0;
  }
  .tags {
    display: flex;
    gap: 8px;
    margin: 10px 0 20px;
    flex-wrap: wrap;
  }
  .ingredients {
    padding-left: 18px;
  }
  .instructions {
    white-space: pre-line;
    line-height: 1.6;
  }
</style>
