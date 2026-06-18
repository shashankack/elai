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
    // Ignore if .env is missing; env vars may already be set in the shell.
  }
}

loadEnvFile()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'kyc-documents'

if (!url || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey)

async function main() {
  console.log('Checking Supabase connection...')
  console.log('Project URL:', url)

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id')
    .limit(1)

  if (usersError) {
    console.error('Database check failed:', usersError.message)
    console.error('\nDid you run supabase/setup.sql in the SQL Editor?')
    process.exit(1)
  }

  console.log('Database OK (users table reachable)')

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error('Storage check failed:', bucketsError.message)
    process.exit(1)
  }

  const hasBucket = buckets?.some((b) => b.name === bucket)

  if (!hasBucket) {
    console.warn(`Storage bucket "${bucket}" not found.`)
    console.warn('Create it in Supabase Dashboard → Storage → New bucket (keep private).')
  } else {
    console.log(`Storage OK (bucket "${bucket}" exists)`)
  }

  const { data: admins, error: adminError } = await supabase
    .from('AdminUser')
    .select('userId')
    .limit(1)

  if (adminError) {
    console.error('AdminUser check failed:', adminError.message)
    process.exit(1)
  }

  console.log(`Admin seed OK (${admins?.length ?? 0} admin row(s))`)

  const { error: onboardingError } = await supabase
    .from('KYCApplication')
    .select('aboutUs')
    .limit(1)

  if (onboardingError?.code === 'PGRST204' || onboardingError?.message?.includes('aboutUs')) {
    console.warn('\nOnboarding columns missing on KYCApplication.')
    console.warn('Run: npm run migrate:onboarding')
    console.warn('Or execute supabase/migrations/002_add_onboarding_fields.sql in the SQL Editor.')
    process.exit(1)
  }

  if (onboardingError) {
    console.error('KYCApplication check failed:', onboardingError.message)
    process.exit(1)
  }

  console.log('Onboarding columns OK')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
