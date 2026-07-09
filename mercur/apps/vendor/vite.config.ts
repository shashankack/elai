import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { mercurDashboardPlugin } from '@mercurjs/dashboard-sdk'

const appDir = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(appDir, '../..')
const vendorDist = path.resolve(monorepoRoot, 'packages/vendor/dist')

function reloadOnVendorPackageRebuild(): Plugin {
  return {
    name: 'reload-on-vendor-package-rebuild',
    configureServer(server) {
      server.watcher.add(vendorDist)
      server.watcher.on('change', (file) => {
        if (file.includes(`${path.sep}packages${path.sep}vendor${path.sep}dist${path.sep}`)) {
          server.ws.send({ type: 'full-reload', path: '*' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl =
    env.VITE_MERCUR_BACKEND_URL || env.MERCUR_BACKEND_URL

  return {
    plugins: [
      react(),
      reloadOnVendorPackageRebuild(),
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
      exclude: ['@medusajs/dashboard', '@mercurjs/vendor'],
    },
    server: {
      fs: {
        allow: [monorepoRoot],
      },
    },
  }
})
