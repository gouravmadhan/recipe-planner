<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';

	let { children } = $props();

	const links = [
		{ href: '/', label: 'Discover' },
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
