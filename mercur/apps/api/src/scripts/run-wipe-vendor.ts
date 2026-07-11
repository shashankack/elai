/**
 * Bun wrapper so --force / email are not eaten by Medusa CLI.
 *
 * Usage (from mercur/apps/api):
 *   bun run wipe:vendor -- seller@example.com --force
 */
import { spawn } from "node:child_process"
import { resolve } from "node:path"

const argv = process.argv.slice(2)
const email = argv.find((a) => a.includes("@"))
const force = argv.includes("--force") || argv.includes("force")

if (!email) {
  console.error(
    "Email required. Example: bun run wipe:vendor -- seller@example.com --force"
  )
  process.exit(1)
}

const forwarded = [email]
if (force) {
  forwarded.push("force")
}

const child = spawn(
  "bun",
  ["x", "medusa", "exec", "./src/scripts/wipe-vendor.ts", ...forwarded],
  {
    cwd: resolve(import.meta.dir, "../.."),
    stdio: "inherit",
    shell: true,
    env: process.env,
  }
)

child.on("exit", (code) => process.exit(code ?? 1))
