/**
 * Wipe the Mercur/Medusa Postgres database (drops public schema).
 *
 * Usage (from mercur/apps/api):
 *   bun run wipe-db
 *   bun run wipe-db -- --force          # skip confirmation
 *   bun run wipe-db -- --force --seed   # wipe, migrate, platform seed + ELAI catalog
 *   bun run wipe-db:reset               # same as --force --seed
 *
 * --seed runs:
 *   1. seed               India platform (region, shipping, API key; no products/stores)
 *   2. seed:elai-catalog  types, categories, collections, attributes
 *
 * Requires DATABASE_URL in .env (Neon or local Postgres).
 * Non-dev hosts are blocked unless MERCUR_ALLOW_WIPE_DB=1.
 */
import { SQL } from "bun"
import { spawn } from "node:child_process"
import { resolve } from "node:path"

async function loadEnvFile() {
  const envPath = resolve(import.meta.dir, "../../.env")
  const file = Bun.file(envPath)
  if (!(await file.exists())) return

  const text = await file.text()
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function parseArgs(argv: string[]) {
  return {
    force: argv.includes("--force"),
    seed: argv.includes("--seed"),
    migrate: argv.includes("--migrate") || argv.includes("--seed"),
  }
}

function run(cmd: string, args: string[]) {
  return new Promise<void>((resolvePromise, reject) => {
    const child = spawn(cmd, args, {
      cwd: resolve(import.meta.dir, "../.."),
      stdio: "inherit",
      shell: true,
      env: process.env,
    })
    child.on("exit", (code) => {
      if (code === 0) resolvePromise()
      else reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`))
    })
  })
}

await loadEnvFile()

const { force, seed, migrate } = parseArgs(process.argv.slice(2))
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Add it to mercur/apps/api/.env")
  process.exit(1)
}

function looksLikeDevDb(url: string) {
  const s = url.toLowerCase()
  return (
    s.includes("localhost") ||
    s.includes("127.0.0.1") ||
    s.includes("neondb") ||
    s.includes("neon.tech")
  )
}

if (!looksLikeDevDb(databaseUrl) && process.env.MERCUR_ALLOW_WIPE_DB !== "1") {
  console.error(
    "Safety block: DATABASE_URL does not look like a local/Neon dev DB.\n" +
      "Refusing to wipe unless MERCUR_ALLOW_WIPE_DB=1 is set.",
  )
  process.exit(1)
}

// Prefer direct Neon host for DDL when a pooler URL is used
const ddlUrl = databaseUrl.replace("-pooler.", ".")

let hostLabel = databaseUrl
try {
  const u = new URL(databaseUrl)
  hostLabel = `${u.hostname}${u.pathname}`
} catch {
  // keep raw
}

console.log(`\nAbout to WIPE database: ${hostLabel}`)
console.log("This drops ALL tables in the public schema.\n")

if (!force) {
  const answer = prompt("Type YES to continue: ")
  if (answer !== "YES") {
    console.log("Aborted.")
    process.exit(0)
  }
}

const sql = new SQL(ddlUrl)

try {
  console.log("Dropping public schema...")
  await sql.unsafe("DROP SCHEMA IF EXISTS public CASCADE")
  console.log("Recreating public schema...")
  await sql.unsafe("CREATE SCHEMA public")
  await sql.unsafe("GRANT ALL ON SCHEMA public TO public")
  await sql.unsafe("GRANT ALL ON SCHEMA public TO CURRENT_USER")
  console.log("Database wiped.\n")
} finally {
  await sql.close()
}

if (migrate) {
  console.log("Running migrations...")
  await run("bunx", ["medusa", "db:migrate"])
  console.log("Migrations done.\n")
}

if (seed) {
  console.log("Seeding platform (no products / seller stores)...")
  await run("bun", ["run", "seed"])
  console.log("Platform seed done.\n")

  console.log("Seeding ELAI catalog (types / categories / collections / attributes)...")
  await run("bun", ["run", "seed:elai-catalog"])
  console.log("Catalog seed done.\n")
}

console.log("Done.")
