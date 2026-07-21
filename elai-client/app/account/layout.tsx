import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Account | Elai',
  description: 'Sign in or manage your Elai customer account.',
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
