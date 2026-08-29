<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
  import { page } from "$app/stores";
	import RecipeForm from "$lib/components/RecipeForm.svelte";
	import { userRecipes, updateRecipe, type RecipeFormInput } from "$lib/store/userRecipes";
	import type { Recipe } from "$lib/types";
	import { onMount } from "svelte";

  let recipe = $state<Recipe | undefined>(undefined);
  let loading = $state(true);

  const recipeId = $derived($page.params.id);

  onMount(() => {
    if (!recipeId) {
      goto('/my-recipes');
      return;
    }
    recipe = $userRecipes.find((r) => r.id === recipeId);
    loading = true;
  });

  function handleSubmit(input: RecipeFormInput) {
    if (!recipeId) return;
    updateRecipe(recipeId, input);
    goto(`/recipe/${recipeId}`);
  }


</script>


<svelte:head>
  <title>Edit Recipe | Recipe Finder</title>
</svelte:head>

<a href={resolve("/my-recipes")} class="back-link">&larr; My recipes</a>
<h1>Edit Recipe</h1>

{#if !loading}
  <p>loading...</p>
{:else if !recipe}
  <p class="empty-state">This recipe doesn't exist (it may have been deleted).</p>
{:else}
  <RecipeForm 
    initial = {{
      title: recipe.title,
      image: recipe.image,
      category: recipe.category,
      area: recipe.area,
      instructions: recipe.instructions,
      ingredients: recipe.ingredients,
      tags: recipe.tags
    }}
    submitLabel="Save Changes"
    onSubmit={handleSubmit}
  
  />
{/if}

<style>
  .back-link {
    display: inline-block;
    margin-bottom: 10px;
    color: #495057;
    text-decoration: none;
  }
</style>
