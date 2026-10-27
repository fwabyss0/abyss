import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    watch: {
      ignored: ['**/*.mp4', '**/.git/**']
    }
  }
});
