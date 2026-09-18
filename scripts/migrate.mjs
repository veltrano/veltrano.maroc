import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL absent: migrations PostgreSQL ignorées.");
  process.exit(0);
}

const sql = postgres(url, { max: 1 });
const dir = path.join(process.cwd(), "migrations");

try {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  const files = (await readdir(dir))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const [applied] = await sql`
      SELECT version FROM schema_migrations WHERE version = ${file}
    `;
    if (applied) continue;
    const body = await readFile(path.join(dir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`
        INSERT INTO schema_migrations (version) VALUES (${file})
        ON CONFLICT (version) DO NOTHING
      `;
    });
    console.log(`Migration appliquée: ${file}`);
  }
} finally {
  await sql.end();
}
