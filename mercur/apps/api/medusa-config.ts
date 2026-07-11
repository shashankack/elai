import { loadEnv } from '@medusajs/framework/utils'
import { withMercur } from '@mercurjs/core'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const isLocalDb =
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes('localhost') ||
  process.env.DATABASE_URL.includes('127.0.0.1')

const hasResend = Boolean(process.env.RESEND_API_KEY)

const notificationProviders = [
  {
    resolve: '@medusajs/medusa/notification-local',
    id: 'local',
    options: {
      channels: ['feed', 'seller_feed'],
    },
  },
  ...(hasResend
    ? [
        {
          resolve: './src/modules/resend',
          id: 'resend',
          options: {
            channels: ['email'],
            api_key: process.env.RESEND_API_KEY,
            from: process.env.RESEND_FROM_EMAIL || 'Elai <hello@elaai.co>',
          },
        },
      ]
    : [
        // Logs email payloads locally when Resend is not configured
        {
          resolve: '@medusajs/medusa/notification-local',
          id: 'local-email',
          options: {
            channels: ['email'],
          },
        },
      ]),
]

module.exports = withMercur({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    // Neon cold starts: wait longer when acquiring a pool connection (Tarn option).
    databaseDriverOptions: {
      ...(!isLocalDb
        ? {
            connection: {
              ssl: { rejectUnauthorized: false },
            },
          }
        : {}),
      pool: {
        acquireTimeoutMillis: 30000,
        createRetryIntervalMillis: 200,
      },
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      vendorCors: process.env.VENDOR_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  featureFlags: {
    seller_registration: true
  },
  modules: [
    {
      resolve: '@mercurjs/core/modules/admin-ui',
      options: {
        appDir: '',
        path: '/dashboard',
        disable: true
      }
    },
    {
      resolve: '@mercurjs/core/modules/vendor-ui',
      options: {
        appDir: '',
        path: '/seller',
        disable: true
      }
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: notificationProviders,
      },
    },
  ],
})
