import { Loading } from '@/components/loading'
import { Colors, FontFamily, Radii, Spacing } from '@/constants/theme'
import { useAuth } from '@/context/auth-context'
import { formatPrice } from '@/lib/format-price'
import {
  flattenOrderGroup,
  listCustomerOrderGroups,
  orderGroupLabel,
  orderGroupTotal,
  type StoreOrderGroup,
} from '@/lib/order-groups'
import {
  asOrderLike,
  presentOrderStatus,
  statusPillColors,
} from '@/lib/orders'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

type AuthMode = 'login' | 'register'

export default function AccountScreen() {
  const router = useRouter()
  const colors = Colors.light
  const { customer, loading, error, login, register, logout } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orders, setOrders] = useState<StoreOrderGroup[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const fetched = await listCustomerOrderGroups({ limit: 20 })
      setOrders(fetched)
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (customer) {
      fetchOrders()
    } else {
      setOrders([])
    }
  }, [customer, fetchOrders])

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Email and password are required.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!firstName || !lastName) {
          Alert.alert('Missing fields', 'First and last name are required.')
          return
        }
        await register(email, password, firstName, lastName)
      }
      setPassword('')
    } catch {
      // error surfaced via context
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
  }

  if (loading && !customer) {
    return <Loading message="Loading account..." />
  }

  if (!customer) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.authContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.text }]}>ELAI account</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Sign in to track orders and save your details at checkout.
        </Text>

        <View style={styles.modeRow}>
          <Pressable onPress={() => setMode('login')}>
            <Text
              style={[
                styles.modeLabel,
                { color: mode === 'login' ? colors.tint : colors.textMuted },
              ]}
            >
              Sign in
            </Text>
          </Pressable>
          <Pressable onPress={() => setMode('register')}>
            <Text
              style={[
                styles.modeLabel,
                { color: mode === 'register' ? colors.tint : colors.textMuted },
              ]}
            >
              Create account
            </Text>
          </Pressable>
        </View>

        {mode === 'register' && (
          <>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="First name"
              placeholderTextColor={colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="Last name"
              placeholderTextColor={colors.textMuted}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </>
        )}

        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.surface,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.surface,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : null}

        <Pressable
          style={[styles.primaryButton, { backgroundColor: colors.tint }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>
            {submitting
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </Text>
        </Pressable>
      </ScrollView>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.loggedInContent}
    >
      <View
        style={[
          styles.card,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {customer.first_name} {customer.last_name}
        </Text>
        <Text style={{ color: colors.textMuted }}>{customer.email}</Text>
      </View>

      <Pressable
        style={[styles.secondaryButton, { borderColor: colors.border }]}
        onPress={handleLogout}
      >
        <Text style={{ color: colors.text, fontWeight: '600' }}>Sign out</Text>
      </Pressable>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your orders</Text>

      {ordersLoading ? (
        <Loading message="Loading orders..." />
      ) : orders.length === 0 ? (
        <Text style={{ color: colors.textMuted }}>No orders yet.</Text>
      ) : (
        orders.map((group) => {
          const flat = flattenOrderGroup(group)
          const status = presentOrderStatus(asOrderLike(flat))
          const pill = statusPillColors(status.key, {
            tint: colors.tint,
            success: colors.success,
            error: colors.error,
            textMuted: colors.textMuted,
          })
          return (
            <Pressable
              key={group.id}
              style={[
                styles.orderCard,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.cardBackground,
                },
              ]}
              onPress={() =>
                router.push(`/order-confirmation/${group.id}?group=1`)
              }
            >
              <View style={styles.orderMain}>
                <Text style={[styles.orderId, { color: colors.text }]}>
                  Order {orderGroupLabel(group)}
                </Text>
                <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                  <Text style={[styles.pillText, { color: pill.text }]}>
                    {status.pill}
                  </Text>
                </View>
              </View>
              <Text style={{ color: colors.tint, fontWeight: '700' }}>
                {formatPrice(orderGroupTotal(group), flat.currency_code)}
              </Text>
            </Pressable>
          )
        })
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  loggedInContent: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: 30,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: 4,
  },
  cardTitle: {
    fontFamily: FontFamily.heading,
    fontSize: 24,
  },
  sectionTitle: {
    fontFamily: FontFamily.heading,
    fontSize: 22,
    marginTop: 8,
  },
  orderCard: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  orderMain: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
})
