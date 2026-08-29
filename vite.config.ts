import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173
  },
  optimizeDeps: {
    // recipe-ui-kit's Stencil "loader" lazily imports its component chunks
    // using a relative path computed at runtime (inside bootstrapLazy), not
    // a static import Vite's esbuild-based dep scanner can see. If Vite
    // pre-bundles the package into node_modules/.vite/deps/, that runtime
    // import resolves against the wrong directory and 404s (the browser
    // ends up requesting .vite/deps/<chunk>.entry.js, which doesn't exist -
    // only the untouched node_modules/recipe-ui-kit/dist/esm/<chunk>.entry.js
    // does). Excluding it keeps Vite serving the package files as-is.
    exclude: ['recipe-ui-kit']
  }
});
