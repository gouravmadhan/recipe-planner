<script lang="ts">
  import { onMount } from 'svelte';
  import { searchRecipes } from '$lib/api/themealdb';
  import { searchUserRecipes } from '$lib/recipes';
  import type { Recipe, Weekday } from '$lib/types';

  let {
    day,
    onClose,
    onSelect
  }: {
    day: Weekday;
    onClose: () => void;
    onSelect: (recipe: Recipe) => void;
  } = $props();

  let query = $state('');
  let results = $state<Recipe[]>([]);
  let loading = $state(false);
  let errorMsg = $state('');
  let inputEl: HTMLInputElement | undefined = $state();

  let debounceHandle: ReturnType<typeof setTimeout> | undefined;

  async function runSearch(q: string) {
    loading = true;
    errorMsg = '';
    try {
      const [apiResults, mine] = await Promise.all([
        searchRecipes(q),
        Promise.resolve(searchUserRecipes(q))
      ]);
      const existingIds = new Set(apiResults.map((r) => r.id));
      results = [...mine.filter((r) => !existingIds.has(r.id)), ...apiResults];
    } catch (err) {
      console.error(err);
      errorMsg = 'Could not reach the recipe API. Check your connection and try again.';
      results = [];
    } finally {
      loading = false;
    }
  }

  function onQueryInput() {
    if (debounceHandle) clearTimeout(debounceHandle);
    debounceHandle = setTimeout(() => runSearch(query), 300);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  onMount(() => {
    inputEl?.focus();
    runSearch(''); // seed with a default browsable list, same as Discover's initial load
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="backdrop" role="presentation" onclick={handleBackdropClick}>
  <div class="modal" role="dialog" aria-modal="true" aria-label={`Add a meal for ${day}`}>
    <div class="modal-header">
      <h2>Add meal &middot; {day}</h2>
      <button class="close-btn" onclick={onClose} aria-label="Close">✕</button>
    </div>

    <input
      bind:this={inputEl}
      type="search"
      placeholder="Search recipes, e.g. chicken, pasta..."
      bind:value={query}
      oninput={onQueryInput}
      class="search-input"
    />

    <div class="results">
      {#if loading}
        <p class="status-msg">Loading recipes…</p>
      {:else if errorMsg}
        <p class="status-msg">{errorMsg}</p>
      {:else if results.length === 0}
        <p class="status-msg">No recipes found. Try a different search.</p>
      {:else}
        {#each results as r (r.id)}
          <button class="result-row" onclick={() => onSelect(r)}>
            {#if r.image}
              <img src={r.image} alt={r.title} loading="lazy" />
            {:else}
              <div class="thumb-placeholder"></div>
            {/if}
            <div class="result-info">
              <span class="result-title">{r.title}</span>
              <span class="result-meta">
                {[r.category, r.area].filter(Boolean).join(' · ') || (r.userCreated ? 'Your recipe' : '')}
              </span>
            </div>
          </button>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 100;
  }

  .modal {
    background: white;
    border-radius: 14px;
    width: 100%;
    max-width: 480px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    padding: 18px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  .close-btn {
    border: none;
    background: transparent;
    font-size: 1.1rem;
    cursor: pointer;
    color: #868e96;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .close-btn:hover {
    background: #f1f3f5;
    color: #212529;
  }

  .search-input {
    padding: 10px 14px;
    border: 1px solid #dcdcdc;
    border-radius: 8px;
    font-size: 0.95rem;
    margin-bottom: 12px;
  }

  .results {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .status-msg {
    color: #868e96;
    font-size: 0.85rem;
    text-align: center;
    padding: 24px 8px;
  }

  .result-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
  }

  .result-row:hover {
    background: #f7f7f8;
    border-color: #eee;
  }

  .result-row img,
  .thumb-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    object-fit: cover;
    flex: 0 0 48px;
    background: #f1f3f5;
  }

  .result-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .result-title {
    font-size: 0.92rem;
    font-weight: 600;
    color: #212529;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-meta {
    font-size: 0.78rem;
    color: #868e96;
  }
</style>
