/**
 * signals.db — the persisted F_i vector per URL.
 *
 * Deliberately NOT a native-compiled database (no better-sqlite3): this repo
 * builds on Windows without guaranteed build tools, and the audit needs to
 * run the same way in CI. A flat JSON file is enough for "one row per URL,
 * read/write on audit runs" — the interface below is the only thing that
 * would need to change to swap in Postgres/SQLite later (e.g. once this
 * pipeline runs across the whole portfolio, not just the IJSDS pilot).
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PageAudit } from "./types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "signals.db.json");

interface SignalsDb {
  [url: string]: PageAudit;
}

function load(): SignalsDb {
  if (!existsSync(DB_PATH)) return {};
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function persist(db: SignalsDb) {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function upsertSignal(audit: PageAudit): void {
  const db = load();
  db[audit.url] = audit;
  persist(db);
}

export function allSignals(): PageAudit[] {
  return Object.values(load());
}

export function getSignal(url: string): PageAudit | undefined {
  return load()[url];
}
