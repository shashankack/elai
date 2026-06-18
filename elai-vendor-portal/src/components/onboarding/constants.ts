export const ONBOARDING_STEPS = [
  {
    id: 'account',
    label: 'Account',
    title: 'Create your login',
    description: 'This email and password unlock your vendor dashboard after ELAI approves your store.',
  },
  {
    id: 'store',
    label: 'Storefront',
    title: 'Tell us about your brand',
    description: 'Your store name and story appear across the ELAI marketplace.',
  },
  {
    id: 'business',
    label: 'Business',
    title: 'Legal & tax details',
    description: 'We verify GST and business identity before listing goes live.',
  },
  {
    id: 'bank',
    label: 'Payouts',
    title: 'Bank & documents',
    description: 'Settlement details for when ELAI pays you for orders.',
  },
] as const

export const ELAI = {
  cream: '#FFF7D4',
  green: '#34421E',
  greenMuted: 'rgba(52, 66, 30, 0.72)',
  greenSoft: 'rgba(52, 66, 30, 0.08)',
  border: 'rgba(52, 66, 30, 0.14)',
} as const
