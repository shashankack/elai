/**
 * Bun wrapper so --email / flags are not eaten by Medusa CLI.
 *
 * Usage (from mercur/apps/api):
 *   bun run seed:elai-products -- seller@example.com
 *   bun run seed:elai-products -- --email=seller@example.com --dry-run
 *   bun run seed:elai-products -- seller@example.com --require-open
 */
import { spawn } from "node:child_process"
import { resolve } from "node:path"

const argv = process.argv.slice(2)

const emailFromFlag = argv
  .find((a) => a.startsWith("--email="))
  ?.slice("--email=".length)
const emailPositional = argv.find((a) => a.includes("@") && !a.startsWith("--"))
const email = (emailFromFlag || emailPositional || "").trim().toLowerCase()

const dryRun = argv.some((a) => a.replace(/^--/, "") === "dry-run")
const requireOpen = argv.some((a) => a.replace(/^--/, "") === "require-open")

if (!email || !email.includes("@")) {
  console.error(
    "Email required. Example:\n  bun run seed:elai-products -- seller@example.com"
  )
  process.exit(1)
}

const forwarded = [email]
if (dryRun) forwarded.push("dry-run")
if (requireOpen) forwarded.push("require-open")

const child = spawn(
  "bun",
  ["x", "medusa", "exec", "./src/scripts/seed-elai-products.ts", ...forwarded],
  {
    cwd: resolve(import.meta.dir, "../.."),
    stdio: "inherit",
    shell: true,
    env: process.env,
  }
)

child.on("exit", (code) => process.exit(code ?? 1))
