/**
 * Hard-wipe admin catalog data (categories, collections, types, tags, attributes).
 * Uses SQL so soft-delete leftovers cannot block a reseed.
 *
 * Always clears orphan inventory (inventory items/levels) — products can be
 * deleted while inventory rows linger in Admin → Inventory.
 *
 * Does NOT touch: sellers, auth, regions, shipping, API keys, orders.
 * Use --with-products to also delete product / variant rows.
 *
 * Usage (from mercur/apps/api):
 *   bun run wipe:admin-catalog -- --force
 *   bun run wipe:admin-catalog -- --force --with-products
 *   bun run wipe:admin-catalog -- --force --reseed
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
    force: argv.includes("--force") || argv.includes("force"),
    withProducts:
      argv.includes("--with-products") || argv.includes("with-products"),
    reseed: argv.includes("--reseed") || argv.includes("reseed"),
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

async function tableExists(sql: SQL, name: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${name}
    LIMIT 1
  `
  return rows.length > 0
}

async function countRows(sql: SQL, table: string): Promise<number> {
  if (!(await tableExists(sql, table))) return 0
  const rows = await sql.unsafe(`SELECT COUNT(*)::int AS c FROM "${table}"`)
  return Number(rows[0]?.c ?? 0)
}

async function listMatchingTables(sql: SQL, patterns: string[]) {
  const rows = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `
  const names = rows.map((r: { table_name: string }) => r.table_name as string)
  return names.filter((name) =>
    patterns.some((p) => name.toLowerCase().includes(p.toLowerCase()))
  )
}

async function truncateTables(sql: SQL, tables: string[]) {
  const existing: string[] = []
  for (const table of [...new Set(tables)]) {
    if (await tableExists(sql, table)) {
      existing.push(table)
    }
  }
  if (!existing.length) return []

  await sql.unsafe(
    `TRUNCATE TABLE ${existing.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`
  )
  return existing
}

await loadEnvFile()

const { force, withProducts, reseed } = parseArgs(process.argv.slice(2))
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Add it to mercur/apps/api/.env")
  process.exit(1)
}

if (!force) {
  console.error(
    "Refusing to run without --force.\nExample: bun run wipe:admin-catalog -- --force"
  )
  process.exit(1)
}

const ddlUrl = databaseUrl.replace("-pooler.", ".")
let hostLabel = databaseUrl
try {
  const u = new URL(databaseUrl)
  hostLabel = `${u.hostname}${u.pathname}`
} catch {
  // keep raw
}

console.log(`\n=== Wipe admin catalog (hard delete) ===`)
console.log(`Database: ${hostLabel}`)
console.log(
  `Options: withProducts=${withProducts} reseed=${reseed}\n`
)

const sql = new SQL(ddlUrl)

try {
  const catalogTables = await listMatchingTables(sql, [
    "attribute",
    "product_category",
    "product_collection",
    "product_type",
    "product_tag",
    "vendor_product_attribute",
  ])

  // Always clear inventory leftovers (Admin → Inventory can outlive products)
  const inventoryTables = await listMatchingTables(sql, [
    "inventory_item",
    "inventory_level",
    "product_variant_inventory",
    "reservation_item",
  ])

  let productTables: string[] = []
  if (withProducts) {
    productTables = await listMatchingTables(sql, [
      "product_variant",
      "product_option",
      "product_image",
      "product_sales_channel",
      "product_shipping_profile",
      "image",
    ])
    // Exact product table last among product graph
    if (await tableExists(sql, "product")) {
      productTables.push("product")
    }
  }

  const reportTables = [
    ...catalogTables,
    ...inventoryTables,
    ...productTables,
    "product_tag",
    "inventory_item",
    "inventory_level",
    "product",
  ]

  console.log("Before wipe:")
  for (const t of [...new Set(reportTables)].sort()) {
    if (!(await tableExists(sql, t))) continue
    console.log(`  ${t}: ${await countRows(sql, t)}`)
  }
  console.log("")

  const coreTables = [
    // attributes
    "attribute_value",
    "attribute_possible_value",
    "attribute",
    "vendor_product_attribute",
    // taxonomy
    "product_category_product",
    "product_collection_product",
    "product_tag_product",
    "product_category",
    "product_collection",
    "product_type",
    "product_product_type",
    "product_tag",
    // inventory (always — orphans after product delete)
    "reservation_item",
    "product_variant_inventory_item",
    "inventory_level",
    "inventory_item",
  ]

  const toWipe = [
    ...coreTables,
    ...catalogTables,
    ...inventoryTables,
    ...productTables,
  ]

  console.log("Truncating...")
  const wiped = await truncateTables(sql, toWipe)
  for (const t of wiped) {
    console.log(`  truncated ${t}`)
  }

  // Seller↔inventory link tables (Medusa remote links)
  const sellerInvLinks = await listMatchingTables(sql, [
    "inventory_item_seller",
    "seller_inventory",
  ])
  if (sellerInvLinks.length) {
    const extra = await truncateTables(sql, sellerInvLinks)
    for (const t of extra) {
      console.log(`  truncated ${t}`)
    }
  }

  console.log("\nAfter wipe:")
  for (const t of [
    "attribute",
    "product_category",
    "product_collection",
    "product_type",
    "product_tag",
    "inventory_item",
    "inventory_level",
    "product",
  ]) {
    const c = await countRows(sql, t)
    console.log(`  ${t}: ${c}`)
  }

  console.log("\n=== Admin catalog wipe complete ===")
  if (reseed) {
    console.log(
      "\n--reseed: catalog will be recreated next (admin will not stay empty).\n"
    )
  } else {
    console.log(
      "\nAdmin catalog + inventory are empty. Run `bun run seed:elai-catalog` when you want taxonomy back.\n"
    )
  }
} finally {
  await sql.close()
}

if (reseed) {
  console.log("Seeding ELAI catalog...")
  await run("bun", ["run", "seed:elai-catalog"])
  console.log("Reseed done.\n")
}
