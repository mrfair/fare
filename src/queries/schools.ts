// src/queries/schools.ts
import type { DbExec } from "../app/db/types";

// Example query functions (procedure-like, but in code)
// These are read-only helpers; they can include joins when you add more tables.

export async function listWithPlaceCount(db: DbExec) {
  // Place count will be 0 until you add a `places` table.
  // This demonstrates "known query catalog" pattern.
  return db.all(`
    SELECT s.*, 0 as place_count
    FROM schools s
    WHERE s.deleted_hlc IS NULL
    ORDER BY s.name ASC
  `);
}

export async function getByCity(db: DbExec, city: string) {
  return db.all(
    `SELECT * FROM schools WHERE city=? AND deleted_hlc IS NULL ORDER BY name ASC`,
    [city]
  );
}
