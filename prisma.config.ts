import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { defineConfig } from 'prisma/config';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) loadEnvFile(envPath);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts'
  }
});
