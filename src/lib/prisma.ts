import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // 1. If an external remote database is provided (Postgres, MySQL, Turso, Supabase, Neon)
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // 2. Detect serverless environment (Netlify Lambda, AWS Lambda, Vercel)
  const isServerless = Boolean(
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.VERCEL
  );

  if (isServerless) {
    const tmpDbPath = '/tmp/dev.db';

    // Copy bundled seed database to /tmp if it doesn't exist or is empty
    if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.resolve('./prisma/dev.db'),
        path.resolve('./dev.db'),
        path.join('/var/task', 'prisma', 'dev.db'),
        path.join('/var/task', 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.join(__dirname, '..', 'prisma', 'dev.db'),
        path.join(__dirname, 'prisma', 'dev.db'),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            console.log(`[Prisma SQLite] Successfully copied database from ${candidate} to ${tmpDbPath}`);
            break;
          } catch (err) {
            console.error('[Prisma SQLite] Error copying database to /tmp:', err);
          }
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  // 3. Local development environment: resolve absolute path with forward slashes
  const localDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
  if (fs.existsSync(localDbPath)) {
    return `file:${localDbPath}`;
  }

  // Fallback
  return envUrl || 'file:./prisma/dev.db';
}

const dbUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
