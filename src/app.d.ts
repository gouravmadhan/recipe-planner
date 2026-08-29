// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare namespace svelteHTML {
  interface IntrinsicElements {
    'recipe-card': {
      'recipe-id'?: string;
      'recipe-title'?: string;
      image?: string;
      category?: string;
      area?: string;
      favorite?: boolean;
      'user-created'?: boolean;
      onfavoriteToggle?: (e: CustomEvent<{ recipeId: string; favorite: boolean }>) => void;
      onrecipeSelect?: (e: CustomEvent<{ recipeId: string }>) => void;
    };
    'recipe-tag': {
      label?: string;
      variant?: 'primary' | 'neutral' | 'success' | 'danger';
    };
    'day-planner-card': {
      'day-name'?: string;
      'has-meal'?: boolean;
      onslotClear?: (e: CustomEvent<{ dayName: string }>) => void;
    };
  }
}

export {};
