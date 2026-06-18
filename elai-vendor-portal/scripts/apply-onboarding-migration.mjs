import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

function loadEnvFile() {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env')

  try {
    const envContent = readFileSync(envPath, 'utf8')

    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) continue

      const key = trimmed.slice(0, separatorIndex).trim()
      let value = trimmed.slice(separatorIndex + 1).trim()

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // Ignore if .env is missing.
  }
}

loadEnvFile()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

const migrationPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../supabase/migrations/002_add_onboarding_fields.sql'
)
const migrationSql = readFileSync(migrationPath, 'utf8')

async function columnsExist() {
  const supabase = createClient(url, serviceRoleKey)
  const { error } = await supabase.from('KYCApplication').select('aboutUs').limit(1)

  if (!error) return true

  const message = error.message || ''
  if (error.code === 'PGRST204' || message.includes('aboutUs') || message.includes('schema cache')) {
    return false
  }

  throw new Error(error.message)
}

async function applyWithPg() {
  const { default: pg } = await import('pg')
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })

  await client.connect()
  try {
    await client.query(migrationSql)
  } finally {
    await client.end()
  }
}

async function main() {
  if (!url || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
  }

  if (await columnsExist()) {
    console.log('Onboarding columns already exist. Nothing to do.')
    return
  }

  if (dbUrl) {
    console.log('Applying migration via SUPABASE_DB_URL...')
    await applyWithPg()

    if (await columnsExist()) {
      console.log('Migration applied successfully.')
      return
    }

    console.error('Migration ran but columns are still missing.')
    process.exit(1)
  }

  console.error('Onboarding columns are missing from KYCApplication.')
  console.error('\nRun this SQL in Supabase Dashboard → SQL Editor → New query:\n')
  console.error(migrationSql)
  console.error(
    '\nOr add SUPABASE_DB_URL to .env (Database → Connection string → URI) and run:\n  npm run migrate:onboarding\n'
  )
  process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
