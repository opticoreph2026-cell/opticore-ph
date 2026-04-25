import { defineConfig } from 'prisma';

/**
 * Prisma 7 Configuration
 * This satisfies the parser requirements for driver adapters in Prisma 7.
 */
export default defineConfig({
  datasource: {
    url: 'file:./dev.db',
  },
});
