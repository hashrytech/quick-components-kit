import plugin from 'tailwindcss/plugin';
import path from 'path';

const quiickComponentsKitPlugin = plugin(function() {
  // Optional: Add custom utilities
}, {
  content: [
    path.join(__dirname, '**/*.{svelte,js,ts}')
  ]
});

export default quiickComponentsKitPlugin;
