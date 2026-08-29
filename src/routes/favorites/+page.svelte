<script lang="ts">
	import type { Recipe } from "$lib/types";
  import { favoriteIds, toggleFavorite } from "$lib/store/favorites";
  import { resolveRecipe } from "$lib/recipes";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

  let recipes = $state<Recipe[]>([]);
  let loading = $state(true);
  
  async function load(ids: string[]) {
    loading = true;
    const resolved = await Promise.all(ids.map((id) => resolveRecipe(id)));
    recipes = resolved.filter((r): r is Recipe => r !== null);
    loading = false;
  }

  onMount(() => load($favoriteIds))

  $effect(() => {
    load($favoriteIds)
  });

  function handleFavoriteToggle(e: CustomEvent<{recipeId: string, favorite: boolean}>) {
    toggleFavorite(e.detail.recipeId, e.detail.favorite);
  }

  function handleSelect(e: CustomEvent<{recipeId: string}>) {
    goto(`/recipe/${e.detail.recipeId}`);
  }

</script>


<svelte:head>
  <title>Favorites | Recipe Finder</title>
</svelte:head>

<h1>Your Favorites</h1>

{#if loading}
  <p>Loading.....</p>
{:else if recipes.length === 0}
  <p class="empty-state">You haven't favorited any recipes yet. Browse recipes and tap the star to save them here.</p>
{:else}
  <div class="grid">
    {#each recipes as r (r.id)}
      <recipe-card
        recipe-id={r.id}
        recipe-title={r.title}
        image={r.image}
        category={r.category}
        area={r.area}
        favorite={true}
        user-created={r.userCreated}
        onfavoriteToggle={handleFavoriteToggle}
        onrecipeSelect={handleSelect}
      >

      </recipe-card>
    {/each}
  </div>
{/if}