import { defineConfig } from 'vite';
import { createServer } from './api/dev-server.mjs';

try {
  process.loadEnvFile();
} catch {
  // no .env file — fine
}

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
  },
  plugins: [
    {
      name: 'api-server',
      configureServer(server) {
        const handler = createServer();
        server.middlewares.use('/api', (req, res, next) => {
          handler(req, res, next);
        });
      },
    },
  ],
});
