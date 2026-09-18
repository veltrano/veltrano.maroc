import postgres from "postgres";

const globalDb = globalThis as typeof globalThis & {
  veltranoSql?: ReturnType<typeof postgres>;
};

export function postgresEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

export function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL n’est pas configurée.");
  }
  if (!globalDb.veltranoSql) {
    globalDb.veltranoSql = postgres(process.env.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return globalDb.veltranoSql;
}
