# Recipe Planner App

A Recipe Finder & Meal Planner built with **Svelte 5 + SvelteKit**, styled
with plain CSS, and using [TheMealDB](https://www.themealdb.com/api.php)'s
free public API for recipe data. Its UI is built from
[`recipe-ui-kit`](https://www.npmjs.com/package/recipe-ui-kit) — a separate
StencilJS web component library, consumed here as a published npm package.

## Features

- **Discover** (`/`) — search recipes by name, or filter by category / cuisine.
- **Recipe details** (`/recipe/[id]`) — full ingredient list, instructions,
  tags, and a "add to meal plan" control.
- **Favorites** (`/favorites`) — star any recipe to save it here.
- **Weekly meal planner** (`/planner`) — assign a recipe to each day of the
  week. Each day has an **"+ Add meal" / "Change meal"** button that opens
  an in-page search popup (`RecipeSearchModal`) — no need to leave the
  planner to browse and pick.
- **My Recipes** (`/my-recipes`, `/my-recipes/new`, `/my-recipes/[id]/edit`)
  — create, edit, and delete your own recipes, with client-side validation.

All user state (favorites, the meal plan, and your own recipes) persists to
`localStorage` — there's no backend or auth, by design (see **Assumptions**
below).

## Tech stack

| | |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes: `$state`, `$props`, `$effect`) |
| Language | TypeScript |
| Build tool | Vite 8 |
| UI components | [`recipe-ui-kit`](https://www.npmjs.com/package/recipe-ui-kit) (StencilJS web components) |
| Recipe data | [TheMealDB](https://www.themealdb.com/api.php) public API (no key required) |
| Linting / formatting | ESLint 10 (flat config) + Prettier, with `eslint-plugin-svelte` |
| Type checking | `svelte-check` |

## Project structure

```
src/
  lib/
    api/mealdb.ts          TheMealDB API client + response → Recipe mapper
    components/
      RecipeForm.svelte        Shared add/edit form for user recipes
      RecipeSearchModal.svelte In-page recipe picker used by the planner
    stores/
      persisted.ts          localStorage-backed writable() wrapper
      favorites.ts          Favorite recipe ids
      mealPlan.ts           Weekday -> recipe id assignments
      userRecipes.ts        CRUD + validation for user-created recipes
    recipes.ts              Resolves a recipe by id across API + user recipes
    types.ts                Shared Recipe / Weekday / MealPlanEntry types
  routes/
    +layout.svelte          Nav shell; registers the recipe-ui-kit web components
    +page.svelte             Discover
    recipe/[id]/+page.svelte Recipe details
    favorites/+page.svelte
    planner/+page.svelte
    my-recipes/
      +page.svelte
      new/+page.svelte
      [id]/edit/+page.svelte
```

## Getting started

### Prerequisites

- Node.js 18+ and npm

### Install

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Other scripts

```bash
npm run build         # production build
npm run preview       # preview the production build locally
npm run check         # svelte-kit sync + svelte-check (type checking)
npm run lint          # eslint .
npm run format        # prettier --write .
```

## Using `recipe-ui-kit`

This app depends on the real, published npm package:

```json
"dependencies": {
  "recipe-ui-kit": "^1.0.1"
}
```

The web components are registered once, on the client, in `+layout.svelte`:

```svelte
<script>
  import { onMount } from 'svelte';
  onMount(async () => {
    const { defineCustomElements } = await import('recipe-ui-kit/loader');
    defineCustomElements();
  });
</script>
```

They're then used directly as HTML tags in route templates, e.g.
`<recipe-card recipe-id={r.id} ... onfavoriteToggle={...}>`. In Svelte 5,
custom-element events are wired with the `on<EventName>` attribute syntax
(e.g. `onfavoriteToggle`), not the older `on:eventName` directive.

### A required Vite dev-server setting

`vite.config.js` excludes `recipe-ui-kit` from Vite's dependency
pre-bundler:

```js
optimizeDeps: {
  exclude: ['recipe-ui-kit']
}
```

This is necessary because `recipe-ui-kit`'s Stencil "loader" lazily imports
its component chunks using a path computed at runtime, not a static import
Vite's scanner can see. Without this line, Vite pre-bundles the package
into `node_modules/.vite/deps/`, that runtime import resolves against the
wrong directory, and components fail to load in dev with a `Constructor for
"recipe-card#undefined" was not found` error. If you ever hit that error
after changing dependencies, also try clearing the cache:
`rm -rf node_modules/.vite`.

## Deployment

The app uses `@sveltejs/adapter-auto`, which detects common hosts (Vercel,
Netlify, Cloudflare, etc.) automatically at build time — no adapter changes
needed for most platforms.

### Vercel

1. Import the repo in the Vercel dashboard.
2. Set **Root Directory** to `recipe-planner-app` (important if this app
   lives in a monorepo alongside `recipe-ui-kit`).
3. Deploy — Vercel auto-detects the SvelteKit build command.

## Assumptions

- **No backend / auth**: favorites, the meal plan, and user-created recipes
  are stored in `localStorage`, scoped to the browser. This keeps the app
  simple and dependency-free, at the cost of state not syncing across
  devices.
- **Recipe API**: TheMealDB's free public test endpoint requires no signup.
  It occasionally returns duplicate entries from its category/area list
  endpoints (e.g. "Dominican" appearing twice) — the API client dedupes
  these before they reach the UI.
- **User-created vs. API recipes**: only recipes you create yourself
  (`userCreated: true`, id prefixed `user-`) can be edited or deleted;
  recipes from TheMealDB can be favorited and planned but not modified,
  since the app doesn't own that data.
