<script lang="ts">
  import { goto } from '$app/navigation';
  import { userRecipes, deleteRecipe } from '$lib/store/userRecipes';
  import { favoriteIds, toggleFavorite } from '$lib/store/favorites';

  function handleFavoriteToggle(e: CustomEvent<{ recipeId: string; favorite: boolean }>) {
    toggleFavorite(e.detail.recipeId, e.detail.favorite);
  }

  function handleSelect(e: CustomEvent<{ recipeId: string }>) {
    goto(`/recipe/${e.detail.recipeId}`);
  }

  function handleDelete(id: string, title: string) {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteRecipe(id);
    }
  }
</script>

<svelte:head>
  <title>My Recipes | Recipe Finder</title>
</svelte:head>

<div class="header-row">
  <h1>My recipes</h1>
  <a class="btn" href="/my-recipes/new">+ Add recipe</a>
</div>

{#if $userRecipes.length === 0}
  <p class="empty-state">You haven't added any recipes yet. Click "Add recipe" to create your first one.</p>
{:else}
  <div class="grid">
    {#each $userRecipes as r (r.id)}
      <recipe-card
        recipe-id={r.id}
        recipe-title={r.title}
        image={r.image}
        category={r.category}
        area={r.area}
        favorite={$favoriteIds.includes(r.id)}
        user-created={true}
        onfavoriteToggle={handleFavoriteToggle}
        onrecipeSelect={handleSelect}
      >
        <div slot="actions" class="card-actions">
          <a class="btn secondary small" href={`/my-recipes/${r.id}/edit`}>Edit</a>
          <button class="btn danger small" onclick={() => handleDelete(r.id, r.title)}>Delete</button>
        </div>
      </recipe-card>
    {/each}
  </div>
{/if}

<style>
  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .card-actions {
    display: flex;
    gap: 6px;
  }
  .btn.small {
    padding: 5px 10px;
    font-size: 0.78rem;
  }
</style>
