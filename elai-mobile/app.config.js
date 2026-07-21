/**
 * Expo config — extends app.json with runtime env for EAS / local builds.
 * Bundle IDs and UPI query schemes are required for store + Razorpay.
 */
module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    bundleIdentifier: 'co.elaai.app',
    supportsTablet: true,
    infoPlist: {
      ...(config.ios?.infoPlist || {}),
      LSApplicationQueriesSchemes: ['tez', 'phonepe', 'paytmmp'],
    },
  },
  android: {
    ...config.android,
    package: 'co.elaai.app',
  },
  plugins: [...(config.plugins || []), 'expo-dev-client'],
  extra: {
    ...(config.extra || {}),
    EXPO_PUBLIC_MEDUSA_URL: process.env.EXPO_PUBLIC_MEDUSA_URL,
    EXPO_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY:
      process.env.EXPO_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY,
    EXPO_PUBLIC_RAZORPAY_KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
    eas: {
      projectId:
        process.env.EAS_PROJECT_ID || config.extra?.eas?.projectId,
    },
  },
})
