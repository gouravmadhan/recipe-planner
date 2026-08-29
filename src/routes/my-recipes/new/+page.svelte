<script lang="ts">
  import { goto } from '$app/navigation';
  import RecipeForm from '$lib/components/RecipeForm.svelte';
  import { createRecipe , type RecipeFormInput } from '$lib/store/userRecipes';

  function handleSubmit(input: RecipeFormInput) {
    const recipe = createRecipe(input);
    goto(`/recipe/${recipe.id}`);
  }
</script>

<svelte:head>
  <title>Add Recipe | Recipe Finder</title>
</svelte:head>

<a href="/my-recipes" class="back-link">&larr; My recipes</a>
<h1>Add a new recipe</h1>

<RecipeForm submitLabel="Create recipe" onSubmit={handleSubmit} />

<style>
  .back-link {
    display: inline-block;
    margin-bottom: 10px;
    color: #495057;
    text-decoration: none;
  }
</style>
