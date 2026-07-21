/**
 * Bun wrapper so --force is not eaten by Medusa CLI.
 *
 * Usage (from mercur/apps/api):
 *   bun run link:razorpay -- --force
 */
import { spawn } from "node:child_process"
import { resolve } from "node:path"

const argv = process.argv.slice(2)
const force = argv.includes("--force") || argv.includes("force")

if (!force) {
  console.error(
    "Refusing without --force.\nExample: bun run link:razorpay -- --force",
  )
  process.exit(1)
}

const child = spawn(
  "bun",
  ["x", "medusa", "exec", "./src/scripts/link-razorpay.ts", "force"],
  {
    cwd: resolve(import.meta.dir, "../.."),
    stdio: "inherit",
    shell: true,
    env: process.env,
  },
)

child.on("exit", (code) => process.exit(code ?? 1))
