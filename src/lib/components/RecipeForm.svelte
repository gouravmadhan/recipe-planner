<script lang="ts">
	import { validateRecipe, type RecipeFormInput } from '$lib/store/userRecipes';

	let {
		initial = null,
		submitLabel = 'Save recipe',
		onSubmit
	}: {
		initial?: RecipeFormInput | null;
		submitLabel?: string;
		onSubmit: (input: RecipeFormInput) => void;
	} = $props();

	const seed = $derived(initial);

	let title = $state('');
	let image = $state('');
	let category = $state('');
	let area = $state('');
	let instructions = $state('');
	let tagsText = $state('');
	let ingredients = $state<{ name: string; measure: string }[]>([{ name: '', measure: '' }]);
	let errors = $state<Record<string, string>>({});

	$effect(() => {
		title = seed?.title ?? '';
		image = seed?.image ?? '';
		category = seed?.category ?? '';
		area = seed?.area ?? '';
		instructions = seed?.instructions ?? '';
		tagsText = seed?.tags?.join(', ') ?? '';

		ingredients =
			seed?.ingredients && seed.ingredients.length > 0
				? [...seed.ingredients]
				: [{ name: '', measure: '' }];
	});

	function addIngredientRow() {
		ingredients = [...ingredients, { name: '', measure: '' }];
	}

	function removeIngredientRow(index: number) {
		ingredients = ingredients.filter((_, i) => i !== index);
	}

	function buildInput(): RecipeFormInput {
		return {
			title,
			image,
			category,
			area,
			instructions,
			ingredients,
			tags: tagsText
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)
		};
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		const input = buildInput();
		errors = validateRecipe(input);
		if (Object.keys(errors).length > 0) return;
		onSubmit(input);
	}
</script>

<form onsubmit={handleSubmit} class="recipe-form">
	<div class="field">
		<label for="title">Title *</label>
		<input id="title" type="text" bind:value={title} placeholder="e.g. Grandma's Lasagna" />
		{#if errors.title}<span class="error">{errors.title}</span>{/if}
	</div>

	<div class="field">
		<label for="image">Image URL</label>
		<input id="image" type="text" bind:value={image} placeholder="https://..." />
		{#if errors.image}<span class="error">{errors.image}</span>{/if}
	</div>

	<div class="row">
		<div class="field">
			<label for="category">Category *</label>
			<input id="category" type="text" bind:value={category} placeholder="e.g. Dessert" />
			{#if errors.category}<span class="error">{errors.category}</span>{/if}
		</div>
		<div class="field">
			<label for="area">Cuisine / Area</label>
			<input id="area" type="text" bind:value={area} placeholder="e.g. Italian" />
		</div>
	</div>

	<div class="field">
		<label for="tags">Tags (comma-separated)</label>
		<input id="tags" type="text" bind:value={tagsText} placeholder="e.g. quick, vegetarian" />
	</div>

	<div class="field">
		<label for="ingredients-0">Ingredients *</label>
		{#each ingredients as ing, i (i)}
			<div class="ingredient-row">
				<input
					type="text"
					placeholder="Ingredient"
					bind:value={ing.name}
					id={i === 0 ? 'ingredients-0' : undefined}
				/>
				<input type="text" placeholder="Amount (e.g. 2 cups)" bind:value={ing.measure} />
				<button
					type="button"
					class="btn secondary small"
					onclick={() => removeIngredientRow(i)}
					disabled={ingredients.length === 1}
				>
					Remove
				</button>
			</div>
		{/each}
		{#if errors.ingredients}<span class="error">{errors.ingredients}</span>{/if}
		<button type="button" class="btn secondary small" onclick={addIngredientRow}
			>+ Add ingredient</button
		>
	</div>

	<div class="field">
		<label for="instructions">Instructions *</label>
		<textarea
			id="instructions"
			rows="6"
			bind:value={instructions}
			placeholder="Step-by-step instructions..."></textarea>
		{#if errors.instructions}<span class="error">{errors.instructions}</span>{/if}
	</div>

	<button class="btn" type="submit">{submitLabel}</button>
</form>
