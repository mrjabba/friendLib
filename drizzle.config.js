import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Use POSTGRES_URL if defined (for GitHub Actions), else DATABASE_URL for local/dev/production
    url: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  },
})
