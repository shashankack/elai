import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { mercurDashboardPlugin } from '@mercurjs/dashboard-sdk'

const appDir = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(appDir, '../..')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl =
    env.VITE_MERCUR_BACKEND_URL || env.MERCUR_BACKEND_URL

  return {
    plugins: [
      react(),
      mercurDashboardPlugin({
        medusaConfigPath: '../api/medusa-config.ts',
        name: 'ELAI',
        logo: '/logo.png',
        enableSellerRegistration: true,
        ...(backendUrl ? { backendUrl } : {}),
        components: {
          StoreSetup: 'components/store-setup/store-setup',
        },
      }),
    ],
    resolve: {
      alias: {
        'lodash/debounce': path.resolve(appDir, 'node_modules/lodash.debounce'),
      },
    },
    optimizeDeps: {
      exclude: ['@medusajs/dashboard'],
    },
    server: {
      fs: {
        allow: [monorepoRoot],
      },
    },
  }
})
