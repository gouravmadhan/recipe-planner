<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
   import '../app.css';

	let { children } = $props();

	onMount(async () => {
		const { defineCustomElements } = await import('recipe-ui-kit/loader');
		defineCustomElements();
	});

	const links = [
		{ href: '/', label: 'Discovery' },
		{ href: '/favorites', label: 'Favorites' },
		{ href: '/planner', label: 'Meal Planner' },
		{ href: '/my-recipes', label: 'My Recipes' }
	];
</script>

<div class="app-shell">
	<header class="topbar">
		<a class="brand" href="/">🍳 Recipe Finder</a>
		<nav>
			{#each links as link (link.href)}
				<a href={link.href} class:active={$page.url.pathname === link.href}>{link.label}</a>
			{/each}
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer class="footer">
		Built with Svelte 5 + SvelteKit + a Stencil web component library (@yourscope/recipe-ui-kit).
	</footer>
</div>
