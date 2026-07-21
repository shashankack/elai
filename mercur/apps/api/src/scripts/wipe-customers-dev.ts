/**
 * Dev-only wipe: remove ALL storefront customer data while keeping admin + vendors.
 *
 * Deletes:
 * - customers, addresses, carts, order groups, and other rows referencing customer_id
 * - customer auth identities (emailpass)   including orphan identities left after
 *   a partial signup or admin "delete customer" (which does not remove auth)
 *
 * Preserves auth for emails found in `user` (admin) and `member` (vendor) tables.
 *
 * Usage (from mercur/apps/api):
 *   bun run wipe:customers-dev -- --dry-run
 *   bun run wipe:customers-dev -- --force
 */

import { SQL } from "bun"
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
    dryRun: argv.includes("--dry-run") || argv.includes("dryrun"),
  }
}

function quoteIdent(name: string) {
  return `"${name.replace(/"/g, '""')}"`
}

function looksLikeDevDb(databaseUrl: string) {
  const s = databaseUrl.toLowerCase()
  return (
    s.includes("localhost") ||
    s.includes("127.0.0.1") ||
    s.includes("neondb") ||
    s.includes("neon.tech")
  )
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

async function columnExists(
  sql: SQL,
  table: string,
  column: string,
): Promise<boolean> {
  const rows = await sql`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
      AND column_name = ${column}
    LIMIT 1
  `
  return rows.length > 0
}

async function listTablesWithColumn(sql: SQL, column: string) {
  const rows = await sql`
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = ${column}
    ORDER BY table_name
  `
  return rows.map((r: { table_name: string }) => r.table_name as string)
}

async function countRows(sql: SQL, table: string) {
  if (!(await tableExists(sql, table))) return 0
  const rows = await sql.unsafe(
    `SELECT COUNT(*)::int AS c FROM ${quoteIdent(table)}`,
  )
  return Number(rows[0]?.c ?? 0)
}

async function loadPreserveEmails(sql: SQL): Promise<string[]> {
  const emails = new Set<string>()

  if (await tableExists(sql, "user")) {
    const hasDeleted = await columnExists(sql, "user", "deleted_at")
    const rows = hasDeleted
      ? await sql.unsafe(
          `SELECT lower(${quoteIdent("email")}) AS email FROM ${quoteIdent("user")} WHERE ${quoteIdent("email")} IS NOT NULL AND ${quoteIdent("deleted_at")} IS NULL`,
        )
      : await sql.unsafe(
          `SELECT lower(${quoteIdent("email")}) AS email FROM ${quoteIdent("user")} WHERE ${quoteIdent("email")} IS NOT NULL`,
        )
    for (const row of rows as { email?: string }[]) {
      if (row.email) emails.add(row.email)
    }
  }

  if (await tableExists(sql, "member")) {
    const hasDeleted = await columnExists(sql, "member", "deleted_at")
    const rows = hasDeleted
      ? await sql.unsafe(
          `SELECT lower(${quoteIdent("email")}) AS email FROM ${quoteIdent("member")} WHERE ${quoteIdent("email")} IS NOT NULL AND ${quoteIdent("deleted_at")} IS NULL`,
        )
      : await sql.unsafe(
          `SELECT lower(${quoteIdent("email")}) AS email FROM ${quoteIdent("member")} WHERE ${quoteIdent("email")} IS NOT NULL`,
        )
    for (const row of rows as { email?: string }[]) {
      if (row.email) emails.add(row.email)
    }
  }

  return [...emails]
}

async function main() {
  await loadEnvFile()
  const { force, dryRun } = parseArgs(process.argv.slice(2))

  if (!force && !dryRun) {
    console.error(
      "Refusing to wipe customers without --force.\n" +
        "Dry-run example:\n" +
        "  bun run wipe:customers-dev -- --dry-run\n\n" +
        "Real wipe example:\n" +
        "  bun run wipe:customers-dev -- --force",
    )
    process.exit(1)
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Add it to mercur/apps/api/.env")
    process.exit(1)
  }

  if (
    !looksLikeDevDb(databaseUrl) &&
    process.env.MERCUR_WIPE_CUSTOMERS_DEV !== "1"
  ) {
    console.error(
      "Safety block: this does not look like a local/Neon dev DB.\n" +
        "Refusing to run unless MERCUR_WIPE_CUSTOMERS_DEV=1 is set.",
    )
    process.exit(1)
  }

  const ddlUrl = databaseUrl.replace("-pooler.", ".")
  const sql = new SQL(ddlUrl)

  try {
    console.log("\n=== wipe-customers-dev ===")
    console.log(`dryRun=${dryRun}`)

    const preserveEmails = await loadPreserveEmails(sql)
    console.log(`Preserving auth for ${preserveEmails.length} admin/vendor email(s)`)

    const customerCount = (await tableExists(sql, "customer"))
      ? await countRows(sql, "customer")
      : 0
    console.log(`Customers in DB: ${customerCount}`)

    const actions: { description: string; sql: string }[] = []

    const orderGroupExists = await tableExists(sql, "order_group")
    const cartExists = await tableExists(sql, "cart")
    const orderGroupHasCustomerId =
      orderGroupExists &&
      (await columnExists(sql, "order_group", "customer_id"))
    const cartHasCustomerId =
      cartExists && (await columnExists(sql, "cart", "customer_id"))

    const customerIdTables = (await listTablesWithColumn(sql, "customer_id"))
      .filter((t) => t !== "customer" && t !== "auth_identity")
    const cartIdTables = (await listTablesWithColumn(sql, "cart_id")).filter(
      (t) => t !== "cart",
    )
    const orderGroupIdTables = (
      await listTablesWithColumn(sql, "order_group_id")
    ).filter((t) => t !== "order_group")

    if (orderGroupHasCustomerId) {
      if (
        (await tableExists(sql, "order_group_order")) &&
        (await columnExists(sql, "order_group_order", "order_group_id"))
      ) {
        actions.push({
          description: "delete order_group_order rows for customer order groups",
          sql: `DELETE FROM ${quoteIdent("order_group_order")} WHERE ${quoteIdent(
            "order_group_id",
          )} IN (SELECT ${quoteIdent("id")} FROM ${quoteIdent("order_group")} WHERE ${quoteIdent(
            "customer_id",
          )} IS NOT NULL)`,
        })
      }

      actions.push({
        description: "delete order_group rows linked to customers",
        sql: `DELETE FROM ${quoteIdent("order_group")} WHERE ${quoteIdent(
          "customer_id",
        )} IS NOT NULL`,
      })
    }

    if (cartHasCustomerId && (await tableExists(sql, "customer"))) {
      actions.push({
        description: "delete cart rows linked to customers",
        sql: `DELETE FROM ${quoteIdent("cart")} WHERE ${quoteIdent(
          "customer_id",
        )} IN (SELECT ${quoteIdent("id")} FROM ${quoteIdent("customer")})`,
      })
    }

    for (const t of customerIdTables) {
      actions.push({
        description: `delete rows from ${t} referencing customers`,
        sql: `DELETE FROM ${quoteIdent(t)} WHERE ${quoteIdent("customer_id")} IN (SELECT ${quoteIdent(
          "id",
        )} FROM ${quoteIdent("customer")})`,
      })
    }

    if (cartHasCustomerId && (await tableExists(sql, "customer"))) {
      for (const t of cartIdTables) {
        actions.push({
          description: `delete rows from ${t} referencing customer carts`,
          sql: `DELETE FROM ${quoteIdent(t)} WHERE ${quoteIdent("cart_id")} IN (SELECT ${quoteIdent(
            "id",
          )} FROM ${quoteIdent("cart")} WHERE ${quoteIdent("customer_id")} IN (SELECT ${quoteIdent(
            "id",
          )} FROM ${quoteIdent("customer")}))`,
        })
      }
    }

    if (orderGroupHasCustomerId) {
      for (const t of orderGroupIdTables) {
        actions.push({
          description: `delete rows from ${t} referencing customer order groups`,
          sql: `DELETE FROM ${quoteIdent(t)} WHERE ${quoteIdent("order_group_id")} IN (SELECT ${quoteIdent(
            "id",
          )} FROM ${quoteIdent("order_group")} WHERE ${quoteIdent("customer_id")} IS NOT NULL)`,
        })
      }
    }

    if (await tableExists(sql, "customer")) {
      actions.push({
        description: "delete all customer rows",
        sql: `DELETE FROM ${quoteIdent("customer")}`,
      })
    }

    // Auth cleanup   critical for re-registration after admin delete or partial signup.
    if (await tableExists(sql, "provider_identity")) {
      if (preserveEmails.length) {
        const placeholders = preserveEmails.map((e) => `'${e.replace(/'/g, "''")}'`).join(", ")
        actions.push({
          description:
            "delete customer emailpass provider identities (preserve admin/vendor emails)",
          sql: `DELETE FROM ${quoteIdent("provider_identity")} WHERE ${quoteIdent(
            "provider",
          )} = 'emailpass' AND lower(${quoteIdent("entity_id")}) NOT IN (${placeholders})`,
        })
      } else {
        actions.push({
          description: "delete all emailpass provider identities",
          sql: `DELETE FROM ${quoteIdent("provider_identity")} WHERE ${quoteIdent(
            "provider",
          )} = 'emailpass'`,
        })
      }
    }

    if (await tableExists(sql, "auth_identity")) {
      if (await columnExists(sql, "auth_identity", "app_metadata")) {
        actions.push({
          description: "delete auth identities linked to deleted customers",
          sql: `DELETE FROM ${quoteIdent("auth_identity")} WHERE (${quoteIdent(
            "app_metadata",
          )} ->> 'customer_id') IS NOT NULL`,
        })
      }

      if (await tableExists(sql, "provider_identity")) {
        actions.push({
          description: "delete auth identities with no remaining providers",
          sql: `DELETE FROM ${quoteIdent("auth_identity")} ai WHERE NOT EXISTS (SELECT 1 FROM ${quoteIdent(
            "provider_identity",
          )} pi WHERE pi.${quoteIdent("auth_identity_id")} = ai.${quoteIdent("id")})`,
        })
      }
    }

    console.log(`Planned actions: ${actions.length}`)
    if (dryRun) {
      console.log("\n--- Dry-run preview ---")
      for (const a of actions) {
        console.log(`• ${a.description}`)
      }
      return
    }

    console.log("\n--- Executing ---")
    for (const a of actions) {
      console.log(`→ ${a.description}`)
      await sql.unsafe(a.sql)
    }

    const remainingCustomers = (await tableExists(sql, "customer"))
      ? await countRows(sql, "customer")
      : 0
    let remainingCustomerAuth = 0
    if (await tableExists(sql, "provider_identity")) {
      if (preserveEmails.length) {
        const placeholders = preserveEmails
          .map((e) => `'${e.replace(/'/g, "''")}'`)
          .join(", ")
        const rows = await sql.unsafe(
          `SELECT COUNT(*)::int AS c FROM ${quoteIdent("provider_identity")} WHERE ${quoteIdent(
            "provider",
          )} = 'emailpass' AND lower(${quoteIdent("entity_id")}) NOT IN (${placeholders})`,
        )
        remainingCustomerAuth = Number(rows[0]?.c ?? 0)
      } else {
        remainingCustomerAuth = await countRows(sql, "provider_identity")
      }
    }

    console.log(`\nRemaining customers: ${remainingCustomers}`)
    console.log(`Remaining non-admin/vendor emailpass identities: ${remainingCustomerAuth}`)
    console.log("\n=== wipe-customers-dev complete ===\n")
  } finally {
    await sql.close()
  }
}

await main()
