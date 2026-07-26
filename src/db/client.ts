import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof createDb>;

declare global {
    // eslint-disable-next-line no-var
  var __rprpDb: Db | undefined;
}

function createDb() {
    const url = process.env.DATABASE_URL ?? process.env.DATA;
    if (!url) throw new Error("DATABASE_URL is not set");
    // prepare:false is required for Supabase transaction pooler (pgbouncer)
    const client = postgres(url, { prepare: false, max: 3, connect_timeout: 8, idle_timeout: 20 });
    return drizzle(client, { schema });
}

/**
 * Lazy singleton behind a Proxy: the connection (and the DATABASE_URL check)
 * only happens on first query at runtime - never at import time. This keeps
 * next build env-independent (page-data collection imports route modules).
 */
export const db: Db = new Proxy({} as Db, {
    get(_target, prop, receiver) {
          if (!globalThis.__rprpDb) globalThis.__rprpDb = createDb();
          const value = Reflect.get(globalThis.__rprpDb, prop, receiver);
          return typeof value === "function" ? value.bind(globalThis.__rprpDb) : value;
    },
});

export { schema };
